import type { PoolClient } from 'pg';
import { getPool } from '@/db';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Explicitly stall an Issue that has failed quorum (FR-039, CR-011).
 *
 * In normal operation this is called by the `quorum-check-job` scheduler
 * via `applyStallTransitionIfNeeded` in `recompute.ts`. This module exposes
 * a direct entry-point for tests and for administrative overrides.
 *
 * Preconditions (not re-validated here — caller must verify):
 *   - `quorum_states.stalled_at IS NULL`
 *   - `extension_period_ends_at` has elapsed
 *   - `awareness_count < awareness_required`
 */

export async function stallIssue(args: {
  readonly issueId: string;
  readonly actorMemberId?: string;
}): Promise<void> {
  const client: PoolClient = await getPool().connect();
  try {
    await client.query('BEGIN');

    const now = new Date();
    await client.query(
      `UPDATE quorum_states
          SET stalled_at = $1, updated_at = $1
        WHERE issue_id = $2 AND stalled_at IS NULL`,
      [now, args.issueId],
    );
    await client.query(
      `UPDATE issues
          SET status = 'stalled',
              stall_reason = 'insufficient_participation',
              updated_at = $1
        WHERE id = $2
          AND status NOT IN ('decided', 'archived', 'stalled')`,
      [now, args.issueId],
    );

    await writeTimelineEvent(client, {
      issueId: args.issueId,
      eventType: 'quorum_stalled',
      actorMemberId: args.actorMemberId ?? null,
      payload: { reason: 'insufficient_participation' },
    });

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
