import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Dedicated config for the constitutional test suite (tests/constitutional/).
 * A failing test here blocks merge. See plan.md §Testing Strategy.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/constitutional/**/*.test.ts'],
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
