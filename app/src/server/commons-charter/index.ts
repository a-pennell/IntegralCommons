import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { commonsCharterSections } from '@/db/schema';
import type { CommonsCharterSection } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export async function getCharterSections(neighborhoodId: string): Promise<CommonsCharterSection[]> {
  return db
    .select()
    .from(commonsCharterSections)
    .where(
      and(
        eq(commonsCharterSections.neighborhoodId, neighborhoodId),
        inArray(commonsCharterSections.status, ['draft', 'ratified']),
      ),
    )
    .orderBy(commonsCharterSections.sectionKey);
}

export async function draftCharterSection(args: {
  readonly neighborhoodId: string;
  readonly sectionKey: string;
  readonly title: string;
  readonly body: string;
  readonly draftedByMemberId: string;
}): Promise<Result<{ sectionId: string }, AppError>> {
  const title = args.title.trim();
  const body = args.body.trim();
  if (!title) {
    return err(errors.validation([{ path: 'title', message: 'Title is required.' }]));
  }
  if (!body) {
    return err(errors.validation([{ path: 'body', message: 'Body is required.' }]));
  }

  // Find existing ratified section for this key to determine version.
  const existing = await db
    .select({ id: commonsCharterSections.id, version: commonsCharterSections.version })
    .from(commonsCharterSections)
    .where(
      and(
        eq(commonsCharterSections.neighborhoodId, args.neighborhoodId),
        eq(commonsCharterSections.sectionKey, args.sectionKey),
        eq(commonsCharterSections.status, 'ratified'),
      ),
    )
    .limit(1);

  const nextVersion = existing[0] ? existing[0].version + 1 : 1;
  const sectionId = ulid();

  await db.insert(commonsCharterSections).values({
    id: sectionId,
    neighborhoodId: args.neighborhoodId,
    sectionKey: args.sectionKey,
    title,
    body,
    version: nextVersion,
    status: 'draft',
  });

  return ok({ sectionId });
}

export async function ratifyCharterSection(args: {
  readonly sectionId: string;
  readonly ratifiedByMemberId: string;
}): Promise<Result<void, AppError>> {
  const rows = await db
    .select()
    .from(commonsCharterSections)
    .where(eq(commonsCharterSections.id, args.sectionId))
    .limit(1);
  const section = rows[0];
  if (!section) return err(errors.notFound('charter_section'));
  if (section.status !== 'draft') {
    return err(errors.conflict('charter_section', 'Only draft sections can be ratified.'));
  }

  // Supersede any prior ratified section for this key.
  await db
    .update(commonsCharterSections)
    .set({ status: 'superseded', supersededById: args.sectionId, updatedAt: new Date() })
    .where(
      and(
        eq(commonsCharterSections.neighborhoodId, section.neighborhoodId),
        eq(commonsCharterSections.sectionKey, section.sectionKey),
        eq(commonsCharterSections.status, 'ratified'),
      ),
    );

  await db
    .update(commonsCharterSections)
    .set({
      status: 'ratified',
      ratifiedAt: new Date(),
      ratifiedByMemberId: args.ratifiedByMemberId,
      updatedAt: new Date(),
    })
    .where(eq(commonsCharterSections.id, args.sectionId));

  return ok(undefined);
}

/** Seed template charter sections for a new neighborhood. */
export async function seedTemplateCharter(neighborhoodId: string): Promise<void> {
  const templates = [
    {
      sectionKey: 'stewardship_principles',
      title: 'Stewardship Principles',
      body: 'Stewards are caretakers, not managers. The role rotates. Stewardship is a practice of listening and facilitating, not directing.',
    },
    {
      sectionKey: 'resource_guidelines',
      title: 'Resource Guidelines',
      body: 'Resources are offered in a spirit of abundance. Borrowers return things in the condition they received them. Tools that are not returned within a reasonable time become a conversation, not a conflict.',
    },
    {
      sectionKey: 'mutual_aid_principles',
      title: 'Mutual Aid Principles',
      body: 'We ask for what we need. We offer what we can. Neither giving nor receiving creates obligation. Urgency is respected — if something is marked urgent, the neighborhood responds.',
    },
    {
      sectionKey: 'conflict_resolution',
      title: 'Conflict Resolution',
      body: 'Conflicts are addressed directly between those involved first. Stewards can facilitate when asked. The neighborhood does not adjudicate — it supports.',
    },
  ];

  await db.insert(commonsCharterSections).values(
    templates.map((t) => ({
      id: ulid(),
      neighborhoodId,
      sectionKey: t.sectionKey,
      title: t.title,
      body: t.body,
      version: 1,
      status: 'draft' as const,
    })),
  );
}
