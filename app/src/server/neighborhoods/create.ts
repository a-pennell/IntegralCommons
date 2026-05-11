import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { neighborhoods } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export type CreateNeighborhoodInput = {
  readonly createdByMemberId: string;
  readonly name: string;
  readonly description?: string | undefined;
  readonly boundaryDescription?: string | undefined;
  readonly slug: string;
  readonly linkedSpaceId?: string;
};

export type CreateNeighborhoodOk = {
  readonly neighborhoodId: string;
  readonly slug: string;
};

export async function createNeighborhood(
  input: CreateNeighborhoodInput,
): Promise<Result<CreateNeighborhoodOk, AppError>> {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();

  if (name.length < 1 || name.length > 200) {
    return err(errors.validation([{ path: 'name', message: 'Name must be 1–200 characters.' }]));
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return err(
      errors.validation([
        { path: 'slug', message: 'Slug must be lowercase letters, numbers, and hyphens only.' },
      ]),
    );
  }

  const existing = await db
    .select({ id: neighborhoods.id })
    .from(neighborhoods)
    .where(eq(neighborhoods.slug, slug))
    .limit(1);
  if (existing[0]) {
    return err(errors.conflict('neighborhood', `Slug "${slug}" is already taken.`));
  }

  return transaction(async (tx) => {
    const neighborhoodId = ulid();
    await tx.query(
      `INSERT INTO neighborhoods (id, name, slug, description, boundary_description, status, linked_space_id, created_by_member_id)
       VALUES ($1, $2, $3, $4, $5, 'active', $6, $7)`,
      [
        neighborhoodId,
        name,
        slug,
        input.description?.trim() ?? '',
        input.boundaryDescription?.trim() ?? '',
        input.linkedSpaceId ?? null,
        input.createdByMemberId,
      ],
    );

    // Creator becomes the first steward.
    const membershipId = ulid();
    await tx.query(
      `INSERT INTO neighborhood_memberships (id, neighborhood_id, member_id, role, trust_level)
       VALUES ($1, $2, $3, 'steward', 1)`,
      [membershipId, neighborhoodId, input.createdByMemberId],
    );

    return ok({ neighborhoodId, slug });
  });
}
