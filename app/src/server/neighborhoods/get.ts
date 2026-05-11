import { and, count, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { neighborhoods, neighborhoodMemberships } from '@/db/schema';
import type { Neighborhood, NeighborhoodMembership } from '@/db/schema';

export type NeighborhoodSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  memberCount: number;
  isMember: boolean;
};

export async function listAllNeighborhoods(memberId: string): Promise<NeighborhoodSummary[]> {
  const rows = await db
    .select({
      id: neighborhoods.id,
      name: neighborhoods.name,
      slug: neighborhoods.slug,
      description: neighborhoods.description,
    })
    .from(neighborhoods)
    .where(eq(neighborhoods.status, 'active'))
    .orderBy(neighborhoods.name);

  if (rows.length === 0) return [];

  const neighborhoodIds = rows.map((r) => r.id);

  const [membershipRows, countRows] = await Promise.all([
    db
      .select({ neighborhoodId: neighborhoodMemberships.neighborhoodId })
      .from(neighborhoodMemberships)
      .where(
        and(
          eq(neighborhoodMemberships.memberId, memberId),
          isNull(neighborhoodMemberships.leftAt),
        ),
      ),
    db
      .select({
        neighborhoodId: neighborhoodMemberships.neighborhoodId,
        count: count(),
      })
      .from(neighborhoodMemberships)
      .where(isNull(neighborhoodMemberships.leftAt))
      .groupBy(neighborhoodMemberships.neighborhoodId),
  ]);

  const memberOf = new Set(membershipRows.map((r) => r.neighborhoodId));
  const countMap = new Map(countRows.map((r) => [r.neighborhoodId, r.count]));

  return rows
    .filter((r) => neighborhoodIds.includes(r.id))
    .map((r) => ({
      ...r,
      memberCount: countMap.get(r.id) ?? 0,
      isMember: memberOf.has(r.id),
    }));
}

export async function getNeighborhoodBySlug(slug: string): Promise<Neighborhood | null> {
  const rows = await db
    .select()
    .from(neighborhoods)
    .where(eq(neighborhoods.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function getNeighborhoodBySlugForMember(
  slug: string,
  memberId: string,
): Promise<{ neighborhood: Neighborhood; membership: NeighborhoodMembership } | null> {
  const rows = await db
    .select()
    .from(neighborhoods)
    .innerJoin(
      neighborhoodMemberships,
      and(
        eq(neighborhoodMemberships.neighborhoodId, neighborhoods.id),
        eq(neighborhoodMemberships.memberId, memberId),
      ),
    )
    .where(eq(neighborhoods.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { neighborhood: row.neighborhoods, membership: row.neighborhood_memberships };
}

export async function getMembershipForNeighborhood(
  neighborhoodId: string,
  memberId: string,
): Promise<NeighborhoodMembership | null> {
  const rows = await db
    .select()
    .from(neighborhoodMemberships)
    .where(
      and(
        eq(neighborhoodMemberships.neighborhoodId, neighborhoodId),
        eq(neighborhoodMemberships.memberId, memberId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}
