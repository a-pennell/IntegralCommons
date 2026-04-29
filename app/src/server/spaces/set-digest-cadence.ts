import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';

/**
 * Per-member digest-cadence override (FR-045).
 *
 * A member may set their own cadence LOWER than the Space default (e.g.,
 * pick monthly when the default is weekly, or off entirely). They may not
 * raise it above the Space default — that's the Space's choice.
 *
 * Values: 'daily' | 'weekly' | 'monthly' | 'off'.
 */

type Cadence = 'daily' | 'weekly' | 'monthly' | 'off';

const CADENCE_RANK: Record<Cadence, number> = {
  daily: 4,
  weekly: 3,
  monthly: 2,
  off: 1,
};

export async function setDigestCadence(args: {
  readonly memberId: string;
  readonly spaceId: string;
  readonly cadence: Cadence;
}): Promise<Result<void, AppError>> {
  const space = await db
    .select({ digestCadenceDefault: spaces.digestCadenceDefault })
    .from(spaces)
    .where(eq(spaces.id, args.spaceId))
    .limit(1);
  if (!space[0]) return err(errors.notFound('space'));

  const spaceDefault = space[0].digestCadenceDefault as Cadence;
  if (CADENCE_RANK[args.cadence] > CADENCE_RANK[spaceDefault]) {
    return err(
      errors.validation([
        {
          path: 'cadence',
          message: `Cannot set a more frequent cadence than the Space default (${spaceDefault}). You may lower it or set it to "off".`,
        },
      ]),
    );
  }

  const result = await db
    .update(memberships)
    .set({ digestCadence: args.cadence, updatedAt: new Date() })
    .where(and(eq(memberships.spaceId, args.spaceId), eq(memberships.memberId, args.memberId)))
    .returning({ id: memberships.id });
  if (!result[0]) return err(errors.notFound('membership'));
  return ok(undefined);
}
