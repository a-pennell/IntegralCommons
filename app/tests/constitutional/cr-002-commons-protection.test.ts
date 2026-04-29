import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-002 — Commons Protection.
 *
 * Group decisions may not privatize shared infrastructure, restrict exit
 * rights, or render governance irrevocable. Three assertions:
 *
 *   1. `buildOwnDataBundle` is always callable (no gating path exists).
 *   2. The `cr002WouldRestrictExit` predicate returns a Violation when a DR
 *      would restrict export or right-to-leave.
 *   3. Own-data export returns the member's data even when the member has no
 *      active delegations.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

describe('CR-002: own-data export is unconditional', () => {
  it('returns data without any delegation or DR gating', async () => {
    const { db } = testDb;
    const { buildOwnDataBundle } = await import('@/server/export/own-data');

    const memberId = ulid();
    const spaceId = ulid();

    await db.insert(members).values({ id: memberId, email: `cr002-a@test.test` });
    await db.insert(spaces).values({
      id: spaceId,
      name: 'CR-002 Space',
      slug: `cr002-space-${memberId.slice(-6)}`,
    });
    await db.insert(memberships).values({
      id: ulid(),
      spaceId,
      memberId,
      status: 'active',
    });

    // No delegation exists, no DR exists — export still works.
    const result = await buildOwnDataBundle({ memberId });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.memberId).toBe(memberId);
    expect(result.value.memberships.length).toBeGreaterThanOrEqual(1);
  });

  it('works for a member with no memberships (edge case)', async () => {
    const { db } = testDb;
    const { buildOwnDataBundle } = await import('@/server/export/own-data');

    const memberId = ulid();
    await db.insert(members).values({ id: memberId, email: `cr002-b@test.test` });

    const result = await buildOwnDataBundle({ memberId });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.memberships).toHaveLength(0);
  });
});

describe('CR-002: constitutional predicate blocks exit-restricting decisions', () => {
  it('cr002WouldRestrictExit returns a Violation when export is restricted', async () => {
    const { cr002WouldRestrictExit } = await import('@/server/constitution/predicates');
    const v = cr002WouldRestrictExit({ decisionRestrictsExport: true });
    expect(v).not.toBeNull();
    expect(v?.cr).toBe('CR-002');
  });

  it('cr002WouldRestrictExit returns a Violation when right-to-leave is restricted', async () => {
    const { cr002WouldRestrictExit } = await import('@/server/constitution/predicates');
    const v = cr002WouldRestrictExit({ decisionRestrictsRightToLeave: true });
    expect(v).not.toBeNull();
    expect(v?.cr).toBe('CR-002');
  });

  it('cr002WouldRestrictExit returns null for normal decisions', async () => {
    const { cr002WouldRestrictExit } = await import('@/server/constitution/predicates');
    const v = cr002WouldRestrictExit({});
    expect(v).toBeNull();
  });
});
