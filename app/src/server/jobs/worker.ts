import { PgBoss } from 'pg-boss';
import { logger } from '@/lib/logger';
import { registerDigestJob } from './digest-job.ts';
import { registerEmailDispatchJob } from './email-dispatch-job.ts';
import { registerQuorumCheckJob } from './quorum-check-job.ts';
import { registerStabilityCheckJob } from './stability-check-job.ts';

/**
 * pg-boss worker entrypoint.
 *
 * Started as a separate process from the Next.js web server. Both processes
 * share the same database; pg-boss uses Postgres's `SKIP LOCKED` so there's
 * no Redis dependency (NFR-008).
 *
 * Job handlers are registered here. Each handler lives in its own file to
 * keep the worker process dependency-graph legible.
 */

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to start the worker.');
  }

  const boss = new PgBoss({ connectionString });

  boss.on('error', (err) => {
    logger.error({ err }, 'pg-boss error');
  });

  await boss.start();
  logger.info('pg-boss worker started');

  // Register each job handler.
  await registerEmailDispatchJob(boss);
  await registerQuorumCheckJob(boss);
  await registerStabilityCheckJob(boss);
  await registerDigestJob(boss);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutdown signal received');
    try {
      await boss.stop({ graceful: true, timeout: 30_000 });
      logger.info('pg-boss stopped cleanly');
    } catch (err) {
      logger.error({ err }, 'error during pg-boss stop');
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'worker failed to start');
  process.exit(1);
});
