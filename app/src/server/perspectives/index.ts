/**
 * Perspectives module public surface.
 *
 * Satisfies FR-017 through FR-022 and CR-011 (participation accounting via
 * the Quorum recompute triggered on each submit).
 */

export {
  submitPerspective,
  type SubmitPerspectiveInput,
  type SubmitPerspectiveOk,
} from './submit.ts';

export { editPerspective, type EditPerspectiveInput } from './edit.ts';

export { listPerspectivesForIssue, type PerspectiveWithAuthor } from './list-for-issue.ts';
