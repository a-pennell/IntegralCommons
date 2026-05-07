import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { neighborhoodMemberships } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export async function joinNeighborhood(args: {
  readonly neighborhoodId: string;
  readonly memberId: string;
  readonly isAnonymous?: boolean;
}): Promise<Result<{ membershipId: string }, AppError>> {
  const existing = await db
    .select({ id: neighborhoodMemberships.id, leftAt: neighborhoodMemberships.leftAt })
    .from(neighborhoodMemberships)
    .where(
      and(
        eq(neighborhoodMemberships.neighborhoodId, args.neighborhoodId),
        eq(neighborhoodMemberships.memberId, args.memberId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    if (!existing[0].leftAt) {
      return err(errors.conflict('membership', 'Already a member of this neighborhood.'));
    }
    // Rejoin by clearing leftAt.
    await db
      .update(neighborhoodMemberships)
      .set({ leftAt: null, isAnonymous: args.isAnonymous ?? false, updatedAt: new Date() })
      .where(eq(neighborhoodMemberships.id, existing[0].id));
    return ok({ membershipId: existing[0].id });
  }

  const membershipId = ulid();
  await db.insert(neighborhoodMemberships).values({
    id: membershipId,
    neighborhoodId: args.neighborhoodId,
    memberId: args.memberId,
    role: args.isAnonymous ? 'anonymous' : 'member',
    isAnonymous: args.isAnonymous ?? false,
  });
  return ok({ membershipId });
}

export async function leaveNeighborhood(args: {
  readonly neighborhoodId: string;
  readonly memberId: string;
}): Promise<Result<void, AppError>> {
  const existing = await db
    .select({ id: neighborhoodMemberships.id })
    .from(neighborhoodMemberships)
    .where(
      and(
        eq(neighborhoodMemberships.neighborhoodId, args.neighborhoodId),
        eq(neighborhoodMemberships.memberId, args.memberId),
        isNull(neighborhoodMemberships.leftAt),
      ),
    )
    .limit(1);

  if (!existing[0]) return err(errors.notFound('membership'));

  await db
    .update(neighborhoodMemberships)
    .set({ leftAt: new Date(), updatedAt: new Date() })
    .where(eq(neighborhoodMemberships.id, existing[0].id));

  return ok(undefined);
}
