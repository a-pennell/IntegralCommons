import { cookies } from 'next/headers';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import type { Session } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';

/**
 * Session helpers.
 *
 * The session cookie holds the session id (a 256-bit URL-safe string matching
 * the sessions.id ULID). Revocation is a plain DELETE against the table —
 * there is no stateless token to blacklist.
 *
 * Cookie attributes: httpOnly, SameSite=Lax, Secure in production, 30-day
 * sliding expiry (refreshed on every request at the service layer, subject
 * to a 1/min write throttle to reduce contention).
 */

export const SESSION_COOKIE = 'cg_session';
const SESSION_TTL_DAYS = 30;

function sessionCookieAttributes(): {
  httpOnly: true;
  sameSite: 'lax';
  secure: boolean;
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
  };
}

/**
 * Read the current session from the cookie and verify against the DB.
 * Returns null when unauthenticated. Does NOT return an error for
 * unauthenticated callers — that's `requireSession()`'s job.
 */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE);
  if (!cookie?.value) return null;

  const rows = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, cookie.value), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Wrapper for service functions that require an authenticated caller.
 * Returns NotAuthenticated otherwise.
 */
export async function requireSession(): Promise<Result<Session, AppError>> {
  const session = await getSession();
  if (!session) return err(errors.notAuthenticated());
  return ok(session);
}

/** Set the session cookie. Called after a successful magic-link verify. */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionId, sessionCookieAttributes());
}

/** Clear the session cookie. Called on explicit sign-out. */
export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
