import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { delegations } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Revoke a Delegation. Idempotent — calling revoke on an already-revoked
 * delegation returns `ok` without mutating or writing a second event.
 *
 * CR-005: every delegation is revocable. There is no `irrevocable` column
 * to bypass; this function is the sole revocation path.
 */

export type RevokeDelegationInput = {
  readonly delegationId: string;
  readonly actorMemberId: string;
  readonly revokedByReferendumId?: string;
};

export async function revokeDelegation(
  input: RevokeDelegationInput,
): Promise<Result<{ readonly alreadyRevoked: boolean }, AppError>> {
  const rows = await db
    .select()
    .from(delegations)
    .where(eq(delegations.id, input.delegationId))
    .limit(1);
  const existing = rows[0];
  if (!existing) return err(errors.notFound('delegation'));

  if (existing.revokedAt !== null) {
    return ok({ alreadyRevoked: true });
  }

  return transaction(async (tx) => {
    await tx.query(
      `UPDATE delegations
          SET revoked_at = now(),
              revoked_by_referendum_id = $1,
              updated_at = now()
        WHERE id = $2
          AND revoked_at IS NULL`,
      [input.revokedByReferendumId ?? null, input.delegationId],
    );

    if (existing.issueId) {
      await writeTimelineEvent(tx, {
        issueId: existing.issueId,
        eventType: 'delegation_revoked',
        actorMemberId: input.actorMemberId,
        payload: {
          delegationId: input.delegationId,
          granteeMemberId: existing.granteeMemberId,
          capability: existing.capability,
          ...(input.revokedByReferendumId !== undefined && {
            revokedByReferendumId: input.revokedByReferendumId,
          }),
        },
      });
    }

    return ok({ alreadyRevoked: false });
  });
}
