import { z } from 'zod';

/**
 * Issue contracts — create, update, status transition, list, get.
 * Implements FR-010 through FR-016, FR-039, CR-007.
 */

// ─── Enums ─────────────────────────────────────────────────────────────────

export const IssueStatusSchema = z.enum([
  'open',
  'exploring',
  'decided',
  'reopened',
  'archived',
  'stalled',
]);

export type IssueStatus = z.infer<typeof IssueStatusSchema>;

// ─── Structured sections ───────────────────────────────────────────────────

export const StructuredSectionsSchema = z.object({
  problemFramings: z.array(z.string().max(10000)).max(20),
  constraints: z.array(z.string().max(2000)).max(50),
  stakeholders: z.array(z.string().max(500)).max(100),
  knownFacts: z.array(z.string().max(2000)).max(100),
  openQuestions: z.array(z.string().max(1000)).max(100),
});

export type StructuredSections = z.infer<typeof StructuredSectionsSchema>;

// ─── Create Issue ──────────────────────────────────────────────────────────

export const CreateIssueInputSchema = z.object({
  spaceId: z.string().length(26),
  title: z.string().min(1).max(200).trim(),
  scope: z.string().min(1).max(500).trim(),
  scopeTags: z.array(z.string().min(1).max(60)).max(30).default([]),
  structuredSections: StructuredSectionsSchema.optional(),
  // Optional per-Issue decision-method override. If unset, Space default applies.
  decisionMethod: z.enum(['consent']).optional(),
});

export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;

export const CreateIssueOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    issueId: z.string().length(26),
    slug: z.string(),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'bootstrap_incomplete', // FR-009
      'rate_limited',         // CR-009: >3/day
      'invalid_scope_tag',    // tag not in Space vocabulary
      'not_a_member',
    ]),
  }),
]);

export type CreateIssueOutput = z.infer<typeof CreateIssueOutputSchema>;

// ─── Update Issue (structured sections only; title/scope are immutable post-create) ──

export const UpdateIssueSectionsInputSchema = z.object({
  issueId: z.string().length(26),
  structuredSections: StructuredSectionsSchema,
});

export type UpdateIssueSectionsInput = z.infer<typeof UpdateIssueSectionsInputSchema>;

// ─── Transition Status ─────────────────────────────────────────────────────

export const TransitionIssueStatusInputSchema = z.object({
  issueId: z.string().length(26),
  to: IssueStatusSchema,
  // Required when `to` is `decided` (FR-014) — the DR being published.
  decisionRecordId: z.string().length(26).optional(),
  // Required when `to` is `reopened` (FR-015).
  reopenReason: z.string().min(1).max(2000).optional(),
});

export type TransitionIssueStatusInput = z.infer<typeof TransitionIssueStatusInputSchema>;

export const TransitionIssueStatusOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), newStatus: IssueStatusSchema }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_facilitator',           // FR-013
      'decision_record_required',  // FR-014
      'reopen_reason_required',    // FR-015
      'quorum_not_met',            // FR-035, FR-037
      'stalled_cannot_decide',     // FR-039
      'invalid_transition',
    ]),
  }),
]);

// ─── List / Get ────────────────────────────────────────────────────────────

export const ListIssuesInputSchema = z.object({
  spaceId: z.string().length(26),
  status: IssueStatusSchema.optional(),
  scopeTag: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(), // opaque pagination cursor
});

export type ListIssuesInput = z.infer<typeof ListIssuesInputSchema>;

export const IssueSummarySchema = z.object({
  id: z.string().length(26),
  title: z.string(),
  slug: z.string(),
  status: IssueStatusSchema,
  scopeTags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  hasDecisionRecord: z.boolean(),
  awarenessCount: z.number().int().min(0),
  participationCount: z.number().int().min(0),
});

export type IssueSummary = z.infer<typeof IssueSummarySchema>;

export const GetIssueByIdInputSchema = z.object({
  issueId: z.string().length(26),
});
