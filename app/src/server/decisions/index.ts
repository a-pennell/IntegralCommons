/**
 * Decisions module public surface.
 *
 * Phase 1: ConsentMethod is the only DecisionMethod. draft → finalize is the
 * primary pipeline. Supersession is a flavour of draft that carries a
 * backlink to the prior DR; the finalize step then writes the
 * `decision_record_superseded` timeline event.
 */

export { ConsentMethod } from './consent-method.ts';
export type { DecisionMethod, DecisionDraftContext } from './method.ts';

export {
  draftDecisionRecord,
  type DraftDecisionRecordInput,
  type DraftDecisionRecordOk,
} from './draft.ts';

export {
  finalizeDecisionRecord,
  type FinalizeDecisionRecordInput,
  type FinalizeDecisionRecordOk,
} from './finalize.ts';

export { getDecisionRecord, listDecisionRecordsForIssue, getSupersessionChain } from './get.ts';
