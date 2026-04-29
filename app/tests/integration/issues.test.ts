import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { issues, members, memberships, spaces, timelineEvents } from '@/db/schema';
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

async function seedSpaceWithFounder(spaceName: string) {
  const { db } = testDb;
  const founderId = ulid();
  const spaceId = ulid();
  await db.insert(members).values({ id: founderId, email: `${spaceName}@test.test` });
  await db.insert(spaces).values({
    id: spaceId,
    name: spaceName,
    slug: spaceName.toLowerCase().replace(/\s+/g, '-'),
    // Bootstrap completed so CR-004 does not block non-bootstrap issue creation.
    bootstrapCompletedAt: new Date(),
  });
  await db
    .insert(memberships)
    .values({ id: ulid(), spaceId, memberId: founderId, status: 'active' });
  return { founderId, spaceId };
}

describe('issues.create', () => {
  it('writes Issue + QuorumState + issue_created TimelineEvent', async () => {
    const { db } = testDb;
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedSpaceWithFounder('issues-alpha');

    const result = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Where does the budget go?',
      scope: 'Allocate the operating surplus for the next quarter.',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const issueRow = await db
      .select()
      .from(issues)
      .where(eq(issues.id, result.value.issueId))
      .limit(1);
    expect(issueRow[0]?.status).toBe('open');
    expect(issueRow[0]?.slug).toBe('where-does-the-budget-go');

    const timeline = await db
      .select()
      .from(timelineEvents)
      .where(eq(timelineEvents.issueId, result.value.issueId));
    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.eventType).toBe('issue_created');
    expect(timeline[0]?.actorMemberId).toBe(founderId);
  });

  it('rate-limits the 4th Issue creation in the same day', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { founderId, spaceId } = await seedSpaceWithFounder('issues-ratelimit');

    for (let i = 0; i < 3; i++) {
      const r = await createIssue({
        spaceId,
        creatorMemberId: founderId,
        title: `Day-1 Issue ${i}`,
        scope: 'Scope is required.',
      });
      expect(r.ok).toBe(true);
    }

    const fourth = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Day-1 Issue 3 (over limit)',
      scope: 'Scope is required.',
    });
    expect(fourth.ok).toBe(false);
    if (fourth.ok) return;
    expect(fourth.error.kind).toBe('RateLimited');
  });

  it('rejects non-bootstrap Issue creation before bootstrap is complete (CR-004)', async () => {
    const { db } = testDb;
    const { createIssue } = await import('@/server/issues/create');

    const founderId = ulid();
    const spaceId = ulid();
    await db.insert(members).values({ id: founderId, email: 'cr004@test.test' });
    // bootstrap_completed_at remains NULL — the CR-004 gate.
    await db.insert(spaces).values({
      id: spaceId,
      name: 'Pre-Bootstrap Space',
      slug: 'pre-bootstrap-space',
    });
    await db
      .insert(memberships)
      .values({ id: ulid(), spaceId, memberId: founderId, status: 'active' });

    const result = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Premature Issue',
      scope: 'This should fail.',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('ConstitutionalViolation');
    if (result.error.kind !== 'ConstitutionalViolation') return;
    expect(result.error.cr).toBe('CR-004');
  });
});

describe('issues.transition-status', () => {
  it('permits open→exploring and back, writes timeline events', async () => {
    const { db } = testDb;
    const { createIssue } = await import('@/server/issues/create');
    const { transitionIssueStatus } = await import('@/server/issues/transition-status');
    const { founderId, spaceId } = await seedSpaceWithFounder('issues-transit');

    const created = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'Transit',
      scope: 'S',
    });
    if (!created.ok) throw new Error('create failed');

    const toExploring = await transitionIssueStatus({
      issueId: created.value.issueId,
      toStatus: 'exploring',
      actorMemberId: founderId,
    });
    expect(toExploring.ok).toBe(true);

    const backToOpen = await transitionIssueStatus({
      issueId: created.value.issueId,
      toStatus: 'open',
      actorMemberId: founderId,
    });
    expect(backToOpen.ok).toBe(true);

    const issueRow = await db
      .select()
      .from(issues)
      .where(eq(issues.id, created.value.issueId))
      .limit(1);
    expect(issueRow[0]?.status).toBe('open');

    const events = await db
      .select()
      .from(timelineEvents)
      .where(
        and(
          eq(timelineEvents.issueId, created.value.issueId),
          eq(timelineEvents.eventType, 'issue_status_changed'),
        ),
      );
    expect(events).toHaveLength(2);
  });

  it('refuses direct transition to decided without a Decision Record (FR-014)', async () => {
    const { createIssue } = await import('@/server/issues/create');
    const { transitionIssueStatus } = await import('@/server/issues/transition-status');
    const { founderId, spaceId } = await seedSpaceWithFounder('issues-nodecide');

    const created = await createIssue({
      spaceId,
      creatorMemberId: founderId,
      title: 'NoDR',
      scope: 'S',
    });
    if (!created.ok) throw new Error('create failed');

    const bad = await transitionIssueStatus({
      issueId: created.value.issueId,
      toStatus: 'decided',
      actorMemberId: founderId,
    });
    expect(bad.ok).toBe(false);
  });
});
