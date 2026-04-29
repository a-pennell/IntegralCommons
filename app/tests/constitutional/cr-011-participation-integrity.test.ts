import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { issues, members, memberships, quorumStates, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-011 — Participation integrity.
 *
 * An Issue cannot be decided while awareness quorum is unmet. The consent
 * method refuses finalize when awareness_count < awareness_required. The
 * stall transition drops such Issues to status='stalled' after the
 * deliberation + extension windows elapse (FR-039).
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedAwarenessShort(name: string) {
  const { db: seedDb } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const { grantDelegation } = await import('@/server/delegations/grant');

  const founderId = ulid();
  const facilitatorId = ulid();
  const spaceId = ulid();

  await seedDb.insert(members).values([
    { id: founderId, email: `${name}-f@test.test` },
    { id: facilitatorId, email: `${name}-fac@test.test` },
  ]);
  await seedDb.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
  });
  await seedDb.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: facilitatorId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `CR-011 ${name}`,
    scope: 'scope',
  });
  if (!issue.ok) throw new Error('create failed');

  // Force awareness_required high and count low.
  await seedDb
    .update(quorumStates)
    .set({ awarenessCount: 0, awarenessRequired: 5 })
    .where(eq(quorumStates.issueId, issue.value.issueId));

  const grant = await grantDelegation({
    spaceId,
    issueId: issue.value.issueId,
    granteeMemberId: facilitatorId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'bootstrap',
  });
  if (!grant.ok) throw new Error('grant failed');

  return { spaceId, founderId, facilitatorId, issueId: issue.value.issueId };
}

describe('CR-011 — participation integrity', () => {
  it('refuses finalize when awareness quorum is unmet', async () => {
    const { draftDecisionRecord } = await import('@/server/decisions/draft');
    const { finalizeDecisionRecord } = await import('@/server/decisions/finalize');
    const { facilitatorId, issueId } = await seedAwarenessShort('cr011-a');

    const draft = await draftDecisionRecord({
      issueId,
      drafterMemberId: facilitatorId,
      whatText: 'We will update membership criteria to add quarterly reviews.',
      howMethod: 'consent',
      rationaleText: 'Regular review prevents rule drift in the group.',
      unresolvedObjectionsText: 'none',
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    if (!draft.ok) throw new Error('draft failed');

    const final = await finalizeDecisionRecord({
      decisionRecordId: draft.value.decisionRecordId,
      finalizerMemberId: facilitatorId,
    });
    expect(final.ok).toBe(false);
    if (final.ok) return;
    expect(final.error.kind).toBe('ConstitutionalViolation');
    if (final.error.kind !== 'ConstitutionalViolation') return;
    expect(final.error.cr).toBe('CR-011');
  });

  it('stall transition flips status to stalled after deliberation + extension elapse', async () => {
    const { applyStallTransitionIfNeeded } = await import('@/server/quorum/recompute');
    const { issueId } = await seedAwarenessShort('cr011-b');

    // Simulate elapsed deliberation + extension.
    const past = new Date(Date.now() - 120 * 60 * 60 * 1000);
    await db
      .update(quorumStates)
      .set({
        deliberationPeriodEndsAt: past,
        extensionPeriodEndsAt: past,
      })
      .where(eq(quorumStates.issueId, issueId));

    // Run transition inside a pool client.
    const { transaction } = await import('@/db');
    await transaction(async (tx) => {
      const out = await applyStallTransitionIfNeeded(tx, issueId);
      expect(out.transition).toBe('stalled');
    });

    const issue = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1);
    expect(issue[0]?.status).toBe('stalled');
  });
});
