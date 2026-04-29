import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { delegations, members, memberships, referenda, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-001 — Removal due process.
 *
 * The subject of a removal referendum may submit Perspectives but may NOT
 * cast a vote on their own removal. In Phase 1 this is enforced for
 * referenda targeting delegations held by the subject.
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
  const subjectId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: `${name}-f@test.test` },
    { id: subjectId, email: `${name}-s@test.test` },
  ]);
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
    governanceProfile: {
      referendumThreshold: { minimumSupporters: 1, minimumSupportersPct: 0.05 },
      stability: { delegationGrantDays: 1 },
    },
  });
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: subjectId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `CR-001 ${name}`,
    scope: 'scope',
  });
  if (!issue.ok) throw new Error('create failed');

  const grant = await grantDelegation({
    spaceId,
    issueId: issue.value.issueId,
    granteeMemberId: subjectId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'group_consent',
  });
  if (!grant.ok) throw new Error('grant failed');

  await db
    .update(delegations)
    .set({ grantedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) })
    .where(eq(delegations.id, grant.value.delegationId));

  return { spaceId, founderId, subjectId, delegationId: grant.value.delegationId };
}

describe('CR-001 — subject cannot vote on own removal', () => {
  it('subject is blocked from voting on a referendum targeting their delegation', async () => {
    const { db } = testDb;
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { castVote } = await import('@/server/referenda/cast-vote');
    const { founderId, subjectId, spaceId, delegationId } = await seed('cr001-a');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    if (!init.ok) throw new Error('init failed');

    // Fast-forward deliberation and flip to voting.
    await db
      .update(referenda)
      .set({
        deliberationStartedAt: new Date(Date.now() - 73 * 60 * 60 * 1000),
        votingStartedAt: new Date(),
        status: 'voting',
      })
      .where(eq(referenda.id, init.value.referendumId));

    const subjectVote = await castVote({
      referendumId: init.value.referendumId,
      voterMemberId: subjectId,
      choice: 'oppose',
    });
    expect(subjectVote.ok).toBe(false);
    if (subjectVote.ok) return;
    expect(subjectVote.error.kind).toBe('ConstitutionalViolation');
    if (subjectVote.error.kind !== 'ConstitutionalViolation') return;
    expect(subjectVote.error.cr).toBe('CR-001');
  });

  it('non-subject may vote normally', async () => {
    const { db } = testDb;
    const { initiateReferendum } = await import('@/server/referenda/initiate');
    const { castVote } = await import('@/server/referenda/cast-vote');
    const { founderId, spaceId, delegationId } = await seed('cr001-b');

    const init = await initiateReferendum({
      spaceId,
      initiatorMemberId: founderId,
      target: { type: 'delegation', delegationId },
    });
    if (!init.ok) throw new Error('init failed');

    await db
      .update(referenda)
      .set({
        deliberationStartedAt: new Date(Date.now() - 73 * 60 * 60 * 1000),
        votingStartedAt: new Date(),
        status: 'voting',
      })
      .where(eq(referenda.id, init.value.referendumId));

    const vote = await castVote({
      referendumId: init.value.referendumId,
      voterMemberId: founderId,
      choice: 'support',
    });
    expect(vote.ok).toBe(true);
  });
});
