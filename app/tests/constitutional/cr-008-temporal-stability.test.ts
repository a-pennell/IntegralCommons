import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { delegations, members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-008 — Temporal stability.
 *
 * A delegation cannot be challenged within the stability window after
 * grant. Default is 30 days; Phase 1 tightens to 1 day in these tests so
 * the backdate trick is obvious.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedFreshlyGrantedDelegation(name: string) {
  const { db } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const { grantDelegation } = await import('@/server/delegations/grant');

  const founderId = ulid();
  const granteeId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: `${name}-f@test.test` },
    { id: granteeId, email: `${name}-g@test.test` },
  ]);
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
    // Stability window: 30 days (default). Grant is fresh so guard fires.
  });
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: granteeId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `CR-008 ${name}`,
    scope: 'scope',
  });
  if (!issue.ok) throw new Error('create failed');

  const grant = await grantDelegation({
    spaceId,
    issueId: issue.value.issueId,
    granteeMemberId: granteeId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'group_consent',
  });
  if (!grant.ok) throw new Error('grant failed');

  return { spaceId, founderId, delegationId: grant.value.delegationId };
}

describe('CR-008 — temporal stability', () => {
  it('refuses a referendum initiated inside the stability window', async () => {
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { founderId, spaceId, delegationId } = await seedFreshlyGrantedDelegation('cr008-a');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    expect(init.ok).toBe(false);
    if (init.ok) return;
    expect(init.error.kind).toBe('ConstitutionalViolation');
    if (init.error.kind !== 'ConstitutionalViolation') return;
    expect(init.error.cr).toBe('CR-008');
  });

  it('permits initiation once the stability window has elapsed', async () => {
    const { db } = testDb;
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { founderId, spaceId, delegationId } = await seedFreshlyGrantedDelegation('cr008-b');

    // Backdate grant beyond the 30-day default floor.
    await db
      .update(delegations)
      .set({ grantedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) })
      .where(eq(delegations.id, delegationId));

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    expect(init.ok).toBe(true);
  });
});
