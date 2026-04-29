import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // testcontainers requires real network + DB; keep tests serial per-file to avoid
    // flaky container startup contention.
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 60_000,
    hookTimeout: 120_000,
    reporters: ['default'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
