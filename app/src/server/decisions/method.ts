import type { AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';

/**
 * DecisionMethod — interface for the pluggable decision-method layer.
 *
 * Phase 1 ships exactly one implementation (ConsentMethod). Phase 2 adds
 * siblings: majority, quadratic, sortition, sociocracy variants, etc. New
 * methods opt in via `how_method` on the Decision Record and a matching
 * registry entry here.
 *
 * All methods share a shape: given the Issue + a draft DR, decide whether
 * the decision is ready to finalize. If yes, return ok. If no, return an
 * AppError explaining why. The method should NOT perform the write — the
 * orchestrator in `finalize.ts` does that.
 */

export type DecisionDraftContext = {
  readonly issueId: string;
  readonly spaceId: string;
  readonly facilitatorMemberId: string;
  readonly decisionRecord: {
    readonly whatText: string;
    readonly howMethod: string;
    readonly rationaleText: string;
    readonly unresolvedObjectionsText: string;
    readonly reviewDate: Date;
  };
  /** Snapshot from quorum_states at finalize time. */
  readonly quorum: {
    readonly awarenessCount: number;
    readonly awarenessRequired: number;
    readonly participationCount: number;
    readonly participationRequired: number;
  };
};

export interface DecisionMethod {
  readonly name: string;
  canFinalize(ctx: DecisionDraftContext): Promise<Result<true, AppError>>;
}
