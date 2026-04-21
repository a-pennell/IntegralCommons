import { z } from 'zod';

/**
 * Export contracts — own-data export (always available) + space-wide export
 * (gated by Issue-driven authorization).
 * Implements FR-050, FR-051, NFR-010, CR-002, CR-003.
 */

// ─── Own-data export ───────────────────────────────────────────────────────
//
// Any member may export their own contributions at any time with ZERO gating.
// This implements CR-002 (Commons Protection — exit rights) and MUST NOT be
// blockable by any group decision.

export const OwnDataExportInputSchema = z.object({
  // Optional: scope the export to a single Space. If unset, export spans
  // every Space the member is or has been a Member of.
  spaceId: z.string().length(26).optional(),
  format: z.enum(['json', 'markdown_bundle']).default('json'),
});

export type OwnDataExportInput = z.infer<typeof OwnDataExportInputSchema>;

export const OwnDataExportOutputSchema = z.object({
  // Expiring signed URL (1 hour TTL).
  downloadUrl: z.string().url(),
  // Optional: hash for the consumer to verify integrity.
  contentHash: z.string(),
  expiresAt: z.date(),
});

export type OwnDataExportOutput = z.infer<typeof OwnDataExportOutputSchema>;

// ─── Space-wide export ─────────────────────────────────────────────────────
//
// A full export of a Space's data is a governance decision — it must be
// authorized by an Issue's Decision Record. The caller passes the DR id that
// authorized the export; the service verifies the DR grants this capability.

export const InitiateSpaceExportInputSchema = z.object({
  spaceId: z.string().length(26),
  // The Decision Record that authorizes this export. The DR must be finalized
  // and must explicitly grant the 'space_export' capability to the requestor.
  authorizingDecisionRecordId: z.string().length(26),
  format: z.enum(['json', 'markdown_bundle', 'sql_dump']).default('json'),
});

export type InitiateSpaceExportInput = z.infer<typeof InitiateSpaceExportInputSchema>;

export const InitiateSpaceExportOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    // Exports run as pg-boss jobs; the caller receives a job id to poll.
    exportJobId: z.string().length(26),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_authorized',                 // DR does not grant this capability
      'authorizing_dr_not_finalized',
      'authorizing_dr_superseded',
    ]),
  }),
]);

export type InitiateSpaceExportOutput = z.infer<typeof InitiateSpaceExportOutputSchema>;

// ─── Export job status ─────────────────────────────────────────────────────

export const GetExportJobStatusInputSchema = z.object({
  exportJobId: z.string().length(26),
});

export type GetExportJobStatusInput = z.infer<typeof GetExportJobStatusInputSchema>;

export const ExportJobStatusSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('queued') }),
  z.object({ status: z.literal('running'), progressPercent: z.number().min(0).max(100) }),
  z.object({
    status: z.literal('complete'),
    downloadUrl: z.string().url(),
    contentHash: z.string(),
    expiresAt: z.date(),
  }),
  z.object({ status: z.literal('failed'), errorMessage: z.string() }),
]);

export type ExportJobStatus = z.infer<typeof ExportJobStatusSchema>;
