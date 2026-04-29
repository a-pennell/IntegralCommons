import { createHash } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { magicLinkTokens } from '@/db/schema';
import { startTestDb, stopTestDb, type TestDatabase } from '../helpers/test-db';

/**
 * Auth integration test.
 *
 * Covers T068: magic-link issue → verify → session cookie → second use rejected.
 *
 * We don't call `requestMagicLink()` directly because it depends on the
 * pg-boss client (which would attach to the real DB). The test instead:
 *   1. Inserts a hashed token directly.
 *   2. Calls `verifyMagicLink()` against the testcontainer DB.
 *   3. Asserts a Member + Session landed, and second call rejects.
 *
 * The full end-to-end path (including email dispatch) is covered by the
 * Playwright E2E in M3.
 */

let testDb: TestDatabase;

beforeAll(async () => {
  testDb = await startTestDb();
  process.env.DATABASE_URL = testDb.container.getConnectionUri();
}, 120_000);

afterAll(async () => {
  await stopTestDb(testDb);
});

describe('magic-link verify', () => {
  it('consumes a valid token, creates Member + Session', async () => {
    const { db } = testDb;
    const { verifyMagicLink } = await import('@/server/auth/verify-magic-link');

    const plaintext = 'test-token-plaintext-value-12345';
    const tokenHash = createHash('sha256').update(plaintext).digest('hex');

    await db.insert(magicLinkTokens).values({
      id: '01HN0TESTTOKEN00000000000A',
      email: 'alice@example.test',
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const result = await verifyMagicLink({ plaintextToken: plaintext });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.memberId).toHaveLength(26);
    expect(result.value.sessionId).toHaveLength(26);

    const tokenRow = await db
      .select()
      .from(magicLinkTokens)
      .where(eq(magicLinkTokens.tokenHash, tokenHash))
      .limit(1);
    expect(tokenRow[0]?.consumedAt).not.toBeNull();
  });

  it('rejects a second use of the same token', async () => {
    const { db } = testDb;
    const { verifyMagicLink } = await import('@/server/auth/verify-magic-link');

    const plaintext = 'second-use-plaintext-token-abcde';
    const tokenHash = createHash('sha256').update(plaintext).digest('hex');

    await db.insert(magicLinkTokens).values({
      id: '01HN0TESTTOKEN00000000000B',
      email: 'bob@example.test',
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const first = await verifyMagicLink({ plaintextToken: plaintext });
    expect(first.ok).toBe(true);

    const second = await verifyMagicLink({ plaintextToken: plaintext });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error.kind).toBe('NotAuthenticated');
  });

  it('rejects an expired token', async () => {
    const { db } = testDb;
    const { verifyMagicLink } = await import('@/server/auth/verify-magic-link');

    const plaintext = 'expired-token-plaintext-value-99';
    const tokenHash = createHash('sha256').update(plaintext).digest('hex');

    await db.insert(magicLinkTokens).values({
      id: '01HN0TESTTOKEN00000000000C',
      email: 'carol@example.test',
      tokenHash,
      expiresAt: new Date(Date.now() - 1000),
    });

    const result = await verifyMagicLink({ plaintextToken: plaintext });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('NotAuthenticated');
  });

  it('rejects an unknown token', async () => {
    const { verifyMagicLink } = await import('@/server/auth/verify-magic-link');

    const result = await verifyMagicLink({ plaintextToken: 'not-a-real-token' });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe('NotAuthenticated');
  });

  it('reuses existing Member on subsequent logins', async () => {
    const { db } = testDb;
    const { verifyMagicLink } = await import('@/server/auth/verify-magic-link');

    const mkToken = async (id: string, plaintext: string, email: string) => {
      await db.insert(magicLinkTokens).values({
        id,
        email,
        tokenHash: createHash('sha256').update(plaintext).digest('hex'),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });
    };

    await mkToken(
      '01HN0TESTTOKEN00000000000D',
      'first-plaintext-12345678901234',
      'repeat@example.test',
    );
    await mkToken(
      '01HN0TESTTOKEN00000000000E',
      'second-plaintext-1234567890123',
      'repeat@example.test',
    );

    const a = await verifyMagicLink({ plaintextToken: 'first-plaintext-12345678901234' });
    const b = await verifyMagicLink({ plaintextToken: 'second-plaintext-1234567890123' });

    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.value.memberId).toBe(b.value.memberId);
    expect(a.value.sessionId).not.toBe(b.value.sessionId);
  });
});
