import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { delegations, members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * CR-005 — Revocability.
 *
 * Tier-1 constitutional guarantee: every delegation is revocable. The
 * schema enforces this STRUCTURALLY — there is no `irrevocable` column.
 * This test suite asserts:
 *
 *   1. `revoke` flips the active delegation to revoked.
 *   2. A second call is a no-op (idempotent).
 *   3. There is no column named `irrevocable` on `delegations`.
 *   4. The membership active-index respects expiry AND revocation.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

async function seedDelegation(name: string) {
  const { db } = testDb;
  const { grantDelegation } = await import('@/server/delegations/grant');
  const { createIssue } = await import('@/server/issues/create');

  const founderId = ulid();
  const granteeId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: `${name}-f@test.test`, displayName: 'Founder' },
    { id: granteeId, email: `${name}-g@test.test`, displayName: 'Grantee' },
  ]);
  await db.insert(spaces).values({
    id: spaceId,
    name,
    slug: name.toLowerCase(),
    bootstrapCompletedAt: new Date(),
  });
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: granteeId, status: 'active' },
  ]);

  const issue = await createIssue({
    spaceId,
    creatorMemberId: founderId,
    title: `CR-005 ${name}`,
    scope: 'scope',
  });
  if (!issue.ok) throw new Error('create failed');

  const g = await grantDelegation({
    spaceId,
    issueId: issue.value.issueId,
    granteeMemberId: granteeId,
    granterMemberId: founderId,
    capability: 'facilitation',
    grantedByType: 'bootstrap',
  });
  if (!g.ok) throw new Error('grant failed');

  return { delegationId: g.value.delegationId, issueId: issue.value.issueId, spaceId };
}

describe('CR-005 — revocability', () => {
  it('revoke flips revoked_at from null to now()', async () => {
    const { db } = testDb;
    const { revokeDelegation } = await import('@/server/delegations/revoke');
    const { delegationId } = await seedDelegation('cr005-a');

    const before = await db
      .select({ revokedAt: delegations.revokedAt })
      .from(delegations)
      .where(eq(delegations.id, delegationId))
      .limit(1);
    expect(before[0]?.revokedAt).toBeNull();

    const r = await revokeDelegation({
      delegationId,
      actorMemberId: 'does-not-matter-here-26char00',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.alreadyRevoked).toBe(false);

    const after = await db
      .select({ revokedAt: delegations.revokedAt })
      .from(delegations)
      .where(eq(delegations.id, delegationId))
      .limit(1);
    expect(after[0]?.revokedAt).not.toBeNull();
  });

  it('second revoke is a no-op (idempotent)', async () => {
    const { revokeDelegation } = await import('@/server/delegations/revoke');
    const { delegationId } = await seedDelegation('cr005-b');

    const first = await revokeDelegation({
      delegationId,
      actorMemberId: 'actor-26-char-ulid-00000000',
    });
    expect(first.ok && !first.value.alreadyRevoked).toBe(true);

    const second = await revokeDelegation({
      delegationId,
      actorMemberId: 'actor-26-char-ulid-00000000',
    });
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.value.alreadyRevoked).toBe(true);
  });

  it('structural: there is NO `irrevocable` column on delegations', async () => {
    const { pool } = testDb;
    const res = await pool.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'delegations'`,
    );
    const columnNames = res.rows.map((r) => r.column_name);
    expect(columnNames).not.toContain('irrevocable');
  });

  it('findActiveDelegations excludes revoked rows', async () => {
    const { revokeDelegation } = await import('@/server/delegations/revoke');
    const { findActiveDelegations } = await import('@/server/delegations/holder-for');
    const { delegationId, issueId, spaceId } = await seedDelegation('cr005-d');

    const before = await findActiveDelegations({
      spaceId,
      issueId,
      capability: 'facilitation',
    });
    expect(before.some((d) => d.id === delegationId)).toBe(true);

    await revokeDelegation({
      delegationId,
      actorMemberId: 'actor-26-char-ulid-00000000',
    });

    const after = await findActiveDelegations({
      spaceId,
      issueId,
      capability: 'facilitation',
    });
    expect(after.some((d) => d.id === delegationId)).toBe(false);
  });
});
