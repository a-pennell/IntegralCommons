import { logger } from '@/lib/logger';

/**
 * Singleton pg-boss client for the Next.js web process.
 *
 * Dynamic import prevents webpack from statically bundling pg-boss (which uses
 * Node.js worker threads with relative paths that break inside vendor-chunks).
 * pg-boss is loaded at first call and stays in node_modules at runtime.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BossInstance = any;

let instance: BossInstance | null = null;
let startPromise: Promise<BossInstance> | null = null;

export async function getBossClient(): Promise<BossInstance> {
  if (instance) return instance;
  if (startPromise) return startPromise;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to use the pg-boss client.');
  }

  startPromise = (async () => {
    // Dynamic import keeps pg-boss out of the webpack static analysis graph.
    const { PgBoss } = await import('pg-boss');
    const boss = new PgBoss({ connectionString });
    boss.on('error', (err: unknown) => logger.error({ err }, 'pg-boss client error'));
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
