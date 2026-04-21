import { z } from 'zod';

/**
 * Delegation contracts — grant, revoke, list.
 * Implements FR-027, FR-028, FR-029, FR-030, CR-005.
 *
 * Note: there is intentionally no "irrevocable" field. Every delegation is
 * revocable; this enforces CR-005 structurally.
 */

export const DelegationCapabilitySchema = z.enum([
  'facilitation', // Phase 1. Phase 2 adds more capabilities.
]);

export type DelegationCapability = z.infer<typeof DelegationCapabilitySchema>;

// ─── Grant Delegation ──────────────────────────────────────────────────────

export const GrantDelegationInputSchema = z.object({
  spaceId: z.string().length(26),
  // null => space-wide capability; set => per-Issue delegation.
  issueId: z.string().length(26).nullable(),
  granteeMemberId: z.string().length(26),
  capability: DelegationCapabilitySchema,
  // Required: delegations must be time-bounded (FR-029). Null permitted but discouraged.
  expiresAt: z.date().nullable(),
  // Required when granted via a DR; null only at Bootstrap.
  grantedByDecisionRecordId: z.string().length(26).nullable(),
});

export type GrantDelegationInput = z.infer<typeof GrantDelegationInputSchema>;

export const GrantDelegationOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), delegationId: z.string().length(26) }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'not_authorized',         // grantor lacks authority (must be via DR or Bootstrap)
      'grantee_not_a_member',
      'duplicate_delegation',   // an active one already exists for (scope, capability, grantee)
    ]),
  }),
]);

// ─── Revoke Delegation ─────────────────────────────────────────────────────

export const RevokeDelegationInputSchema = z.object({
  delegationId: z.string().length(26),
  // null = self-revoke by the grantee, or revoke-by-grantor.
  // set = revocation via referendum; the referendum must have closed with outcome=revoked.
  byReferendumId: z.string().length(26).nullable(),
});

export type RevokeDelegationInput = z.infer<typeof RevokeDelegationInputSchema>;

export const RevokeDelegationOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    error: z.enum([
      'delegation_not_found',
      'already_revoked',
      'not_authorized',
      'referendum_did_not_revoke',
    ]),
  }),
]);

// ─── List Delegations ──────────────────────────────────────────────────────

export const ListDelegationsInputSchema = z.object({
  spaceId: z.string().length(26),
  issueId: z.string().length(26).nullable().optional(), // filter
  activeOnly: z.boolean().default(true),
});

export type ListDelegationsInput = z.infer<typeof ListDelegationsInputSchema>;

export const DelegationDtoSchema = z.object({
  id: z.string().length(26),
  spaceId: z.string().length(26),
  issueId: z.string().length(26).nullable(),
  granteeMemberId: z.string().length(26),
  capability: DelegationCapabilitySchema,
  grantedAt: z.date(),
  expiresAt: z.date().nullable(),
  revokedAt: z.date().nullable(),
  revokedByReferendumId: z.string().length(26).nullable(),
  grantedByDecisionRecordId: z.string().length(26).nullable(),
});

export type DelegationDto = z.infer<typeof DelegationDtoSchema>;
