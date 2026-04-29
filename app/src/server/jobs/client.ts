import { PgBoss } from 'pg-boss';
import { logger } from '@/lib/logger';

/**
 * Singleton pg-boss client for the Next.js web process.
 *
 * The web process enqueues jobs; the separate worker process (worker.ts)
 * consumes them. Both connect to the same Postgres; pg-boss's `SKIP LOCKED`
 * handles concurrent polling.
 *
 * Lazy-start: the first call to `getBossClient()` opens the connection and
 * applies pg-boss's own schema migrations (it manages its own `pgboss`
 * schema). Subsequent calls reuse the same instance.
 */

let instance: PgBoss | null = null;
let startPromise: Promise<PgBoss> | null = null;

export async function getBossClient(): Promise<PgBoss> {
  if (instance) return instance;
  if (startPromise) return startPromise;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to use the pg-boss client.');
  }

  startPromise = (async () => {
    const boss = new PgBoss({ connectionString });
    boss.on('error', (err) => logger.error({ err }, 'pg-boss client error'));
    await boss.start();
    instance = boss;
    startPromise = null;
    return boss;
  })();

  return startPromise;
}

/** Closes the pg-boss client. Used in tests and on graceful shutdown. */
export async function closeBossClient(): Promise<void> {
  if (instance) {
    await instance.stop({ graceful: true, timeout: 5_000 });
    instance = null;
  }
}
