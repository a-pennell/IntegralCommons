import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { delegations, members, memberships, referenda, spaces } from '@/db/schema';
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

async function seedSpaceWithDelegation(name: string) {
  const { db } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const { grantDelegation } = await import('@/server/delegations/grant');

  const founderId = ulid();
  const facilitatorId = ulid();
  const voterId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: `${name}-f@test.test`, displayName: 'Founder' },
    { id: facilitatorId, email: `${name}-fac@test.test`, displayName: 'Facilitator' },
    { id: voterId, email: `${name}-v@test.test`, displayName: 'Voter' },
  ]);
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
    // Drop referendum threshold pct to 0 so minimumSupporters=2 always wins,
    // keeping the test deterministic.
    governanceProfile: {
      referendumThreshold: { minimumSupporters: 2, minimumSupportersPct: 0.05 },
      stability: {
        standardIssueDays: 30,
        policyChangeDays: 90,
        constitutionalAmendmentDays: 180,
        delegationGrantDays: 1, // tighten so tests don't need to wait 90 days
      },
    },
  });
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: facilitatorId, status: 'active' },
    { id: ulid(), spaceId, memberId: voterId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `Ref ${name}`,
    scope: 'Scope',
  });
  if (!issue.ok) throw new Error('create failed');

  // Grant the facilitator a per-Issue facilitation delegation — this is
  // what the referendum will target.
  const grant = await grantDelegation({
    spaceId,
    issueId: issue.value.issueId,
    granteeMemberId: facilitatorId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'group_consent',
  });
  if (!grant.ok) throw new Error('grant failed');

  // Backdate the grant to skirt the 1-day stability window set above.
  await db
    .update(delegations)
    .set({ grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) })
    .where(eq(delegations.id, grant.value.delegationId));

  return {
    spaceId,
    founderId,
    facilitatorId,
    voterId,
    issueId: issue.value.issueId,
    delegationId: grant.value.delegationId,
  };
}

describe('referenda lifecycle', () => {
  it('initiate → support → deliberation → voting → close with outcome=revoked', async () => {
    const { db } = testDb;
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { supportReferendum } = await import('@/server/referenda/support');
    const { startReferendumVoting } = await import('@/server/referenda/start-voting');
    const { castVote } = await import('@/server/referenda/cast-vote');
    const { closeReferendum } = await import('@/server/referenda/close');
    const { founderId, voterId, spaceId, delegationId } = await seedSpaceWithDelegation('ref-a');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    expect(init.ok).toBe(true);
    if (!init.ok) return;

    // Add a second supporter → threshold met → status becomes deliberating.
    const sup = await supportReferendum({
      referendumId: init.value.referendumId,
      supporterMemberId: voterId,
    });
    expect(sup.ok && sup.value.thresholdReached).toBe(true);

    // Fast-forward the deliberation start to before the floor so we can
    // start voting immediately.
    await db
      .update(referenda)
      .set({ deliberationStartedAt: new Date(Date.now() - 73 * 60 * 60 * 1000) })
      .where(eq(referenda.id, init.value.referendumId));

    const starts = await startReferendumVoting({
      referendumId: init.value.referendumId,
      actorMemberId: founderId,
    });
    expect(starts.ok).toBe(true);

    await castVote({
      referendumId: init.value.referendumId,
      voterMemberId: founderId,
      choice: 'support',
    });
    await castVote({
      referendumId: init.value.referendumId,
      voterMemberId: voterId,
      choice: 'support',
    });

    const closed = await closeReferendum({
      referendumId: init.value.referendumId,
      actorMemberId: founderId,
    });
    expect(closed.ok).toBe(true);
    if (!closed.ok) return;
    expect(closed.value.outcome).toBe('revoked');

    const delegation = await db
      .select()
      .from(delegations)
      .where(eq(delegations.id, delegationId))
      .limit(1);
    expect(delegation[0]?.revokedAt).not.toBeNull();
    expect(delegation[0]?.revokedByReferendumId).toBe(init.value.referendumId);
  });

  it('rate-limits a second initiation within the 7-day rolling window', async () => {
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { founderId, spaceId, delegationId } = await seedSpaceWithDelegation('ref-b');

    const first = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    expect(first.ok).toBe(true);

    // Needs a second delegation target to avoid the per-delegation stability
    // check hiding the rate-limit signal. Reuse the same one — stability
    // window is long enough that it's the limiting factor anyway, but a
    // rate-limit failure surfaces first.
    const second = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error.kind).toBe('RateLimited');
  });

  it('rejects vote while referendum is still in initiating/deliberating', async () => {
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { castVote } = await import('@/server/referenda/cast-vote');
    const { founderId, spaceId, delegationId } = await seedSpaceWithDelegation('ref-c');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    if (!init.ok) throw new Error('init failed');

    const early = await castVote({
      referendumId: init.value.referendumId,
      voterMemberId: founderId,
      choice: 'support',
    });
    expect(early.ok).toBe(false);
  });
});
