import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { producers } from '@/db/schema';
import type { Producer } from '@/db/schema';
import type { Result } from '@/lib/result';
import { ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export async function listActiveProducers(): Promise<Producer[]> {
  return db
    .select()
    .from(producers)
    .where(eq(producers.status, 'active'))
    .orderBy(producers.orgName);
}

export async function getProducerById(producerId: string): Promise<Producer | null> {
  const rows = await db.select().from(producers).where(eq(producers.id, producerId)).limit(1);
  return rows[0] ?? null;
}

export async function getProducerByMember(memberId: string): Promise<Producer | null> {
  const rows = await db
    .select()
    .from(producers)
    .where(and(eq(producers.managedByMemberId, memberId), eq(producers.status, 'active')))
    .limit(1);
  return rows[0] ?? null;
}

export async function registerProducer(args: {
  readonly managedByMemberId: string;
  readonly orgName: string;
  readonly locationDescription: string;
  readonly bio?: string;
  readonly isPublic?: boolean;
}): Promise<Result<{ producerId: string }, never>> {
  const producerId = ulid();
  await db.insert(producers).values({
    id: producerId,
    managedByMemberId: args.managedByMemberId,
    orgName: args.orgName.trim(),
    locationDescription: args.locationDescription.trim(),
    ...(args.bio ? { bio: args.bio.trim() } : {}),
    isPublic: args.isPublic ?? true,
  });
  return ok({ producerId });
}
