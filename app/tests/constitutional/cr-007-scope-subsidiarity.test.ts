import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-007 — Scope and Subsidiarity.
 *
 * Phase 5 enforcement point: Issue creation rejects scope tags that are not
 * in the Space's configured vocabulary. (The "hybrid rule" membership
 * computation at referendum time is covered by a follow-on test when the
 * referenda module lands in Phase 8.)
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedSpaceWithVocabulary(vocabulary: ReadonlyArray<string>) {
  const { db } = testDb;
  const founderId = ulid();
  const spaceId = ulid();
  await db
    .insert(members)
    .values({ id: founderId, email: `cr007-${founderId.slice(-8)}@test.test` });
  await db.insert(spaces).values({
    id: spaceId,
    name: 'Scoped Space',
    slug: `scoped-${spaceId.slice(-6).toLowerCase()}`,
    bootstrapCompletedAt: new Date(),
    governanceProfile: { scopeTagVocabulary: vocabulary },
  });
  await db
    .insert(memberships)
    .values({ id: ulid(), spaceId, memberId: founderId, status: 'active' });
  return { founderId, spaceId };
}

describe('CR-007 — scope tag vocabulary', () => {
  it('accepts scope tags that are in the vocabulary', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedSpaceWithVocabulary(['facilities', 'budget']);

    const r = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Facilities upgrade',
      scope: 'Replace common-area lighting.',
      scopeTags: ['facilities'],
    });
    expect(r.ok).toBe(true);
  });

  it('rejects scope tags that are NOT in the vocabulary with CR-007', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedSpaceWithVocabulary(['facilities', 'budget']);

    const r = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Off-vocabulary Issue',
      scope: 'Attempt to use a tag outside the vocabulary.',
      scopeTags: ['made-up-tag'],
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('ConstitutionalViolation');
    if (r.error.kind !== 'ConstitutionalViolation') return;
    expect(r.error.cr).toBe('CR-007');
  });

  it('rejects any scope tag when vocabulary is empty (governance Issue required)', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedSpaceWithVocabulary([]);

    const r = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Tagged Issue in tagless Space',
      scope: 'Should fail.',
      scopeTags: ['anything'],
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('ValidationError');
  });

  it('accepts zero scope tags unconditionally', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedSpaceWithVocabulary([]);

    const r = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Untagged Issue',
      scope: 'No scope tags.',
    });
    expect(r.ok).toBe(true);
  });
});
