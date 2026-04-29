import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { digestDeliveries, members, memberships, spaces } from '@/db/schema';
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

async function seedSpaceWithMember(name: string) {
  const { db } = testDb;
  const memberId = ulid();
  const spaceId = ulid();
  await db.insert(members).values({ id: memberId, email: `${name}@test.test` });
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
    digestCadenceDefault: 'weekly',
  });
  await db.insert(memberships).values({
    id: ulid(),
    spaceId,
    memberId,
    status: 'active',
  });
  return { memberId, spaceId };
}

describe('digest compose', () => {
  it('returns null when nothing has happened since `since` (FR-044)', async () => {
    const { composeDigest } = await import('@/server/digest/compose');
    const { memberId, spaceId } = await seedSpaceWithMember('digest-a');

    const result = await composeDigest({
      memberId,
      spaceId,
      spaceName: 'digest-a',
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });
    expect(result).toBeNull();
  });

  it('produces a digest body when new timeline events exist', async () => {
    const { composeDigest } = await import('@/server/digest/compose');
    const { createIssue } = await import('@/server/issues/create');
    const { memberId, spaceId } = await seedSpaceWithMember('digest-b');

    await createIssue({
      spaceId,
      creatorMemberId: memberId,
      title: 'Where does the storage room go?',
      scope: 'Allocate shared basement storage.',
    });

    const result = await composeDigest({
      memberId,
      spaceId,
      spaceName: 'digest-b',
      since: new Date(Date.now() - 60 * 60 * 1000),
    });
    expect(result).not.toBeNull();
    expect(result?.bodyText).toMatch(/storage room/i);
    expect(result?.contentHash).toHaveLength(64);
  });
});

describe('digest_deliveries idempotency', () => {
  it('UNIQUE (member, space, scheduled_for) blocks duplicate delivery rows', async () => {
    const { db } = testDb;
    const { memberId, spaceId } = await seedSpaceWithMember('digest-c');

    const bucket = new Date('2026-03-16T00:00:00Z');

    await db.insert(digestDeliveries).values({
      id: ulid(),
      memberId,
      spaceId,
      scheduledFor: bucket,
      contentHash: 'a'.repeat(64),
      dispatchedAdapter: 'pg-boss-email',
    });

    await expect(
      db.insert(digestDeliveries).values({
        id: ulid(),
        memberId,
        spaceId,
        scheduledFor: bucket,
        contentHash: 'b'.repeat(64),
        dispatchedAdapter: 'pg-boss-email',
      }),
    ).rejects.toThrow();

    const rows = await db
      .select()
      .from(digestDeliveries)
      .where(eq(digestDeliveries.memberId, memberId));
    expect(rows).toHaveLength(1);
  });
});
