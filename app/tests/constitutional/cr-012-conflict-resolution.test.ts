import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-012 — Conflict Resolution.
 *
 * When two deliberable constitutional principles collide, the system opens a
 * meta-Issue so the group deliberates the conflict explicitly rather than
 * having the system silently pick a winner.
 *
 * Phase 1 verification: `openMetaIssue` creates an Issue with the conflict
 * context embedded in `structured_sections.changeType === 'meta_conflict'`.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

describe('CR-012: openMetaIssue creates a blocking meta-Issue', () => {
  it('creates an Issue with meta_conflict sections', async () => {
    const { db } = testDb;
    const { openMetaIssue } = await import('@/server/constitution/meta-issue');
    const { getIssueByIdForMember } = await import('@/server/issues/get');

    const memberId = ulid();
    const spaceId = ulid();
    await db.insert(members).values({ id: memberId, email: `cr012-a@test.test` });
    await db.insert(spaces).values({
      id: spaceId,
      name: 'CR-012 Space',
      slug: `cr012-space-${memberId.slice(-6)}`,
      bootstrapCompletedAt: new Date(),
    });
    await db.insert(memberships).values({ id: ulid(), spaceId, memberId, status: 'active' });

    const result = await openMetaIssue({
      spaceId,
      initiatorMemberId: memberId,
      conflictingPrinciples: ['CR-010 (deliberation-first)', 'CR-011 (participation-integrity)'],
      context:
        'Referendum initiated before awareness quorum reached — deliberation-first demands we wait, but quorum rules say we proceed.',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.issueId).toHaveLength(26);

    const issue = await getIssueByIdForMember({
      issueId: result.issueId,
      viewerMemberId: memberId,
    });
    expect(issue).not.toBeNull();
    if (!issue) return;

    // The meta-Issue title references the conflicting principles.
    expect(issue.title).toContain('CR-010');
    expect(issue.title).toContain('CR-011');

    // Structured sections must mark this as a meta_conflict.
    const sections = issue.structuredSections as Record<string, unknown>;
    expect(sections.changeType).toBe('meta_conflict');
    expect(Array.isArray(sections.conflictingPrinciples)).toBe(true);
  });
});
