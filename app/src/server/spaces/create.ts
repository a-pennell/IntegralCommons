import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { disambiguate, slugify } from './slug.ts';

/**
 * Create a new Space. The caller (session owner) becomes its founding
 * member with status='active'. Pre-bootstrap: `bootstrap_completed_at` is
 * null, and the service layer blocks non-bootstrap Issue creation (CR-004,
 * enforced in `issues.create` at T091).
 */

export type CreateSpaceInput = {
  readonly name: string;
  readonly description?: string;
  readonly founderMemberId: string;
};

export type CreateSpaceOk = {
  readonly spaceId: string;
  readonly slug: string;
  readonly membershipId: string;
};

export async function createSpace(
  input: CreateSpaceInput,
): Promise<Result<CreateSpaceOk, AppError>> {
  const trimmedName = input.name.trim();
  if (trimmedName.length < 1 || trimmedName.length > 100) {
    return err(
      errors.validation([{ path: 'name', message: 'Space name must be 1–100 characters.' }]),
    );
  }

  // Resolve a unique slug. Attempt up to 10 disambiguations — if every
  // variant collides, something is very wrong; return a conflict.
  const base = slugify(trimmedName);
  let slug = base;
  for (let attempt = 1; attempt <= 10; attempt++) {
    slug = disambiguate(base, attempt);
    const existing = await db
      .select({ id: spaces.id })
      .from(spaces)
      .where(eq(spaces.slug, slug))
      .limit(1);
    if (existing.length === 0) break;
    if (attempt === 10) {
      return err(errors.conflict('space', `Unable to allocate a unique slug from "${base}".`));
    }
  }

  return db.transaction(async (tx) => {
    const spaceId = ulid();
    await tx.insert(spaces).values({
      id: spaceId,
      name: trimmedName,
      slug,
      ...(input.description !== undefined && { description: input.description }),
    });

    const membershipId = ulid();
    await tx.insert(memberships).values({
      id: membershipId,
      spaceId,
      memberId: input.founderMemberId,
      status: 'active',
      joinedAt: new Date(),
    });

    return ok({ spaceId, slug, membershipId });
  });
}
