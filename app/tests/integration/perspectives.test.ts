import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  members,
  memberships,
  perspectives,
  quorumStates,
  spaces,
  timelineEvents,
} from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedOpenIssue(name: string) {
  const { db } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const founderId = ulid();
  const spaceId = ulid();
  await db.insert(members).values({ id: founderId, email: `${name}@test.test` });
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
  });
  await db
    .insert(memberships)
    .values({ id: ulid(), spaceId, memberId: founderId, status: 'active' });
  const res = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `Issue for ${name}`,
    scope: 'Scope.',
  });
  if (!res.ok) throw new Error('create failed');
  return { founderId, spaceId, issueId: res.value.issueId };
}

describe('perspectives.submit', () => {
  it('stores the row, bumps participation_count, writes timeline event', async () => {
    const { db } = testDb;
    const { submitPerspective } = await import('@/server/perspectives/submit');
    const { founderId, issueId } = await seedOpenIssue('perspectives-a');

    const r = await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: '**Bold** take on the question.',
      taxonomyType: 'values',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    const row = await db
      .select()
      .from(perspectives)
      .where(eq(perspectives.id, r.value.perspectiveId))
      .limit(1);
    expect(row[0]?.taxonomyType).toBe('values');
    expect(row[0]?.parentPerspectiveId).toBeNull();

    const q = await db
      .select()
      .from(quorumStates)
      .where(eq(quorumStates.issueId, issueId))
      .limit(1);
    expect(q[0]?.participationCount).toBe(1);

    const ev = await db.select().from(timelineEvents).where(eq(timelineEvents.issueId, issueId));
    // issue_created + perspective_added
    expect(ev.map((e) => e.eventType).sort()).toEqual(['issue_created', 'perspective_added']);
  });

  it('rejects an invalid taxonomy type as ValidationError', async () => {
    const { submitPerspective } = await import('@/server/perspectives/submit');
    const { founderId, issueId } = await seedOpenIssue('perspectives-b');

    const r = await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: 'Body.',
      taxonomyType: 'not-in-vocab',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('ValidationError');
  });

  it('rejects a depth-2 reply at the service layer (FR-021)', async () => {
    const { submitPerspective } = await import('@/server/perspectives/submit');
    const { founderId, issueId } = await seedOpenIssue('perspectives-c');

    const top = await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: 'Top-level.',
      taxonomyType: 'values',
    });
    if (!top.ok) throw new Error('top submit failed');

    const reply = await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: 'Reply.',
      taxonomyType: 'values',
      parentPerspectiveId: top.value.perspectiveId,
    });
    if (!reply.ok) throw new Error('reply submit failed');

    const grandchild = await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: 'Grandchild — forbidden.',
      taxonomyType: 'values',
      parentPerspectiveId: reply.value.perspectiveId,
    });
    expect(grandchild.ok).toBe(false);
    if (grandchild.ok) return;
    expect(grandchild.error.kind).toBe('ValidationError');
  });

  it('keeps participation_count distinct-by-author', async () => {
    const { db } = testDb;
    const { submitPerspective } = await import('@/server/perspectives/submit');
    const { founderId, spaceId, issueId } = await seedOpenIssue('perspectives-d');

    // Seed a second active member.
    const secondMember = ulid();
    await db.insert(members).values({ id: secondMember, email: 'second@test.test' });
    await db
      .insert(memberships)
      .values({ id: ulid(), spaceId, memberId: secondMember, status: 'active' });

    // Founder posts twice; second member posts once → 2 distinct authors.
    await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: 'A1',
      taxonomyType: 'values',
    });
    await submitPerspective({
      issueId,
      authorMemberId: founderId,
      bodyMarkdown: 'A2',
      taxonomyType: 'risk',
    });
    await submitPerspective({
      issueId,
      authorMemberId: secondMember,
      bodyMarkdown: 'B1',
      taxonomyType: 'equity',
    });

    const q = await db
      .select()
      .from(quorumStates)
      .where(eq(quorumStates.issueId, issueId))
      .limit(1);
    expect(q[0]?.participationCount).toBe(2);
  });
});
