import type { PgBoss, Job } from 'pg-boss';
import { getPool, transaction } from '@/db';
import { logger } from '@/lib/logger';
import { applyStallTransitionIfNeeded, recomputeQuorum } from '@/server/quorum';

/**
 * Scheduled quorum-check job.
 *
 * Every ~15 minutes, scan non-archived Issues whose
 * `deliberation_period_ends_at` has passed and whose stall state may need to
 * change. For each: recompute counts, then apply the stall/unstall
 * transition when appropriate.
 *
 * Polling interval is intentionally coarse — stall transitions aren't
 * time-critical, and keeping the worker quiet matches NFR-011 (low-compute).
 */

const QUEUE_NAME = 'quorum_check';

export async function registerQuorumCheckJob(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME);

  await boss.work<{ issueId?: string }>(QUEUE_NAME, async (jobs: Job<{ issueId?: string }>[]) => {
    for (const job of jobs) {
      await runOnce(job.data?.issueId);
    }
  });

  // Self-schedule a periodic tick. pg-boss's `schedule` takes cron-like
  // syntax; we use a 15-minute interval.
  await boss.schedule(QUEUE_NAME, '*/15 * * * *', {} as never);
}

/**
 * Run the check once — either for a specific Issue (when called inline
 * post-write) or for every candidate Issue in the DB.
 */
export async function runOnce(issueId?: string): Promise<void> {
  const pool = getPool();
  let candidates: string[];

  if (issueId) {
    candidates = [issueId];
  } else {
    const rows = await pool.query<{ id: string }>(
      `SELECT qs.issue_id AS id
         FROM quorum_states qs
         JOIN issues i ON i.id = qs.issue_id
        WHERE i.status NOT IN ('archived', 'decided')
          AND (
            qs.deliberation_period_ends_at <= now()
            OR qs.stalled_at IS NOT NULL
          )
        LIMIT 500`,
    );
    candidates = rows.rows.map((r) => r.id);
  }

  for (const id of candidates) {
    try {
      await transaction(async (tx) => {
        await recomputeQuorum(tx, id);
        const out = await applyStallTransitionIfNeeded(tx, id);
        if (out.transition !== 'none') {
          logger.info({ issueId: id, transition: out.transition }, 'quorum transition applied');
        }
      });
    } catch (e) {
      logger.error({ issueId: id, err: e }, 'quorum-check-job failed for issue');
    }
  }
}
