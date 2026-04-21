import { z } from 'zod';

/**
 * Space contracts — create, rename, invite, accept invitation.
 * Implements FR-001, FR-002, FR-003, FR-004.
 *
 * Note: Space configuration changes (thresholds, taxonomy, etc.) route through
 * Issues per FR-053; see issues.ts and decisions.ts rather than adding a
 * "configure space" action here.
 */

// ─── Create Space ──────────────────────────────────────────────────────────

export const CreateSpaceInputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  purpose: z.string().min(1).max(1000).trim(),
});

export type CreateSpaceInput = z.infer<typeof CreateSpaceInputSchema>;

export const CreateSpaceOutputSchema = z.object({
  spaceId: z.string().length(26),
  slug: z.string(),
});

export type CreateSpaceOutput = z.infer<typeof CreateSpaceOutputSchema>;

// ─── Invite Member ─────────────────────────────────────────────────────────

export const InviteMemberInputSchema = z.object({
  spaceId: z.string().length(26),
  invitedEmail: z.string().email().toLowerCase().trim(),
});

export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>;

export const InviteMemberOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    invitationId: z.string().length(26),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'already_invited',
      'already_member',
      'not_authorized',
      'email_dispatch_failed',
    ]),
  }),
]);

export type InviteMemberOutput = z.infer<typeof InviteMemberOutputSchema>;

// ─── Accept Invitation ─────────────────────────────────────────────────────

export const AcceptInvitationInputSchema = z.object({
  invitationToken: z.string().min(16).max(256),
  // Displayed name the new member wants to present. May be edited later.
  displayName: z.string().min(1).max(80).trim(),
});

export type AcceptInvitationInput = z.infer<typeof AcceptInvitationInputSchema>;

export const AcceptInvitationOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    spaceId: z.string().length(26),
    spaceSlug: z.string(),
    membershipId: z.string().length(26),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum(['invitation_not_found', 'invitation_expired', 'invitation_consumed']),
  }),
]);

export type AcceptInvitationOutput = z.infer<typeof AcceptInvitationOutputSchema>;

// ─── List Spaces (for the current member) ──────────────────────────────────

export const SpaceSummarySchema = z.object({
  id: z.string().length(26),
  name: z.string(),
  slug: z.string(),
  bootstrapCompleted: z.boolean(),
  openIssueCount: z.number().int().min(0),
});

export type SpaceSummary = z.infer<typeof SpaceSummarySchema>;
