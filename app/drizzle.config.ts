import { defineConfig } from 'drizzle-kit';

/**
 * `generate` (schema → SQL diff) does not need a live database — only the
 * schema path. `migrate`, `push`, and `studio` do need DATABASE_URL. We
 * accept a placeholder here and let the runtime connection error out
 * clearly when a real credential is needed.
 */
const url =
  process.env.DATABASE_URL ?? 'postgres://placeholder:placeholder@localhost:5432/placeholder';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle/migrations',
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
