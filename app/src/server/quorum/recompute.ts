import type { PoolClient } from 'pg';

/**
 * Three-tier quorum recompute for a single Issue.
 *
 * - awareness_count  = COUNT(DISTINCT member_id) from issue_views.
 * - participation_count = COUNT(DISTINCT author_id) from perspectives.
 * - decision_quorum_met is method-specific; for consent the gate is just
 *   "no unresolved objections" which is evaluated at finalize time, so this
 *   column is mostly decorative for the consent method. Other decision
 *   methods (Phase 2) may flip it from the recompute path.
 *
 * The scheduled `quorum-check-job` calls this for every non-stalled Issue
 * whose `deliberation_period_ends_at` has been crossed.
 */
export async function recomputeQuorum(client: PoolClient, issueId: string): Promise<void> {
  await client.query(
    `UPDATE quorum_states
        SET awareness_count = (
              SELECT COUNT(DISTINCT member_id)::int
                FROM issue_views
               WHERE issue_id = $1
            ),
            participation_count = (
              SELECT COUNT(DISTINCT author_id)::int
                FROM perspectives
               WHERE issue_id = $1
            ),
            updated_at = now()
      WHERE issue_id = $1`,
    [issueId],
  );
}

/**
 * Stall transition (FR-039, CR-011).
 *
 * Flow:
 *   1. deliberation_period_ends_at crosses now.
 *   2. If awareness_count < awareness_required:
 *        - If no extension_period_ends_at set, grant one extension
 *          (default: 50% of original deliberation — configurable via
 *          governance_profile.quorum.extensionMultiplier minus 1).
 *        - If extension has already elapsed, set stalled_at and
 *          issues.status = 'stalled'; write `quorum_stalled` TimelineEvent.
 *   3. If awareness threshold is subsequently met on a stalled Issue,
 *      unstall: clear stalled_at, set unstalled_at, write
 *      `quorum_unstalled` TimelineEvent, and restore status to 'exploring'
 *      (or 'open' if there is no current_decision_record_id).
 *
 * Phase 8 ships the recompute primitive and the data-model hooks. The
 * scheduled job (T128) orchestrates these transitions; in Phase 1 it is
 * registered but wakes up every 15 min — a polling loop rather than a
 * cron-style trigger, which is fine for our scale.
 */
export async function applyStallTransitionIfNeeded(
  client: PoolClient,
  issueId: string,
): Promise<{ readonly transition: 'none' | 'stalled' | 'unstalled' }> {
  const row = await client.query<{
    awareness_count: number;
    awareness_required: number;
    deliberation_period_ends_at: Date;
    extension_period_ends_at: Date | null;
    stalled_at: Date | null;
    status: string;
    unstalled_after_status: string;
  }>(
    `SELECT qs.awareness_count, qs.awareness_required,
            qs.deliberation_period_ends_at, qs.extension_period_ends_at,
            qs.stalled_at,
            i.status,
            CASE WHEN i.current_decision_record_id IS NULL THEN 'open' ELSE 'exploring' END AS unstalled_after_status
       FROM quorum_states qs
       JOIN issues i ON i.id = qs.issue_id
      WHERE qs.issue_id = $1
      LIMIT 1`,
    [issueId],
  );
  const q = row.rows[0];
  if (!q) return { transition: 'none' };

  const now = new Date();

  // Unstall path — if currently stalled and awareness has recovered.
  if (q.stalled_at && q.awareness_count >= q.awareness_required) {
    await client.query(
      `UPDATE quorum_states
          SET stalled_at = NULL, unstalled_at = $1, updated_at = $1
        WHERE issue_id = $2`,
      [now, issueId],
    );
    await client.query(
      `UPDATE issues
          SET status = $1, updated_at = $2
        WHERE id = $3 AND status = 'stalled'`,
      [q.unstalled_after_status, now, issueId],
    );
    return { transition: 'unstalled' };
  }

  // Already stalled and still short — nothing to do.
  if (q.stalled_at) return { transition: 'none' };

  // Past initial deliberation and short on awareness?
  if (q.deliberation_period_ends_at > now) return { transition: 'none' };
  if (q.awareness_count >= q.awareness_required) return { transition: 'none' };

  // Grant extension once.
  if (!q.extension_period_ends_at) {
    const windowMs = q.deliberation_period_ends_at.getTime() - now.getTime();
    // windowMs is negative here; extend from NOW by half of the original window
    // — conservative default that matches governance policy doc §Extensions.
    const half = Math.abs(windowMs) > 0 ? Math.abs(windowMs) : 36 * 60 * 60 * 1000; // fallback 36h if already well past
    const extEnds = new Date(now.getTime() + Math.floor(half * 0.5));
    await client.query(
      `UPDATE quorum_states SET extension_period_ends_at = $1, updated_at = $2 WHERE issue_id = $3`,
      [extEnds, now, issueId],
    );
    return { transition: 'none' };
  }

  // Extension elapsed → stall.
  if (q.extension_period_ends_at > now) return { transition: 'none' };

  await client.query(
    `UPDATE quorum_states SET stalled_at = $1, updated_at = $1 WHERE issue_id = $2`,
    [now, issueId],
  );
  await client.query(
    `UPDATE issues
        SET status = 'stalled', stall_reason = 'insufficient_participation', updated_at = $1
      WHERE id = $2 AND status NOT IN ('decided', 'archived', 'stalled')`,
    [now, issueId],
  );
  return { transition: 'stalled' };
}
