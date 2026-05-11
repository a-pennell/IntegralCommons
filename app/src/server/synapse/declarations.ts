import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { surplusShortageDeclarations, producers } from '@/db/schema';
import type { SurplusShortageDeclaration, Producer } from '@/db/schema';
import type { Result } from '@/lib/result';
import { ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export type DeclarationWithProducer = SurplusShortageDeclaration & {
  producer: Producer;
};

export async function listActiveDeclarations(): Promise<DeclarationWithProducer[]> {
  const rows = await db
    .select()
    .from(surplusShortageDeclarations)
    .innerJoin(producers, eq(producers.id, surplusShortageDeclarations.producerId))
    .where(eq(surplusShortageDeclarations.status, 'active'))
    .orderBy(desc(surplusShortageDeclarations.createdAt));

  return rows.map((r) => ({
    ...r.surplus_shortage_declarations,
    producer: r.producers,
  }));
}

export async function listDeclarationsForProducer(
  producerId: string,
): Promise<SurplusShortageDeclaration[]> {
  return db
    .select()
    .from(surplusShortageDeclarations)
    .where(
      and(
        eq(surplusShortageDeclarations.producerId, producerId),
        inArray(surplusShortageDeclarations.status, ['active']),
      ),
    )
    .orderBy(desc(surplusShortageDeclarations.createdAt));
}

export async function getDeclarationById(
  declarationId: string,
): Promise<DeclarationWithProducer | null> {
  const rows = await db
    .select()
    .from(surplusShortageDeclarations)
    .innerJoin(producers, eq(producers.id, surplusShortageDeclarations.producerId))
    .where(eq(surplusShortageDeclarations.id, declarationId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return { ...row.surplus_shortage_declarations, producer: row.producers };
}

export async function createDeclaration(args: {
  readonly producerId: string;
  readonly kind: 'surplus' | 'shortage';
  readonly resourceType: SurplusShortageDeclaration['resourceType'];
  readonly resourceDetail?: string;
  readonly quantity?: string;
  readonly unit?: string;
  readonly availableFrom: string;
  readonly availableUntil?: string;
  readonly locationDescription?: string;
  readonly exchangeTerms: 'free' | 'exchange' | 'cost_recovery';
  readonly conditions?: string;
}): Promise<Result<{ declarationId: string }, never>> {
  const declarationId = ulid();
  await db.insert(surplusShortageDeclarations).values({
    id: declarationId,
    producerId: args.producerId,
    kind: args.kind,
    resourceType: args.resourceType,
    availableFrom: args.availableFrom,
    exchangeTerms: args.exchangeTerms,
    ...(args.resourceDetail ? { resourceDetail: args.resourceDetail } : {}),
    ...(args.quantity ? { quantity: args.quantity } : {}),
    ...(args.unit ? { unit: args.unit } : {}),
    ...(args.availableUntil ? { availableUntil: args.availableUntil } : {}),
    ...(args.locationDescription ? { locationDescription: args.locationDescription } : {}),
    ...(args.conditions ? { conditions: args.conditions } : {}),
  });
  return ok({ declarationId });
}

export async function withdrawDeclaration(declarationId: string): Promise<void> {
  await db
    .update(surplusShortageDeclarations)
    .set({ status: 'withdrawn', updatedAt: new Date() })
    .where(eq(surplusShortageDeclarations.id, declarationId));
}
