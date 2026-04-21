import { z } from 'zod';

/**
 * Referendum contracts — initiate, deliberate, vote, close.
 * Implements FR-030 through FR-034, CR-006, CR-008, CR-010.
 */

export const ReferendumTargetSchema = z.enum([
  'delegation',
  'decision_record',
  'governance_profile_change',
]);

export type ReferendumTarget = z.infer<typeof ReferendumTargetSchema>;

export const ReferendumStatusSchema = z.enum([
  'initiating',
  'deliberating',
  'voting',
  'closed',
]);

export type ReferendumStatus = z.infer<typeof ReferendumStatusSchema>;

export const VoteChoiceSchema = z.enum(['support', 'oppose', 'stand_aside']);
export type VoteChoice = z.infer<typeof VoteChoiceSchema>;

// ─── Initiate Referendum ───────────────────────────────────────────────────

export const InitiateReferendumInputSchema = z.object({
  spaceId: z.string().length(26),
  targetType: ReferendumTargetSchema,
  // Exactly one of these must be set, matching targetType.
  targetDelegationId: z.string().length(26).optional(),
  targetDecisionRecordId: z.string().length(26).optional(),
  targetIssueId: z.string().length(26).optional(),
  // Initiator's rationale — becomes the first Perspective in the deliberation phase.
  rationaleMarkdown: z.string().min(1).max(10000),
});

export type InitiateReferendumInput = z.infer<typeof InitiateReferendumInputSchema>;

export const InitiateReferendumOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), referendumId: z.string().length(26) }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'rate_limited',              // CR-009: >1/7d
      'stability_period_active',   // CR-008
      'threshold_not_met',         // CR-006 — need endorsements first
      'target_invalid',
      'not_a_member',
    ]),
  }),
]);

// ─── Endorse / Support (for initial threshold) ─────────────────────────────

export const EndorseReferendumInputSchema = z.object({
  referendumId: z.string().length(26),
});

export type EndorseReferendumInput = z.infer<typeof EndorseReferendumInputSchema>;

// ─── Transition to Deliberation (automatic once threshold is reached) ──────

// This is exposed as a service-level action; typically invoked by a pg-boss
// job when supporters reach the threshold.

// ─── Cast Vote ─────────────────────────────────────────────────────────────

export const CastVoteInputSchema = z.object({
  referendumId: z.string().length(26),
  choice: VoteChoiceSchema,
});

export type CastVoteInput = z.infer<typeof CastVoteInputSchema>;

export const CastVoteOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_in_voting_phase',
      'already_voted',
      'subject_member_cannot_vote', // CR-001 — subject of a removal may not vote on it
      'not_in_affected_set',        // CR-007
    ]),
  }),
]);

// ─── Close / Resolve ───────────────────────────────────────────────────────

// Close is typically automatic at deadline; exposed for admin-equivalent
// close-early paths which themselves require delegation.

export const ReferendumDtoSchema = z.object({
  id: z.string().length(26),
  spaceId: z.string().length(26),
  initiatedByMemberId: z.string().length(26),
  targetType: ReferendumTargetSchema,
  targetDelegationId: z.string().length(26).nullable(),
  targetDecisionRecordId: z.string().length(26).nullable(),
  targetIssueId: z.string().length(26).nullable(),
  status: ReferendumStatusSchema,
  minimumThresholdRequired: z.number().int().min(1),
  minimumThresholdReachedAt: z.date().nullable(),
  deliberationStartedAt: z.date().nullable(),
  votingStartedAt: z.date().nullable(),
  closedAt: z.date().nullable(),
  outcome: z.enum(['affirmed', 'revoked', 'insufficient_quorum']).nullable(),
  createdAt: z.date(),
});

export type ReferendumDto = z.infer<typeof ReferendumDtoSchema>;
