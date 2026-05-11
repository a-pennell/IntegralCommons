import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { members, memberships, spaces, issues, decisionRecords } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-003 — Forkability.
 *
 * The space-wide export must produce a complete, self-contained dataset that
 * can be imported into a fresh instance to reproduce identical governance
 * state. No lock-in code path may exist.
 *
 * Phase 1 verification: export succeeds and includes all required top-level
 * keys (issues, perspectives, decisionRecords, delegations, referenda,
 * quorumStates, officialSummaries, timelineEvents). A downstream "re-import
 * produces identical state" test belongs in the E2E suite once import is
 * implemented; here we assert the export bundle is structurally complete.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedSpace() {
  const { db } = testDb;

  const founderId = ulid();
  const spaceId = ulid();
  const issueId = ulid();
  const drId = ulid();

  await db.insert(members).values({ id: founderId, email: `cr003-f@test.test` });
  await db.insert(spaces).values({
    id: spaceId,
    name: 'CR-003 Space',
    slug: `cr003-space-${founderId.slice(-6)}`,
    bootstrapCompletedAt: new Date(),
  });
  await db.insert(memberships).values({
    id: ulid(),
    spaceId,
    memberId: founderId,
    status: 'active',
  });
  await db.insert(issues).values({
    id: issueId,
    spaceId,
    createdByMemberId: founderId,
    title: 'Export authorization',
    slug: `export-auth-${issueId.slice(-6)}`,
    scope: 'Authorize a full export of Space data.',
  });
  const reviewDateStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]!;
  await db.insert(decisionRecords).values({
    id: drId,
    issueId,
    draftedByMemberId: founderId,
    finalizedByMemberId: founderId,
    whatText: 'Authorize space-wide export for CR-003 test.',
    howMethod: 'consent',
    rationaleText: 'Validates forkability per CR-003.',
    unresolvedObjectionsText: '',
    reviewDate: reviewDateStr,
    finalizedAt: new Date(),
  });

  return { founderId, spaceId, drId };
}

describe('CR-003: space-wide export bundle is structurally complete', () => {
  it('returns all required top-level keys', async () => {
    const { buildSpaceWideBundle } = await import('@/server/export/space-wide');
    const { founderId, spaceId, drId } = await seedSpace();

    const result = await buildSpaceWideBundle({
      spaceId,
      requestingMemberId: founderId,
      authorizingDecisionRecordId: drId,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const bundle = result.value;
    expect(bundle.spaceId).toBe(spaceId);
    expect(bundle.exportedAt).toBeDefined();

    // All top-level tables must be present (even if empty) for a complete fork.
    const requiredKeys: Array<keyof typeof bundle> = [
      'space',
      'memberships',
      'invitations',
      'issues',
      'perspectives',
      'decisionRecords',
      'delegations',
      'referenda',
      'votes',
      'quorumStates',
      'officialSummaries',
      'timelineEvents',
    ];
    for (const key of requiredKeys) {
      expect(bundle).toHaveProperty(key);
    }

    // The seeded issue and DR must appear.
    expect(bundle.issues.length).toBeGreaterThanOrEqual(1);
    expect(bundle.decisionRecords.length).toBeGreaterThanOrEqual(1);
  });

  it('rejects an unfinalised authorising DR', async () => {
    const { db } = testDb;
    const { buildSpaceWideBundle } = await import('@/server/export/space-wide');

    const memberId = ulid();
    const spaceId = ulid();
    const issueId = ulid();
    const draftDrId = ulid();

    await db.insert(members).values({ id: memberId, email: `cr003-g@test.test` });
    await db.insert(spaces).values({
      id: spaceId,
      name: 'CR-003 Draft Space',
      slug: `cr003-draft-${memberId.slice(-6)}`,
    });
    await db.insert(memberships).values({ id: ulid(), spaceId, memberId, status: 'active' });
    await db.insert(issues).values({
      id: issueId,
      spaceId,
      createdByMemberId: memberId,
      title: 'Draft export DR',
      slug: `draft-export-${issueId.slice(-6)}`,
      scope: 'Test draft DR rejection.',
      status: 'open',
    });
    const draftReviewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]!;
    await db.insert(decisionRecords).values({
      id: draftDrId,
      issueId,
      draftedByMemberId: memberId,
      whatText: 'Authorize export.',
      howMethod: 'consent',
      rationaleText: 'Draft — not finalized.',
      unresolvedObjectionsText: '',
      reviewDate: draftReviewDate,
      // finalizedAt deliberately omitted
    });

    const result = await buildSpaceWideBundle({
      spaceId,
      requestingMemberId: memberId,
      authorizingDecisionRecordId: draftDrId,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('NotAuthorized');
  });
});
