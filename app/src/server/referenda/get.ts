import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { referenda, referendumSupporters, referendumVotes } from '@/db/schema';
import type { Referendum, ReferendumSupporter, ReferendumVote } from '@/db/schema';

export async function getReferendum(referendumId: string): Promise<Referendum | null> {
  const rows = await db.select().from(referenda).where(eq(referenda.id, referendumId)).limit(1);
  return rows[0] ?? null;
}

export async function listReferendaForSpace(spaceId: string): Promise<ReadonlyArray<Referendum>> {
  return db
    .select()
    .from(referenda)
    .where(eq(referenda.spaceId, spaceId))
    .orderBy(desc(referenda.createdAt));
}

export async function listSupporters(
  referendumId: string,
): Promise<ReadonlyArray<ReferendumSupporter>> {
  return db
    .select()
    .from(referendumSupporters)
    .where(eq(referendumSupporters.referendumId, referendumId));
}

export async function listVotes(referendumId: string): Promise<ReadonlyArray<ReferendumVote>> {
  return db.select().from(referendumVotes).where(eq(referendumVotes.referendumId, referendumId));
}
