import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { members, sessions } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';

/**
 * Right-to-be-Forgotten (RTBF) account deletion.
 *
 * Implements the data retention policy:
 *   - Zeros out email and display_name on the members row.
 *   - Sets deleted_at so the row is flagged as deleted.
 *   - Deletes all active sessions (forces sign-out everywhere).
 *   - Leaves neighborhood memberships and governance participation intact —
 *     Civic Memory is append-only and must not be corrupted. Deleted-member
 *     rows will display as "[removed member]" in the UI.
 *
 * The members.rtbf_consistent DB check enforces that deleted_at non-null
 * implies email IS NULL AND display_name IS NULL.
 */
export async function deleteAccount(memberId: string): Promise<Result<void, AppError>> {
  const existing = await db
    .select({ id: members.id, deletedAt: members.deletedAt })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  if (!existing[0]) return err(errors.notFound('member'));
  if (existing[0].deletedAt) return err(errors.conflict('member', 'Account already deleted.'));

  // Zero out PII and mark deleted. The DB check constraint enforces this is consistent.
  await db
    .update(members)
    .set({ email: null, displayName: null, deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(members.id, memberId));

  // Revoke all sessions — signs the member out everywhere.
  await db.delete(sessions).where(eq(sessions.memberId, memberId));

  return ok(undefined);
}
