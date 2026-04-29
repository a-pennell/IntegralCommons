import type { PoolClient } from 'pg';

/**
 * Recompute `quorum_states.participation_count` for an Issue.
 *
 * `participation_count` is the count of DISTINCT members who have authored
 * a Perspective on the Issue (data-model §QuorumState). Recompute runs
 * inside the Perspective-write transaction so the count is always consistent
 * with the persisted rows.
 *
 * A separate scheduled job reconciles the other two tiers (awareness,
 * decision) — that lands in Phase 8.
 */
export async function recomputeParticipationCount(
  client: PoolClient,
  issueId: string,
): Promise<void> {
  await client.query(
    `UPDATE quorum_states
        SET participation_count = (
              SELECT COUNT(DISTINCT author_id)::int
                FROM perspectives
               WHERE issue_id = $1
            ),
            updated_at = now()
      WHERE issue_id = $1`,
    [issueId],
  );
}
