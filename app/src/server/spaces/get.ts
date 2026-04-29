import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { memberships, spaces } from '@/db/schema';
import type { Space, Membership } from '@/db/schema';

/**
 * Read helpers for Space + Membership. Service-layer reads always filter
 * by caller's Membership — no "find by slug" path exposes Spaces to
 * non-members.
 */

export type SpaceWithMembership = {
  readonly space: Space;
  readonly membership: Membership;
};

/** Find a Space by slug, scoped to what the caller can see. */
export async function getSpaceBySlugForMember(
  slug: string,
  memberId: string,
): Promise<SpaceWithMembership | null> {
  const rows = await db
    .select({ space: spaces, membership: memberships })
    .from(spaces)
    .innerJoin(
      memberships,
      and(eq(memberships.spaceId, spaces.id), eq(memberships.memberId, memberId)),
    )
    .where(eq(spaces.slug, slug))
    .limit(1);

  return rows[0] ?? null;
}

/** Find a Space by id, scoped to the caller's Membership. */
export async function getSpaceByIdForMember(
  spaceId: string,
  memberId: string,
): Promise<SpaceWithMembership | null> {
  const rows = await db
    .select({ space: spaces, membership: memberships })
    .from(spaces)
    .innerJoin(
      memberships,
      and(eq(memberships.spaceId, spaces.id), eq(memberships.memberId, memberId)),
    )
    .where(eq(spaces.id, spaceId))
    .limit(1);

  return rows[0] ?? null;
}
