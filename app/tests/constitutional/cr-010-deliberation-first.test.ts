import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { delegations, members, memberships, referenda, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-010 — Deliberation first.
 *
 * Voting cannot start until the deliberation floor has elapsed. Default
 * floor: 72 hours (governance_profile.deliberation.standardIssueHours).
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedDeliberating(name: string) {
  const { db: seedDb } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const { grantDelegation } = await import('@/server/delegations/grant');
  const { initiateReferendum } = await import('@/server/referenda/initiate');

  const founderId = ulid();
  const granteeId = ulid();
  const spaceId = ulid();

  await seedDb.insert(members).values([
    { id: founderId, email: `${name}-f@test.test` },
    { id: granteeId, email: `${name}-g@test.test` },
  ]);
  await seedDb.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
    governanceProfile: {
      referendumThreshold: { minimumSupporters: 1, minimumSupportersPct: 0.05 },
      stability: { delegationGrantDays: 1 },
    },
  });
  await seedDb.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: granteeId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `CR-010 ${name}`,
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
  await seedDb
    .update(delegations)
    .set({ grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) })
    .where(eq(delegations.id, grant.value.delegationId));

  const init = await initiateReferendum({
    spaceId,
    initiatorMemberId: founderId,
    target: { type: 'delegation', delegationId: grant.value.delegationId },
  });
  if (!init.ok) throw new Error('init failed');

  return { spaceId, founderId, referendumId: init.value.referendumId };
}

describe('CR-010 — deliberation before voting', () => {
  it('refuses to start voting while deliberation floor is active', async () => {
    const { startReferendumVoting } = await import('@/server/referenda/start-voting');
    const { referendumId, founderId } = await seedDeliberating('cr010-a');

    const r = await startReferendumVoting({
      referendumId,
      actorMemberId: founderId,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('ConstitutionalViolation');
    if (r.error.kind !== 'ConstitutionalViolation') return;
    expect(r.error.cr).toBe('CR-010');
  });

  it('permits start once the floor has elapsed', async () => {
    const { startReferendumVoting } = await import('@/server/referenda/start-voting');
    const { referendumId, founderId } = await seedDeliberating('cr010-b');

    await db
      .update(referenda)
      .set({ deliberationStartedAt: new Date(Date.now() - 73 * 60 * 60 * 1000) })
      .where(eq(referenda.id, referendumId));

    const r = await startReferendumVoting({
      referendumId,
      actorMemberId: founderId,
    });
    expect(r.ok).toBe(true);
  });
});
