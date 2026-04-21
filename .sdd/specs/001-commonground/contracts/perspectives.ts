import { z } from 'zod';

/**
 * Perspective contracts — submit, edit, list by Issue.
 * Implements FR-017 through FR-022.
 */

// ─── Submit Perspective ────────────────────────────────────────────────────

export const SubmitPerspectiveInputSchema = z.object({
  issueId: z.string().length(26),
  bodyMarkdown: z.string().min(1).max(10000),
  // Must be one of the Space's configured taxonomy types. Defaults per FR-019:
  // values | risk | equity | feasibility | relational | temporal.
  taxonomyType: z.string().min(1).max(60),
  fromDirectExperience: z.boolean().default(false),
  // At most one level of depth (FR-021): parent_perspective_id must itself
  // have parent_perspective_id = null. Enforced at DB + service layer.
  parentPerspectiveId: z.string().length(26).optional(),
});

export type SubmitPerspectiveInput = z.infer<typeof SubmitPerspectiveInputSchema>;

export const SubmitPerspectiveOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    perspectiveId: z.string().length(26),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_a_member',
      'issue_not_open',
      'invalid_taxonomy',           // not in Space vocabulary
      'parent_too_deep',            // FR-021
      'parent_not_in_issue',
    ]),
  }),
]);

export type SubmitPerspectiveOutput = z.infer<typeof SubmitPerspectiveOutputSchema>;

// ─── Edit Perspective ──────────────────────────────────────────────────────

export const EditPerspectiveInputSchema = z.object({
  perspectiveId: z.string().length(26),
  bodyMarkdown: z.string().min(1).max(10000),
  taxonomyType: z.string().min(1).max(60),
  fromDirectExperience: z.boolean(),
});

export type EditPerspectiveInput = z.infer<typeof EditPerspectiveInputSchema>;

// ─── List Perspectives by Issue ────────────────────────────────────────────

export const ListPerspectivesInputSchema = z.object({
  issueId: z.string().length(26),
  taxonomyType: z.string().optional(), // filter
  limit: z.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
});

export type ListPerspectivesInput = z.infer<typeof ListPerspectivesInputSchema>;

export const PerspectiveDtoSchema = z.object({
  id: z.string().length(26),
  issueId: z.string().length(26),
  authorId: z.string().length(26),
  authorDisplayName: z.string().nullable(), // null = removed member
  bodyMarkdown: z.string(),
  bodyHtml: z.string(), // server-rendered + sanitized
  taxonomyType: z.string(),
  fromDirectExperience: z.boolean(),
  parentPerspectiveId: z.string().length(26).nullable(),
  createdAt: z.date(),
  editedAt: z.date().nullable(),
});

export type PerspectiveDto = z.infer<typeof PerspectiveDtoSchema>;
