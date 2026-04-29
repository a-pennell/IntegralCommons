import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { memberships } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Grant a Delegation.
 *
 * Delegations are revocable by design (CR-005, enforced structurally — the
 * schema has no `irrevocable` column). A grant can be:
 *   - per-Issue (issue_id set) — scoped to that Issue.
 *   - space-wide (issue_id null) — applies across the Space.
 *
 * Grant sources:
 *   - `bootstrap` — the initial self-grant at Space create (Phase 1 only path
 *     while bootstrap is in flight).
 *   - `group_consent` — a Decision Record finalized the delegation.
 *   - `predecessor_delegation` — an existing delegation-holder re-granted.
 *
 * Writes a `delegation_granted` Civic Memory event. Per-Issue grants are
 * tied to an Issue and therefore emit against that Issue's timeline;
 * space-wide grants do not have an Issue context — in that case we require
 * `granted_by_decision_record_id` to tell us where to log the event.
 */

export type GrantDelegationInput = {
  readonly spaceId: string;
  readonly issueId?: string | null;
  readonly granteeMemberId: string;
  readonly granterMemberId: string;
  readonly capability: 'facilitation';
  readonly grantedByType: 'bootstrap' | 'group_consent' | 'predecessor_delegation';
  readonly grantedByDecisionRecordId?: string | null;
  readonly expiresAt?: Date | null;
};

export type GrantDelegationOk = { readonly delegationId: string };

export async function grantDelegation(
  input: GrantDelegationInput,
): Promise<Result<GrantDelegationOk, AppError>> {
  // Grantee must be an active Member of the Space.
  const grantee = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, input.spaceId),
        eq(memberships.memberId, input.granteeMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!grantee[0]) {
    return err(
      errors.validation([
        {
          path: 'granteeMemberId',
          message: 'Grantee must be an active member of the Space.',
        },
      ]),
    );
  }

  if (
    input.issueId === null &&
    !input.grantedByDecisionRecordId &&
    input.grantedByType !== 'bootstrap'
  ) {
    return err(
      errors.validation([
        {
          path: 'grantedByDecisionRecordId',
          message:
            'Space-wide delegations (issueId=null) must be tied to a Decision Record, except during bootstrap.',
        },
      ]),
    );
  }

  return transaction(async (tx) => {
    const delegationId = ulid();
    await tx.query(
      `INSERT INTO delegations (
         id, space_id, issue_id, grantee_member_id, granted_by_type,
         granted_by_decision_record_id, capability, expires_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        delegationId,
        input.spaceId,
        input.issueId ?? null,
        input.granteeMemberId,
        input.grantedByType,
        input.grantedByDecisionRecordId ?? null,
        input.capability,
        input.expiresAt ?? null,
      ],
    );

    if (input.issueId) {
      await writeTimelineEvent(tx, {
        issueId: input.issueId,
        eventType: 'delegation_granted',
        actorMemberId: input.granterMemberId,
        payload: {
          delegationId,
          granteeMemberId: input.granteeMemberId,
          capability: input.capability,
          grantedByType: input.grantedByType,
          expiresAt: input.expiresAt ?? null,
        },
      });
    }
    // Space-wide delegations with no Issue context — no timeline write here.
    // The T175 governance-change flow (Phase 13) emits the event against the
    // governance meta-Issue when that lands.

    return ok({ delegationId });
  });
}
