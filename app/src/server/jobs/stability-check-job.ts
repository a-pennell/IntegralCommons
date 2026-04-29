import type { PgBoss, Job } from 'pg-boss';
import { logger } from '@/lib/logger';

/**
 * Stability-check job.
 *
 * CR-008 enforces minimum stability periods. Most of the enforcement is
 * inline (see `referenda.initiate` service guard), but we also register a
 * daily job to log-summarize any attempted-but-blocked actions — useful for
 * transparency reporting in Civic Memory.
 *
 * Phase 1 scope: emit a daily heartbeat only; richer reporting is Phase 2.
 */

const QUEUE_NAME = 'stability_check';

export async function registerStabilityCheckJob(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME);

  await boss.work<{ tickAt?: string }>(QUEUE_NAME, async (jobs: Job<{ tickAt?: string }>[]) => {
    for (const job of jobs) {
      logger.info({ tickAt: job.data?.tickAt ?? 'now' }, 'stability-check tick');
    }
  });

  // Run once per day at 04:15 UTC (outside typical human activity).
  await boss.schedule(QUEUE_NAME, '15 4 * * *', {} as never);
}
