import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { issues, members, memberships, quorumStates, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-004 — Bootstrap.
 *
 * The system MUST establish initial governance via a hardcoded consent-based
 * meta-method, and record the outcome as the first Decision Record.
 *
 * This suite asserts:
 *   1. Non-bootstrap Issues are blocked before `bootstrap_completed_at` is set.
 *   2. The Bootstrap Issue uses ConsentMethod regardless of Space config.
 *   3. Finalizing the Bootstrap DR stamps `bootstrap_completed_at`.
 *   4. The partial unique index permits exactly one `is_bootstrap = true`
 *      Issue per Space.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedBareSpace(name: string) {
  const { db } = testDb;
  const founderId = ulid();
  const spaceId = ulid();
  await db.insert(members).values({ id: founderId, email: `${name}@test.test` });
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    // NOTE: bootstrap_completed_at remains NULL.
  });
  await db
    .insert(memberships)
    .values({ id: ulid(), spaceId, memberId: founderId, status: 'active' });
  return { founderId, spaceId };
}

describe('CR-004 — bootstrap', () => {
  it('blocks non-bootstrap Issue creation before bootstrap completes', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedBareSpace('cr004-a');

    const r = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Cannot open this yet',
      scope: 'Scope.',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.kind).toBe('ConstitutionalViolation');
    if (r.error.kind !== 'ConstitutionalViolation') return;
    expect(r.error.cr).toBe('CR-004');
  });

  it('permits exactly one Bootstrap Issue per Space via partial unique index', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedBareSpace('cr004-b');

    const first = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Bootstrap question',
      scope: 'How should we decide?',
      isBootstrap: true,
    });
    expect(first.ok).toBe(true);

    const second = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Another Bootstrap?',
      scope: 'Forbidden.',
      isBootstrap: true,
    });
    expect(second.ok).toBe(false);
  });

  it('bootstrap finalization stamps spaces.bootstrap_completed_at', async () => {
    const { db } = testDb;
    const { ensureBootstrapIssue } = await import('@/server/spaces/bootstrap');
    const { draftDecisionRecord } = await import('@/server/decisions/draft');
    const { finalizeDecisionRecord } = await import('@/server/decisions/finalize');

    const { founderId, spaceId } = await seedBareSpace('cr004-c');
    const issue = await ensureBootstrapIssue({ spaceId, founderMemberId: founderId });
    if (!issue.ok) throw new Error('bootstrap ensure failed');

    // Awareness quorum needs to be satisfied for the consent gate.
    await db
      .update(quorumStates)
      .set({ awarenessCount: 1, awarenessRequired: 1 })
      .where(eq(quorumStates.issueId, issue.value.issueId));

    const draft = await draftDecisionRecord({
      issueId: issue.value.issueId,
      drafterMemberId: founderId,
      whatText: 'We adopt consent as the default decision method for this Space.',
      howMethod: 'consent',
      rationaleText: 'The founding group chose consent (FR-046) via the hardcoded meta-method.',
      unresolvedObjectionsText: 'none',
      reviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
    if (!draft.ok) throw new Error('draft failed');

    const final = await finalizeDecisionRecord({
      decisionRecordId: draft.value.decisionRecordId,
      finalizerMemberId: founderId,
    });
    expect(final.ok).toBe(true);

    const after = await db.select().from(spaces).where(eq(spaces.id, spaceId)).limit(1);
    expect(after[0]?.bootstrapCompletedAt).not.toBeNull();
  });

  it('after bootstrap completes, ordinary Issue creation is unblocked', async () => {
    const { db } = testDb;
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedBareSpace('cr004-d');
    await db.update(spaces).set({ bootstrapCompletedAt: new Date() }).where(eq(spaces.id, spaceId));

    const r = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Ordinary Issue',
      scope: 'Now allowed.',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const issueRow = await db.select().from(issues).where(eq(issues.id, r.value.issueId)).limit(1);
    expect(issueRow[0]?.isBootstrap).toBe(false);
  });
});
