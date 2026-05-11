import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { getPool } from '@/db';

/**
 * Per-test-file Postgres container. Testcontainers spins up a fresh
 * postgres:16-alpine, applies the initial migration, and yields a Drizzle
 * client. Each file gets an isolated container — slower than sharing, but
 * eliminates cross-file state bleed in CI.
 *
 * Use with `beforeAll(startTestDb)` / `afterAll(stopTestDb)`.
 */

export type TestDatabase = {
  readonly db: ReturnType<typeof drizzle<typeof schema>>;
  readonly pool: Pool;
  readonly container: StartedPostgreSqlContainer;
};

const MIGRATIONS_DIR = join(import.meta.dirname, '..', '..', 'drizzle', 'migrations');

export async function startTestDb(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('commonground_test')
    .withUsername('commonground')
    .withPassword('commonground')
    .start();

  const pool = new Pool({ connectionString: container.getConnectionUri(), max: 5 });
  const db = drizzle(pool, { schema });

  // Apply all migrations in order. Drizzle emits `--> statement-breakpoint` between
  // statements; pg can execute the whole blob since each stmt is ;-terminated.
  const strip = (sql: string) => sql.replace(/-->\s*statement-breakpoint/g, '');
  for (const file of [
    '0000_deep_martin_li.sql',
    '0001_hard_spyke.sql',
    '0002_post_migration_setup.sql',
    '0003_neighborhood_boundary.sql',
    '0004_ecological_scope_flag.sql',
  ]) {
    await pool.query(strip(readFileSync(join(MIGRATIONS_DIR, file), 'utf8')));
  }

  return { db, pool, container };
}

export async function stopTestDb(testDb: TestDatabase): Promise<void> {
  // Suppress pool-level errors on both pools before draining, so any
  // in-flight 57P01 events route through pool.emit('error') and are swallowed.
  testDb.pool.on('error', () => {});

  // The app-level pool (created lazily by @/db/index.ts and used by all
  // server modules) is a second pool pointing at the same container. We must
  // drain it too — otherwise its clients receive 57P01 when the container
  // stops and, with no pool-level error handler, the error becomes an
  // uncaught exception that Vitest treats as a test failure.
  const appPool = getPool();
  appPool.on('error', () => {});

  await Promise.all([testDb.pool.end(), appPool.end()]);

  // pool.end() resolves before socket teardown fully completes; wait briefly
  // so all TCP FIN/ACK exchanges finish before we kill the container.
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  await testDb.container.stop({ timeout: 5 });
}
