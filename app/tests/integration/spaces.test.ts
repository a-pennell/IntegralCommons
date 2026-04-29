import { createHash } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { invitations, memberships, members, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * Spaces integration test.
 *
 * Covers T078: create → invite → accept → duplicate-accept rejected.
 *
 * Like the auth test, we don't invoke the invite flow through pg-boss (that
 * would pull in the email queue). Instead we insert an invitation row and
 * call acceptInvitation directly.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

describe('spaces', () => {
  it('create assigns a unique slug and makes the founder an active member', async () => {
    const { db } = testDb;
    const { createSpace } = await import('@/server/spaces/create');

    const founderId = ulid();
    await db.insert(members).values({ id: founderId, email: 'founder1@example.test' });

    const result = await createSpace({ name: 'Test Coop', founderMemberId: founderId });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const space = await db
      .select()
      .from(spaces)
      .where(eq(spaces.id, result.value.spaceId))
      .limit(1);
    expect(space[0]?.slug).toBe('test-coop');

    const mship = await db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.spaceId, result.value.spaceId), eq(memberships.memberId, founderId)),
      )
      .limit(1);
    expect(mship[0]?.status).toBe('active');
  });

  it('create produces disambiguated slugs when names collide', async () => {
    const { db } = testDb;
    const { createSpace } = await import('@/server/spaces/create');

    const founderId = ulid();
    await db.insert(members).values({ id: founderId, email: 'founder2@example.test' });

    const a = await createSpace({ name: 'Same Name Co', founderMemberId: founderId });
    const b = await createSpace({ name: 'Same Name Co', founderMemberId: founderId });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.value.slug).toBe('same-name-co');
    expect(b.value.slug).toBe('same-name-co-2');
  });

  it('acceptInvitation creates a Member + Membership and marks accepted', async () => {
    const { db } = testDb;
    const { createSpace } = await import('@/server/spaces/create');
    const { acceptInvitation } = await import('@/server/spaces/accept-invitation');

    const founderId = ulid();
    await db.insert(members).values({ id: founderId, email: 'founder3@example.test' });

    const spaceRes = await createSpace({ name: 'Accept Demo', founderMemberId: founderId });
    if (!spaceRes.ok) throw new Error('space create failed');

    const plaintext = 'invitation-plaintext-token-abc-123';
    const tokenHash = createHash('sha256').update(plaintext).digest('hex');
    await db.insert(invitations).values({
      id: ulid(),
      spaceId: spaceRes.value.spaceId,
      invitedEmail: 'joiner@example.test',
      invitedByMemberId: founderId,
      tokenHash,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    const accept = await acceptInvitation({ plaintextToken: plaintext });
    expect(accept.ok).toBe(true);
    if (!accept.ok) return;
    expect(accept.value.spaceSlug).toBe('accept-demo');

    const joiner = await db
      .select()
      .from(members)
      .where(eq(members.email, 'joiner@example.test'))
      .limit(1);
    expect(joiner[0]?.id).toBe(accept.value.memberId);

    const second = await acceptInvitation({ plaintextToken: plaintext });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error.kind).toBe('NotFound');
  });
});
