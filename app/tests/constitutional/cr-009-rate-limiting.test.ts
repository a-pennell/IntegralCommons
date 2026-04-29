import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-009 — Rate Limiting.
 *
 * Spaces may tighten rate limits, never loosen them below the constitutional
 * floors. Two assertions:
 *
 *   1. `cr009WouldLoosenRateLimits` predicate returns a Violation when a
 *      proposed limit exceeds the floor.
 *   2. `applyGovernanceChangeIfNeeded` rejects a profile that loosens
 *      `createIssuePerDay` or `initiateReferendumPerRollingWeek`.
 *   3. `createIssue` rate-limit bucket blocks the 4th Issue in a day.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

describe('CR-009: predicate blocks loosened rate limits', () => {
  it('cr009WouldLoosenRateLimits returns Violation when proposed > floor', async () => {
    const { cr009WouldLoosenRateLimits } = await import('@/server/constitution/predicates');
    const v = cr009WouldLoosenRateLimits({ proposedLimit: 10, floorLimit: 3 });
    expect(v).not.toBeNull();
    expect(v?.cr).toBe('CR-009');
  });

  it('cr009WouldLoosenRateLimits returns null when proposed <= floor', async () => {
    const { cr009WouldLoosenRateLimits } = await import('@/server/constitution/predicates');
    expect(cr009WouldLoosenRateLimits({ proposedLimit: 3, floorLimit: 3 })).toBeNull();
    expect(cr009WouldLoosenRateLimits({ proposedLimit: 1, floorLimit: 3 })).toBeNull();
  });
});

describe('CR-009: governance profile cannot loosen rate limits', () => {
  it('applyGovernanceChangeIfNeeded rejects profile with createIssuePerDay > floor', async () => {
    const { getPool } = await import('@/db');
    const { applyGovernanceChangeIfNeeded } = await import(
      '@/server/governance-config/apply-change'
    );

    const { db } = testDb;
    const memberId = ulid();
    const spaceId = ulid();
    await db.insert(members).values({ id: memberId, email: `cr009-a@test.test` });
    await db.insert(spaces).values({
      id: spaceId,
      name: 'CR-009 Rate Space',
      slug: `cr009-rate-${memberId.slice(-6)}`,
    });
    await db.insert(memberships).values({ id: ulid(), spaceId, memberId, status: 'active' });

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      const result = await applyGovernanceChangeIfNeeded(client, {
        spaceId,
        issueStructuredSections: {
          changeType: 'governance_profile',
          proposedProfile: {
            version: 1,
            decisionMethodDefault: 'consent',
            rateLimits: {
              createIssuePerDay: 99, // exceeds floor of 3
              initiateReferendumPerRollingWeek: 1,
            },
          },
        },
      });
      await client.query('ROLLBACK');
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.cr).toBe('CR-009');
    } finally {
      client.release();
    }
  });
});

describe('CR-009: createIssue rate bucket', () => {
  it('blocks the 4th Issue in a day', async () => {
    const { db } = testDb;
    const memberId = ulid();
    const spaceId = ulid();

    await db.insert(members).values({ id: memberId, email: `cr009-b@test.test` });
    await db.insert(spaces).values({
      id: spaceId,
      name: 'CR-009 Bucket Space',
      slug: `cr009-bucket-${memberId.slice(-6)}`,
      bootstrapCompletedAt: new Date(),
    });
    await db.insert(memberships).values({ id: ulid(), spaceId, memberId, status: 'active' });

    const { createIssue } = await import('@/server/issues/create');

    const make = (n: number) =>
      createIssue({
        spaceId,
        creatorMemberId: memberId,
        title: `Rate limit issue ${n}`,
        scope: 'testing rate limits',
      });

    expect((await make(1)).ok).toBe(true);
    expect((await make(2)).ok).toBe(true);
    expect((await make(3)).ok).toBe(true);
    const fourth = await make(4);
    expect(fourth.ok).toBe(false);
    if (fourth.ok) return;
    expect(fourth.error.kind).toBe('RateLimited');
  });
});
