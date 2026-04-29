import { createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { invitations, members, memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

/**
 * Accept an invitation using its plaintext token.
 *
 * Upserts a Member for the invitee's email (if none exists), creates an
 * active Membership for (space, member), and marks the invitation accepted.
 * A second call with the same token fails the `acceptedAt IS NULL` filter.
 */

export type AcceptInvitationInput = {
  readonly plaintextToken: string;
};

export type AcceptInvitationOk = {
  readonly spaceId: string;
  readonly spaceSlug: string;
  readonly memberId: string;
  readonly membershipId: string;
};

export async function acceptInvitation(
  input: AcceptInvitationInput,
): Promise<Result<AcceptInvitationOk, AppError>> {
  const tokenHash = createHash('sha256').update(input.plaintextToken).digest('hex');
  const now = new Date();

  return db.transaction(async (tx) => {
    const found = await tx
      .select({
        id: invitations.id,
        spaceId: invitations.spaceId,
        invitedEmail: invitations.invitedEmail,
        spaceSlug: spaces.slug,
      })
      .from(invitations)
      .innerJoin(spaces, eq(spaces.id, invitations.spaceId))
      .where(
        and(
          eq(invitations.tokenHash, tokenHash),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, now),
        ),
      )
      .limit(1);

    const invitation = found[0];
    if (!invitation) {
      return err(errors.notFound('invitation'));
    }

    // Upsert Member by email.
    const existingMember = await tx
      .select({ id: members.id })
      .from(members)
      .where(eq(members.email, invitation.invitedEmail))
      .limit(1);

    let memberId: string;
    if (existingMember[0]) {
      memberId = existingMember[0].id;
    } else {
      memberId = ulid();
      await tx.insert(members).values({ id: memberId, email: invitation.invitedEmail });
    }

    // Reject if already a Membership in this Space.
    const duplicate = await tx
      .select({ id: memberships.id })
      .from(memberships)
      .where(and(eq(memberships.spaceId, invitation.spaceId), eq(memberships.memberId, memberId)))
      .limit(1);
    if (duplicate[0]) {
      return err(errors.conflict('membership', 'Already a member of this Space.'));
    }

    const membershipId = ulid();
    await tx.insert(memberships).values({
      id: membershipId,
      spaceId: invitation.spaceId,
      memberId,
      status: 'active',
      joinedAt: now,
    });

    // Atomically mark the invitation accepted. The WHERE preserves the
    // "not yet accepted" invariant if two requests race.
    const marked = await tx
      .update(invitations)
      .set({ acceptedAt: now, acceptedMembershipId: membershipId })
      .where(
        and(
          eq(invitations.id, invitation.id),
          isNull(invitations.acceptedAt),
          gt(invitations.expiresAt, now),
        ),
      )
      .returning({ id: invitations.id });
    if (!marked[0]) {
      return err(errors.conflict('invitation', 'Invitation was consumed in another request.'));
    }

    return ok({
      spaceId: invitation.spaceId,
      spaceSlug: invitation.spaceSlug,
      memberId,
      membershipId,
    });
  });
}
