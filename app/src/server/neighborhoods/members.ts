import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { members, neighborhoodMemberships } from '@/db/schema';
import type { Member, NeighborhoodMembership } from '@/db/schema';

export type NeighborhoodMember = {
  member: Member;
  membership: NeighborhoodMembership;
};

export async function listMembersForNeighborhood(
  neighborhoodId: string,
): Promise<NeighborhoodMember[]> {
  const rows = await db
    .select()
    .from(neighborhoodMemberships)
    .innerJoin(members, eq(members.id, neighborhoodMemberships.memberId))
    .where(
      and(
        eq(neighborhoodMemberships.neighborhoodId, neighborhoodId),
        isNull(neighborhoodMemberships.leftAt),
      ),
    )
    .orderBy(neighborhoodMemberships.joinedAt);

  return rows.map((r) => ({
    member: r.members,
    membership: r.neighborhood_memberships,
  }));
}

export async function setMembershipRole(
  membershipId: string,
  role: 'member' | 'steward',
): Promise<void> {
  await db
    .update(neighborhoodMemberships)
    .set({ role, updatedAt: new Date() })
    .where(eq(neighborhoodMemberships.id, membershipId));
}
