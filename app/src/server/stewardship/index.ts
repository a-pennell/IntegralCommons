import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { stewardshipEntries, neighborhoodMemberships } from '@/db/schema';
import type { StewardshipEntry } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export type WriteEntryInput = {
  readonly neighborhoodId: string;
  readonly actorMemberId: string;
  readonly subjectMemberId?: string;
  readonly entryType: 'action_taken' | 'member_care' | 'resource_noted' | 'charter_note' | 'handover';
  readonly notes?: string;
  readonly linkedResourceId?: string;
};

export async function writeStdEntry(
  input: WriteEntryInput,
): Promise<Result<{ entryId: string }, AppError>> {
  // Verify actor is a steward.
  const membership = await db
    .select({ role: neighborhoodMemberships.role })
    .from(neighborhoodMemberships)
    .where(
      and(
        eq(neighborhoodMemberships.neighborhoodId, input.neighborhoodId),
        eq(neighborhoodMemberships.memberId, input.actorMemberId),
      ),
    )
    .limit(1);

  if (!membership[0] || membership[0].role !== 'steward') {
    return err(errors.notAuthorized('steward role', 'Only stewards can write stewardship entries.'));
  }

  const entryId = ulid();
  await db.insert(stewardshipEntries).values({
    id: entryId,
    neighborhoodId: input.neighborhoodId,
    actorMemberId: input.actorMemberId,
    subjectMemberId: input.subjectMemberId ?? null,
    entryType: input.entryType,
    notes: input.notes?.trim() ?? '',
    linkedResourceId: input.linkedResourceId ?? null,
  });

  return ok({ entryId });
}

export async function listEntriesForNeighborhood(
  neighborhoodId: string,
  limit = 50,
): Promise<StewardshipEntry[]> {
  return db
    .select()
    .from(stewardshipEntries)
    .where(eq(stewardshipEntries.neighborhoodId, neighborhoodId))
    .orderBy(stewardshipEntries.occurredAt)
    .limit(limit);
}
