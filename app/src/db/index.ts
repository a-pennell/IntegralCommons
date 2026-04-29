import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import * as schema from './schema/index.ts';

/**
 * Drizzle client. The underlying Pool is created lazily on first use so that
 * build-time page-config collection (which imports our server modules to
 * compile them) does not fail when DATABASE_URL is unset in the build env.
 *
 * The `db` export is a Proxy that resolves the real client on first method
 * call. Production runtime behavior is identical to an eagerly-constructed
 * client; there is no per-call overhead after the first use.
 */

type DrizzleClient = NodePgDatabase<typeof schema>;

let _pool: Pool | null = null;
let _db: DrizzleClient | null = null;

function ensureBooted(): { pool: Pool; db: DrizzleClient } {
  if (_pool && _db) return { pool: _pool, db: _db };
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required at runtime. See app/.env.example for the expected format.',
    );
  }
  _pool = new Pool({
    connectionString: url,
    max: Number(process.env.DATABASE_POOL_MAX ?? 20),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
  _db = drizzle(_pool, { schema });
  return { pool: _pool, db: _db };
}

export const db: DrizzleClient = new Proxy({} as DrizzleClient, {
  get(_target, prop, receiver) {
    const { db: real } = ensureBooted();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

/**
 * Raw pool access for use cases that need a PoolClient directly (e.g.,
 * `transaction()` helper, tests that want to bypass the proxy).
 */
export function getPool(): Pool {
  return ensureBooted().pool;
}

export type Database = DrizzleClient;

/**
 * Run the given fn inside a Postgres transaction.
 */
export async function transaction<T>(fn: (tx: PoolClient) => Promise<T>): Promise<T> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { schema };
