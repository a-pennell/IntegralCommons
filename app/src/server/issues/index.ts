/**
 * Issues module public surface.
 *
 * Phase 5 landed create/list/get/update + open↔exploring transitions.
 * Phase 7 (US5) adds reopen + archive. Status='decided' is reached through
 * the `decisions.finalizeDecisionRecord` pipeline rather than a direct
 * transition — the DB trigger blocks decided without a DR.
 * The stalled path arrives in Phase 11 (US11).
 */

export { createIssue, type CreateIssueInput, type CreateIssueOk } from './create.ts';
export { updateIssue, type UpdateIssueInput } from './update.ts';
export { transitionIssueStatus, type TransitionStatusInput } from './transition-status.ts';
export { listIssuesForSpace } from './list.ts';
export { getIssueBySlugForMember, getIssueByIdForMember } from './get.ts';
export { reopenIssue, type ReopenIssueInput } from './reopen.ts';
export { archiveIssue } from './archive.ts';
export { recordIssueView } from './record-view.ts';
