/**
 * Rate-limits module public surface.
 *
 * Enforces CR-009. Phase 5 exposes `checkAndBump` for create_issue; the
 * initiate_referendum rolling-window counter lands with T129 in Phase 8.
 */

export { checkAndBump } from './check-and-bump.ts';
