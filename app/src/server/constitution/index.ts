/**
 * Constitution module public surface.
 *
 * Exposes CR-001 through CR-012 predicates as pure functions. Callers in
 * other modules invoke them and map any non-null `Violation` into
 * `errors.constitutional(cr, explanation)`.
 *
 * This module owns no tables. The real enforcement happens in the module
 * that calls the predicate (e.g., `issues.create` calls `cr004...` and
 * `cr007...`), plus the dedicated test suite at tests/constitutional/.
 */

export * from './predicates.ts';
export { openMetaIssue, type MetaIssueInput, type MetaIssueResult } from './meta-issue.ts';
