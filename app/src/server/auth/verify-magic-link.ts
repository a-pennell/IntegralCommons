import { createHash } from 'node:crypto';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { magicLinkTokens, members, sessions } from '@/db/schema';
import { errors, type AppError } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

/**
 * Verify a magic-link token and produce a session.
 *
 * Steps (all inside one transaction):
 *   1. Hash the incoming plaintext token.
 *   2. Atomically claim the token: UPDATE ... RETURNING to race-safely set
 *      `consumed_at`. Reject if zero rows updated.
 *   3. Upsert a Member row by email (first login auto-creates).
 *   4. Create a Session. Return { memberId, sessionId }.
 */

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type VerifyMagicLinkInput = {
  readonly plaintextToken: string;
  readonly userAgent?: string;
  readonly ipAddress?: string;
};

export type VerifyMagicLinkOk = {
  readonly memberId: string;
  readonly sessionId: string;
};

export async function verifyMagicLink(
  input: VerifyMagicLinkInput,
): Promise<Result<VerifyMagicLinkOk, AppError>> {
  const tokenHash = createHash('sha256').update(input.plaintextToken).digest('hex');
  const now = new Date();

  return db.transaction(async (tx) => {
    // Atomically consume the token — a valid token must be present, not
    // expired, and not yet consumed.
    const claimed = await tx
      .update(magicLinkTokens)
      .set({ consumedAt: now })
      .where(
        and(
          eq(magicLinkTokens.tokenHash, tokenHash),
          gt(magicLinkTokens.expiresAt, now),
          isNull(magicLinkTokens.consumedAt),
        ),
      )
      .returning({ id: magicLinkTokens.id, email: magicLinkTokens.email });

    const token = claimed[0];
    if (!token) {
      return err(errors.notAuthenticated());
    }

    const email = token.email;

    // Look up existing Member by email; create one on first login.
    // The partial unique index (members_email_uniq WHERE email IS NOT NULL)
    // enforces one Member per email. Two queries in a transaction is fine
    // here — a concurrent insert will fail the unique and we'll retry naturally.
    const existing = await tx
      .select({ id: members.id })
      .from(members)
      .where(eq(members.email, email))
      .limit(1);

    let resolvedMemberId: string;
    if (existing[0]) {
      resolvedMemberId = existing[0].id;
    } else {
      resolvedMemberId = ulid();
      await tx.insert(members).values({ id: resolvedMemberId, email });
    }

    const sessionId = ulid();
    const sessionExpiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    await tx.insert(sessions).values({
      id: sessionId,
      memberId: resolvedMemberId,
      expiresAt: sessionExpiresAt,
      ...(input.userAgent !== undefined && { userAgent: input.userAgent }),
      ...(input.ipAddress !== undefined && { ipAtLastUse: input.ipAddress }),
    });

    return ok({ memberId: resolvedMemberId, sessionId });
  });
}
