import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/**
 * Flat ESLint config for the CommonGround app.
 *
 * The `no-restricted-imports` rule enforces module boundaries per plan.md §Module Boundaries:
 * one server module may not reach into another's internals — only its `index.ts` public surface.
 */
export default [
  {
    ignores: [
      '.next/**',
      'dist/**',
      'node_modules/**',
      'drizzle/migrations/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...(reactHooks.configs?.recommended?.rules ?? {}),
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/server/*/*'],
              message:
                'Import from a module\u2019s index.ts only (e.g. "@/server/issues"). Deep imports violate module boundaries — see plan.md §Module Boundaries.',
            },
            {
              group: ['../../server/**', '../../../server/**'],
              message: 'Use the "@/server/..." alias for server-module imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      // Tests may reach into module internals deliberately.
      'no-restricted-imports': 'off',
    },
  },
];
