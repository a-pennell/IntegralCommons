import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { resources } from '@/db/schema';
import type { Resource } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export type CreateResourceInput = {
  readonly neighborhoodId: string;
  readonly offeredByMemberId?: string;
  readonly title: string;
  readonly description?: string;
  readonly kind: 'tool' | 'space' | 'skill' | 'material' | 'other';
  readonly locationHint?: string;
  readonly tags?: string[];
};

export async function createResource(
  input: CreateResourceInput,
): Promise<Result<{ resourceId: string }, AppError>> {
  const title = input.title.trim();
  if (title.length < 1 || title.length > 200) {
    return err(errors.validation([{ path: 'title', message: 'Title must be 1–200 characters.' }]));
  }

  const resourceId = ulid();
  await db.insert(resources).values({
    id: resourceId,
    neighborhoodId: input.neighborhoodId,
    offeredByMemberId: input.offeredByMemberId ?? null,
    title,
    description: input.description?.trim() ?? '',
    kind: input.kind,
    status: 'available',
    locationHint: input.locationHint?.trim() ?? null,
    tags: input.tags ?? [],
  });

  return ok({ resourceId });
}

export async function listResourcesForNeighborhood(neighborhoodId: string): Promise<Resource[]> {
  return db
    .select()
    .from(resources)
    .where(and(eq(resources.neighborhoodId, neighborhoodId), eq(resources.status, 'available')))
    .orderBy(resources.createdAt);
}

export async function getResourceById(resourceId: string): Promise<Resource | null> {
  const rows = await db.select().from(resources).where(eq(resources.id, resourceId)).limit(1);
  return rows[0] ?? null;
}

export async function updateResourceStatus(
  resourceId: string,
  status: 'available' | 'unavailable' | 'removed',
): Promise<Result<void, AppError>> {
  const existing = await db
    .select({ id: resources.id })
    .from(resources)
    .where(eq(resources.id, resourceId))
    .limit(1);
  if (!existing[0]) return err(errors.notFound('resource'));

  await db
    .update(resources)
    .set({ status, updatedAt: new Date() })
    .where(eq(resources.id, resourceId));

  return ok(undefined);
}
