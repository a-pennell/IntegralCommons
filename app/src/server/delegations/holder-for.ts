import { and, eq, gt, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/db';
import { delegations } from '@/db/schema';
import type { Delegation } from '@/db/schema';

/**
 * Capability lookup — find the active delegation-holder(s) for (space, issue,
 * capability). A delegation is active when:
 *   - revoked_at IS NULL, AND
 *   - expires_at IS NULL OR expires_at > now()
 *
 * Lookup precedence (for "who can facilitate Issue X?"):
 *   1. A per-Issue delegation (issue_id = X) if one exists.
 *   2. Otherwise a space-wide delegation (issue_id IS NULL).
 *
 * The partial index on `delegations(active_idx)` (see schema) makes both
 * paths cheap.
 */

type Capability = Delegation['capability'];

export async function findActiveDelegations(args: {
  readonly spaceId: string;
  readonly issueId?: string | null;
  readonly capability: Capability;
}): Promise<ReadonlyArray<Delegation>> {
  const activeClause = and(
    isNull(delegations.revokedAt),
    or(isNull(delegations.expiresAt), gt(delegations.expiresAt, sql`now()`)),
  );

  // Per-Issue pool.
  if (args.issueId) {
    const perIssue = await db
      .select()
      .from(delegations)
      .where(
        and(
          eq(delegations.spaceId, args.spaceId),
          eq(delegations.issueId, args.issueId),
          eq(delegations.capability, args.capability),
          activeClause,
        ),
      );
    if (perIssue.length > 0) return perIssue;
  }

  // Fall back to space-wide.
  return db
    .select()
    .from(delegations)
    .where(
      and(
        eq(delegations.spaceId, args.spaceId),
        isNull(delegations.issueId),
        eq(delegations.capability, args.capability),
        activeClause,
      ),
    );
}

/**
 * True iff `memberId` currently holds `capability` for `issueId` in the given
 * Space — either per-Issue or space-wide.
 */
export async function memberHoldsCapability(args: {
  readonly spaceId: string;
  readonly issueId: string;
  readonly memberId: string;
  readonly capability: Capability;
}): Promise<boolean> {
  const active = await findActiveDelegations({
    spaceId: args.spaceId,
    issueId: args.issueId,
    capability: args.capability,
  });
  return active.some((d) => d.granteeMemberId === args.memberId);
}
