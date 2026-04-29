/**
 * @commonground/contracts — aggregate re-exports.
 *
 * Prefer importing from the specific surface (e.g., `@commonground/contracts/auth`)
 * to keep bundle boundaries clear. The root re-export exists for ergonomic usage
 * in tests and scripts.
 */

export * from './auth.ts';
export * from './spaces.ts';
export * from './issues.ts';
export * from './perspectives.ts';
export * from './decisions.ts';
export * from './delegations.ts';
export * from './referenda.ts';
export * from './export.ts';
