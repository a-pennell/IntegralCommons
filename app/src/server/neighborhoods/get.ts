import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { neighborhoods, neighborhoodMemberships } from '@/db/schema';
import type { Neighborhood, NeighborhoodMembership } from '@/db/schema';

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
