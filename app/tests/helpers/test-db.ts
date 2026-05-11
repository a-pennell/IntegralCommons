import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';

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
  for (const file of ['0000_deep_martin_li.sql', '0001_hard_spyke.sql', '0002_post_migration_setup.sql']) {
    await pool.query(strip(readFileSync(join(MIGRATIONS_DIR, file), 'utf8')));
  }

  return { db, pool, container };
}

export async function stopTestDb(testDb: TestDatabase): Promise<void> {
  await testDb.pool.end();
  await testDb.container.stop({ timeout: 5 });
}
