import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { delegations, members, memberships, referenda, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-006 — Bounded referendum right.
 *
 * A referendum may only proceed when the initiation threshold has been met.
 * Below threshold, the referendum stays in `initiating`; voting cannot start.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seed(name: string) {
  const { db } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const { grantDelegation } = await import('@/server/delegations/grant');

  const founderId = ulid();
  const otherId = ulid();
  const thirdId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: `${name}-f@test.test` },
    { id: otherId, email: `${name}-o@test.test` },
    { id: thirdId, email: `${name}-t@test.test` },
  ]);
  // Threshold: max(minimumSupporters=3, ceil(activeCount * pct)) = 3 ← forces
  // three supporters, so a single-initiator referendum is below threshold.
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
    governanceProfile: {
      referendumThreshold: { minimumSupporters: 3, minimumSupportersPct: 0.05 },
      stability: { delegationGrantDays: 1 },
    },
  });
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: otherId, status: 'active' },
    { id: ulid(), spaceId, memberId: thirdId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `CR-006 ${name}`,
    scope: 'scope',
  });
  if (!issue.ok) throw new Error('create failed');

  const grant = await grantDelegation({
    spaceId,
    issueId: issue.value.issueId,
    granteeMemberId: otherId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'group_consent',
  });
  if (!grant.ok) throw new Error('grant failed');

  await db
    .update(delegations)
    .set({ grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) })
    .where(eq(delegations.id, grant.value.delegationId));

  return {
    spaceId,
    founderId,
    otherId,
    thirdId,
    delegationId: grant.value.delegationId,
  };
}

describe('CR-006 — bounded referendum', () => {
  it('stays in `initiating` until threshold met; cannot start voting early', async () => {
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { startReferendumVoting } = await import('@/server/referenda/start-voting');
    const { founderId, spaceId, delegationId } = await seed('cr006-a');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    if (!init.ok) throw new Error('init failed');

    const started = await startReferendumVoting({
      referendumId: init.value.referendumId,
      actorMemberId: founderId,
    });
    expect(started.ok).toBe(false);
    if (started.ok) return;
    expect(started.error.kind).toBe('Conflict');
  });

  it('reaches deliberating once enough members co-sign', async () => {
    const { db } = testDb;
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { supportReferendum } = await import('@/server/referenda/support');
    const { founderId, otherId, thirdId, spaceId, delegationId } = await seed('cr006-b');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    if (!init.ok) throw new Error('init failed');

    const s1 = await supportReferendum({
      referendumId: init.value.referendumId,
      supporterMemberId: otherId,
    });
    expect(s1.ok && s1.value.thresholdReached).toBe(false);

    const s2 = await supportReferendum({
      referendumId: init.value.referendumId,
      supporterMemberId: thirdId,
    });
    expect(s2.ok && s2.value.thresholdReached).toBe(true);

    const row = await db
      .select({ status: referenda.status })
      .from(referenda)
      .where(eq(referenda.id, init.value.referendumId))
      .limit(1);
    expect(row[0]?.status).toBe('deliberating');
  });
});
