import type { PoolClient } from 'pg';
import { getPool } from '@/db';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Unstall an Issue whose awareness quorum has recovered (FR-039, CR-011).
 *
 * Called by the `quorum-check-job` via `applyStallTransitionIfNeeded` when
 * `awareness_count >= awareness_required` on a stalled Issue. This module
 * provides a direct entry-point for tests and administrative use.
 *
 * On unstall the Issue reverts to:
 *   - 'exploring' if a Decision Record exists on the Issue
 *   - 'open' otherwise
 */

export async function unstallIssue(args: {
  readonly issueId: string;
  readonly actorMemberId?: string;
}): Promise<void> {
  const client: PoolClient = await getPool().connect();
  try {
    await client.query('BEGIN');

    const now = new Date();

    // Determine the correct revert status.
    const issueRow = await client.query<{ current_decision_record_id: string | null }>(
      `SELECT current_decision_record_id FROM issues WHERE id = $1 LIMIT 1`,
      [args.issueId],
    );
    const revertStatus = issueRow.rows[0]?.current_decision_record_id ? 'exploring' : 'open';

    await client.query(
      `UPDATE quorum_states
          SET stalled_at = NULL, unstalled_at = $1, updated_at = $1
        WHERE issue_id = $2`,
      [now, args.issueId],
    );
    await client.query(
      `UPDATE issues
          SET status = $1, updated_at = $2
        WHERE id = $3 AND status = 'stalled'`,
      [revertStatus, now, args.issueId],
    );

    await writeTimelineEvent(client, {
      issueId: args.issueId,
      eventType: 'quorum_unstalled',
      actorMemberId: args.actorMemberId ?? null,
      payload: { revertedTo: revertStatus },
    });

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
