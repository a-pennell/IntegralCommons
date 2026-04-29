import { and, desc, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { delegations, members } from '@/db/schema';
import type { Delegation } from '@/db/schema';

/**
 * List delegations for a Space, optionally scoped to an Issue.
 *
 * `includeRevoked=false` (default) returns only active rows.
 */

export type DelegationWithGrantee = Delegation & {
  readonly granteeDisplayName: string | null;
};

export async function listDelegationsForSpace(args: {
  readonly spaceId: string;
  readonly issueId?: string | null;
  readonly includeRevoked?: boolean;
}): Promise<ReadonlyArray<DelegationWithGrantee>> {
  const clauses = [eq(delegations.spaceId, args.spaceId)];

  if (args.issueId !== undefined) {
    clauses.push(
      args.issueId === null ? isNull(delegations.issueId) : eq(delegations.issueId, args.issueId),
    );
  }

  if (!args.includeRevoked) {
    clauses.push(
      isNull(delegations.revokedAt),
      or(isNull(delegations.expiresAt), gt(delegations.expiresAt, sql`now()`))!,
    );
  }

  const rows = await db
    .select({ d: delegations, displayName: members.displayName })
    .from(delegations)
    .innerJoin(members, eq(members.id, delegations.granteeMemberId))
    .where(and(...clauses))
    .orderBy(desc(delegations.grantedAt));

  return rows.map(({ d, displayName }) => ({ ...d, granteeDisplayName: displayName }));
}
