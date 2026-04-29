import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/db';
import { memberships, spaces } from '@/db/schema';
import type { Membership, Space } from '@/db/schema';

/** Every Space the Member is currently in (status != 'departed'). */
export async function listSpacesForMember(
  memberId: string,
): Promise<ReadonlyArray<{ space: Space; membership: Membership }>> {
  return db
    .select({ space: spaces, membership: memberships })
    .from(memberships)
    .innerJoin(spaces, eq(spaces.id, memberships.spaceId))
    .where(and(eq(memberships.memberId, memberId), ne(memberships.status, 'departed')))
    .orderBy(spaces.createdAt);
}
