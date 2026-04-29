import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { invitations, memberships, members } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { enqueueEmailDispatch, getBossClient } from '@/server/jobs';

/**
 * Invite a member to a Space.
 *
 * Actor must hold an active Membership in the Space. Duplicate pending
 * invitations for the same email are rejected (Conflict). Emits an email
 * via pg-boss with the acceptance URL.
 */

const INVITATION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type InviteMemberInput = {
  readonly spaceId: string;
  readonly inviterMemberId: string;
  readonly email: string;
  readonly baseUrl: string;
};

export type InviteMemberOk = {
  readonly invitationId: string;
  readonly expiresAt: Date;
};

export async function inviteMember(
  input: InviteMemberInput,
): Promise<Result<InviteMemberOk, AppError>> {
  const email = input.email.trim().toLowerCase();

  // Verify inviter has an active Membership.
  const membership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, input.spaceId),
        eq(memberships.memberId, input.inviterMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!membership[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Only active members can invite others.',
      ),
    );
  }

  // Reject if the invitee is already a Member of this Space.
  const existingMemberRows = await db
    .select({ memberId: memberships.memberId })
    .from(memberships)
    .innerJoin(members, eq(members.id, memberships.memberId))
    .where(and(eq(memberships.spaceId, input.spaceId), eq(members.email, email)))
    .limit(1);
  if (existingMemberRows[0]) {
    return err(errors.conflict('membership', 'That email is already a member of this Space.'));
  }

  // Reject if an unexpired, unaccepted invitation already exists.
  const duplicate = await db
    .select({ id: invitations.id })
    .from(invitations)
    .where(
      and(
        eq(invitations.spaceId, input.spaceId),
        eq(invitations.invitedEmail, email),
        isNull(invitations.acceptedAt),
        gt(invitations.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (duplicate[0]) {
    return err(
      errors.conflict(
        'invitation',
        'A pending invitation for that email already exists for this Space.',
      ),
    );
  }

  const plaintextToken = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(plaintextToken).digest('hex');
  const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);
  const invitationId = ulid();

  await db.insert(invitations).values({
    id: invitationId,
    spaceId: input.spaceId,
    invitedEmail: email,
    invitedByMemberId: input.inviterMemberId,
    tokenHash,
    expiresAt,
  });

  const acceptUrl = new URL(`/accept/${plaintextToken}`, input.baseUrl);

  const boss = await getBossClient();
  await enqueueEmailDispatch(boss, {
    to: email,
    subject: 'You are invited to a CommonGround Space',
    bodyText: renderInviteText(acceptUrl.toString()),
    bodyHtml: renderInviteHtml(acceptUrl.toString()),
    messageId: `invitation:${invitationId}`,
  });

  return ok({ invitationId, expiresAt });
}

function renderInviteText(url: string): string {
  return [
    'You have been invited to a CommonGround Space.',
    '',
    `Accept the invitation: ${url}`,
    '',
    'The invitation expires in 14 days.',
  ].join('\n');
}

function renderInviteHtml(url: string): string {
  const safe = url.replace(/"/g, '&quot;');
  return [
    '<p>You have been invited to a CommonGround Space.</p>',
    `<p><a href="${safe}">Accept the invitation</a></p>`,
    '<p style="color:#6b6b66">The invitation expires in 14 days.</p>',
  ].join('');
}
