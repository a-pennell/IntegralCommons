import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import {
  decisionRecords,
  issues,
  members,
  memberships,
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

async function seedSpaceWithFacilitator(name: string) {
  const { db } = testDb;
  const { createIssue } = await import('@/server/issues/create');
  const { grantDelegation } = await import('@/server/delegations/grant');

  const founderId = ulid();
  const facilitatorId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: `${name}-f@test.test`, displayName: 'Founder' },
    { id: facilitatorId, email: `${name}-fac@test.test`, displayName: 'Facilitator' },
  ]);
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
  });
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: facilitatorId, status: 'active' },
  ]);

  const issueRes = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `Decide on ${name}`,
    scope: 'Scope',
  });
  if (!issueRes.ok) throw new Error('createIssue failed');

  // Pre-fill the QuorumState so awareness is already satisfied.
  await db
    .update(quorumStates)
    .set({ awarenessCount: 2, awarenessRequired: 1 })
    .where(eq(quorumStates.issueId, issueRes.value.issueId));

  const grantRes = await grantDelegation({
    spaceId,
    issueId: issueRes.value.issueId,
    granteeMemberId: facilitatorId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'bootstrap',
  });
  if (!grantRes.ok) throw new Error('grant failed');

  return { founderId, facilitatorId, spaceId, issueId: issueRes.value.issueId };
}

describe('decisions.draft + finalize (consent method)', () => {
  it('happy path — facilitator drafts and finalizes, Issue transitions to decided', async () => {
    const { db } = testDb;
    const { draftDecisionRecord } = await import('@/server/decisions/draft');
    const { finalizeDecisionRecord } = await import('@/server/decisions/finalize');
    const { facilitatorId, issueId } = await seedSpaceWithFacilitator('dec-a');

    const draft = await draftDecisionRecord({
      issueId,
      drafterMemberId: facilitatorId,
      whatText: 'We will update the membership policy to include quarterly reviews.',
      howMethod: 'consent',
      rationaleText: 'Regular review cadence surfaces drift and prevents stale rules.',
      unresolvedObjectionsText: 'none',
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    expect(draft.ok).toBe(true);
    if (!draft.ok) return;

    const final = await finalizeDecisionRecord({
      decisionRecordId: draft.value.decisionRecordId,
      finalizerMemberId: facilitatorId,
    });
    expect(final.ok).toBe(true);
    if (!final.ok) return;

    const issue = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1);
    expect(issue[0]?.status).toBe('decided');
    expect(issue[0]?.currentDecisionRecordId).toBe(draft.value.decisionRecordId);

    const dr = await db
      .select()
      .from(decisionRecords)
      .where(eq(decisionRecords.id, draft.value.decisionRecordId))
      .limit(1);
    expect(dr[0]?.finalizedAt).not.toBeNull();

    const ev = await db.select().from(timelineEvents).where(eq(timelineEvents.issueId, issueId));
    const kinds = ev.map((e) => e.eventType);
    expect(kinds).toContain('decision_record_drafted');
    expect(kinds).toContain('decision_record_finalized');
    expect(kinds).toContain('issue_status_changed');
  });

  it('refuses draft when drafter lacks facilitation (T122)', async () => {
    const { draftDecisionRecord } = await import('@/server/decisions/draft');
    const { founderId, issueId } = await seedSpaceWithFacilitator('dec-b');

    const draft = await draftDecisionRecord({
      issueId,
      drafterMemberId: founderId,
      whatText: 'A decision',
      howMethod: 'consent',
      rationaleText: 'Because.',
      unresolvedObjectionsText: 'none',
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    expect(draft.ok).toBe(false);
    if (draft.ok) return;
    expect(draft.error.kind).toBe('NotAuthorized');
  });

  it('refuses finalization when marked BLOCKED', async () => {
    const { draftDecisionRecord } = await import('@/server/decisions/draft');
    const { finalizeDecisionRecord } = await import('@/server/decisions/finalize');
    const { facilitatorId, issueId } = await seedSpaceWithFacilitator('dec-c');

    const draft = await draftDecisionRecord({
      issueId,
      drafterMemberId: facilitatorId,
      whatText: 'Tentative decision pending objection resolution.',
      howMethod: 'consent',
      rationaleText: 'We want to record progress but an objection is unresolved.',
      unresolvedObjectionsText: 'BLOCKED',
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    if (!draft.ok) throw new Error('draft failed');

    const final = await finalizeDecisionRecord({
      decisionRecordId: draft.value.decisionRecordId,
      finalizerMemberId: facilitatorId,
    });
    expect(final.ok).toBe(false);
  });

  it('DB trigger blocks setting status=decided without a DR (T123)', async () => {
    const { db } = testDb;
    const { issueId } = await seedSpaceWithFacilitator('dec-d');
    await expect(
      db.execute(
        `UPDATE issues SET status = 'decided' WHERE id = '${issueId}'` as unknown as never,
      ),
    ).rejects.toThrow();
  });
});

describe('issues.reopen', () => {
  it('requires a reopen reason and transitions decided → reopened (T124)', async () => {
    const { db } = testDb;
    const { draftDecisionRecord } = await import('@/server/decisions/draft');
    const { finalizeDecisionRecord } = await import('@/server/decisions/finalize');
    const { reopenIssue } = await import('@/server/issues/reopen');
    const { facilitatorId, issueId } = await seedSpaceWithFacilitator('reopen-a');

    // Drive the Issue to decided.
    const draft = await draftDecisionRecord({
      issueId,
      drafterMemberId: facilitatorId,
      whatText: 'Initial decision recorded for this test.',
      howMethod: 'consent',
      rationaleText: 'Needed for the reopen test chain.',
      unresolvedObjectionsText: 'none',
      reviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    if (!draft.ok) throw new Error('draft failed');
    const final = await finalizeDecisionRecord({
      decisionRecordId: draft.value.decisionRecordId,
      finalizerMemberId: facilitatorId,
    });
    if (!final.ok) throw new Error('finalize failed');

    // Empty reason → ValidationError.
    const bad = await reopenIssue({ issueId, actorMemberId: facilitatorId, reason: '   ' });
    expect(bad.ok).toBe(false);
    if (bad.ok) return;
    expect(bad.error.kind).toBe('ValidationError');

    // Real reason → transitions to reopened.
    const good = await reopenIssue({
      issueId,
      actorMemberId: facilitatorId,
      reason: 'New information surfaced about budget impact.',
    });
    expect(good.ok).toBe(true);

    const issue = await db.select().from(issues).where(eq(issues.id, issueId)).limit(1);
    expect(issue[0]?.status).toBe('reopened');
    expect(issue[0]?.reopenReason?.length).toBeGreaterThan(0);
  });
});
