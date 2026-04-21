import { z } from 'zod';

/**
 * Decision Record contracts — draft, finalize, get.
 * Implements FR-014, FR-023, FR-024, FR-046, FR-047, FR-048, FR-049.
 */

// ─── Draft Decision Record ─────────────────────────────────────────────────

export const DraftDecisionRecordInputSchema = z.object({
  issueId: z.string().length(26),
  whatText: z.string().min(1).max(20000),             // "What was decided"
  howMethod: z.enum(['consent']),                      // Phase 1: consent only
  rationaleText: z.string().min(1).max(20000),         // "Key rationales"
  unresolvedObjectionsText: z.string().max(20000).default(''), // captured even if none
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date (YYYY-MM-DD)
});

export type DraftDecisionRecordInput = z.infer<typeof DraftDecisionRecordInputSchema>;

export const DraftDecisionRecordOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    decisionRecordId: z.string().length(26),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_facilitator',          // FR-013; only the delegated facilitator may draft
      'issue_already_decided',
      'review_date_in_past',
      'invalid_method',
    ]),
  }),
]);

// ─── Finalize Decision Record ──────────────────────────────────────────────

export const FinalizeDecisionRecordInputSchema = z.object({
  decisionRecordId: z.string().length(26),
});

export type FinalizeDecisionRecordInput = z.infer<typeof FinalizeDecisionRecordInputSchema>;

export const FinalizeDecisionRecordOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    issueStatus: z.literal('decided'),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_facilitator',
      'quorum_not_met',
      'already_finalized',
      'constitutional_violation', // CR-002 (commons protection), CR-005, etc.
    ]),
    // When `constitutional_violation`, includes the CR id and a short explanation.
    violatedPrinciple: z.string().optional(),
    explanation: z.string().optional(),
  }),
]);

// ─── Get Decision Record ───────────────────────────────────────────────────

export const DecisionRecordDtoSchema = z.object({
  id: z.string().length(26),
  issueId: z.string().length(26),
  draftedByMemberId: z.string().length(26),
  whatText: z.string(),
  howMethod: z.enum(['consent']),
  rationaleText: z.string(),
  unresolvedObjectionsText: z.string(),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  finalizedAt: z.date().nullable(),
  finalizedByMemberId: z.string().length(26).nullable(),
  supersedesDecisionRecordId: z.string().length(26).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DecisionRecordDto = z.infer<typeof DecisionRecordDtoSchema>;

export const GetDecisionRecordInputSchema = z.object({
  decisionRecordId: z.string().length(26),
});
