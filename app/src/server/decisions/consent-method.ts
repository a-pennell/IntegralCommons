import { errors, type AppError } from '@/lib/errors';
import { err, ok, type Result } from '@/lib/result';
import { cr011DecideWithoutAwareness } from '@/server/constitution';
import type { DecisionDraftContext, DecisionMethod } from './method.ts';

/**
 * ConsentMethod — the Phase 1 default decision method (FR-046, FR-047, FR-049).
 *
 * A decision passes when no active member has an unresolved objection. The
 * `unresolved_objections_text` field captures what stands (even if empty).
 * Stand-asides are recorded in the same field per FR-047 — they do not block.
 *
 * Phase 1 trusts the facilitator to determine whether objections are
 * resolved (the system does not try to infer "resolution" from free-text).
 * The accountability trail is the DR itself + the Civic Memory timeline.
 *
 * What the method enforces at finalize time:
 *   - All five required DR fields are present and non-trivial.
 *   - CR-011 awareness quorum is met (a silent-majority Issue cannot be
 *     finalized).
 *   - If `unresolvedObjectionsText` is a sentinel "BLOCKED" keyword (set by
 *     the facilitator to pause finalization), refuse. In Phase 1 there is
 *     no other automated gate — that's the deliberate simplicity.
 */
export const ConsentMethod: DecisionMethod = {
  name: 'consent',

  async canFinalize(ctx: DecisionDraftContext): Promise<Result<true, AppError>> {
    const dr = ctx.decisionRecord;

    // Five required elements (FR-023). Length checks for non-trivial content.
    const fields: Array<{ path: string; value: string; minLength: number }> = [
      { path: 'whatText', value: dr.whatText, minLength: 10 },
      { path: 'howMethod', value: dr.howMethod, minLength: 1 },
      { path: 'rationaleText', value: dr.rationaleText, minLength: 10 },
      { path: 'unresolvedObjectionsText', value: dr.unresolvedObjectionsText, minLength: 0 },
    ];
    const missing = fields
      .filter((f) => f.value.trim().length < f.minLength)
      .map((f) => ({
        path: f.path,
        message:
          f.minLength > 0
            ? `"${f.path}" must be at least ${f.minLength} characters.`
            : `"${f.path}" is required (use "none" if there are no objections).`,
      }));
    if (missing.length > 0) {
      return err(errors.validation(missing));
    }

    if (dr.reviewDate.getTime() <= Date.now()) {
      return err(
        errors.validation([
          { path: 'reviewDate', message: 'Review date must be in the future (FR-023).' },
        ]),
      );
    }

    // CR-011 awareness gate.
    const cr011 = cr011DecideWithoutAwareness({
      awarenessCount: ctx.quorum.awarenessCount,
      awarenessRequired: ctx.quorum.awarenessRequired,
    });
    if (cr011) return err(errors.constitutional(cr011.cr, cr011.explanation));

    // Explicit facilitator-pause sentinel.
    if (dr.unresolvedObjectionsText.trim().toUpperCase() === 'BLOCKED') {
      return err(
        errors.conflict(
          'decision_record',
          'Finalization is paused by an unresolved objection (the draft is marked BLOCKED). Resolve the objection or withdraw the draft.',
        ),
      );
    }

    return ok(true);
  },
};
