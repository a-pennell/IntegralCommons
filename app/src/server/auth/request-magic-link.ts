import { createHash, randomBytes } from 'node:crypto';
import { and, count, eq, gt } from 'drizzle-orm';
import { db } from '@/db';
import { magicLinkTokens } from '@/db/schema';
import { errors, type AppError } from '@/lib/errors';
import { ulid } from '@/lib/ulid';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { enqueueEmailDispatch, getBossClient } from '@/server/jobs';

/**
 * Issue a magic-link email for NFR-014 authentication.
 *
 * Security:
 *   - Token: 32 random bytes, URL-safe base64. Plaintext only in email body.
 *   - Storage: SHA-256(token) in `magic_link_tokens.token_hash`.
 *   - TTL: 15 minutes.
 *   - Single-use: consumed_at is set on first successful verify.
 *
 * Rate limits (plan §Security & Privacy):
 *   - 5 magic-link requests per email per hour.
 *   - 20 magic-link requests per IP per hour.
 */

const TOKEN_TTL_MS = 15 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL_PER_HOUR = 5;
const MAX_PER_IP_PER_HOUR = 20;

export type RequestMagicLinkInput = {
  readonly email: string;
  readonly ipAddress?: string;
  readonly redirectTo?: string;
  readonly baseUrl: string;
};

export type RequestMagicLinkOk = { readonly sentTo: string; readonly expiresAt: Date };

export async function requestMagicLink(
  input: RequestMagicLinkInput,
): Promise<Result<RequestMagicLinkOk, AppError>> {
  const email = input.email.trim().toLowerCase();
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_WINDOW_MS);

  // Rate limit by email.
  const emailCountRow = await db
    .select({ n: count() })
    .from(magicLinkTokens)
    .where(and(eq(magicLinkTokens.email, email), gt(magicLinkTokens.createdAt, windowStart)));
  if ((emailCountRow[0]?.n ?? 0) >= MAX_PER_EMAIL_PER_HOUR) {
    return err(
      errors.rateLimited(
        'magic_link_request',
        `${MAX_PER_EMAIL_PER_HOUR} magic-link requests per email per hour`,
        new Date(now.getTime() + RATE_WINDOW_MS),
      ),
    );
  }

  // Rate limit by IP (only when supplied — server actions always should).
  if (input.ipAddress) {
    const ipCountRow = await db
      .select({ n: count() })
      .from(magicLinkTokens)
      .where(
        and(
          eq(magicLinkTokens.requestedFromIp, input.ipAddress),
          gt(magicLinkTokens.createdAt, windowStart),
        ),
      );
    if ((ipCountRow[0]?.n ?? 0) >= MAX_PER_IP_PER_HOUR) {
      return err(
        errors.rateLimited(
          'create_issue',
          `${MAX_PER_IP_PER_HOUR} magic-link requests per IP per hour`,
          new Date(now.getTime() + RATE_WINDOW_MS),
        ),
      );
    }
  }

  const plaintext = randomBytes(32).toString('base64url');
  const tokenHash = createHash('sha256').update(plaintext).digest('hex');
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

  await db.insert(magicLinkTokens).values({
    id: ulid(),
    email,
    tokenHash,
    expiresAt,
    ...(input.ipAddress !== undefined && { requestedFromIp: input.ipAddress }),
  });

  const verifyUrl = new URL('/verify', input.baseUrl);
  verifyUrl.searchParams.set('token', plaintext);
  if (input.redirectTo) verifyUrl.searchParams.set('next', input.redirectTo);

  const boss = await getBossClient();
  await enqueueEmailDispatch(boss, {
    to: email,
    subject: 'Sign in to CommonGround',
    bodyText: renderMagicLinkText(verifyUrl.toString()),
    bodyHtml: renderMagicLinkHtml(verifyUrl.toString()),
    messageId: `magic-link:${tokenHash}`,
  });

  return ok({ sentTo: email, expiresAt });
}

function renderMagicLinkText(url: string): string {
  return [
    'Sign in to CommonGround',
    '',
    `Click this link to finish signing in — it expires in 15 minutes and can be used once:`,
    url,
    '',
    'If you did not request this, you can safely ignore the email.',
  ].join('\n');
}

function renderMagicLinkHtml(url: string): string {
  const safeUrl = url.replace(/"/g, '&quot;');
  return [
    '<p>Sign in to CommonGround.</p>',
    `<p><a href="${safeUrl}">Finish signing in</a> — expires in 15 minutes, single-use.</p>`,
    '<p style="color:#6b6b66">If you did not request this, you can safely ignore the email.</p>',
  ].join('');
}
