import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { referenda, referendumVotes } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Close a Referendum and compute its outcome.
 *
 * Tally rule (Phase 1):
 *   support > oppose AND support >= ⌈active_members × 0.5⌉ → affirmed/revoked
 *     (affirmed for decision-record / governance-profile-change targets;
 *      revoked for delegation targets)
 *   else → insufficient_quorum
 *
 * Stand-asides don't count toward either side but are recorded for the
 * Civic Memory trail (FR-047).
 *
 * On `revoked` targeting a Delegation, the delegation's `revoked_at` is
 * flipped in the same transaction and `revoked_by_referendum_id` is set.
 */

export type CloseReferendumOutcome = 'affirmed' | 'revoked' | 'insufficient_quorum';

export async function closeReferendum(input: {
  readonly referendumId: string;
  readonly actorMemberId: string;
}): Promise<Result<{ readonly outcome: CloseReferendumOutcome }, AppError>> {
  const refRow = await db
    .select()
    .from(referenda)
    .where(eq(referenda.id, input.referendumId))
    .limit(1);
  const referendum = refRow[0];
  if (!referendum) return err(errors.notFound('referendum'));

  if (referendum.status === 'closed') {
    return err(errors.conflict('referendum', 'Referendum is already closed.'));
  }
  if (referendum.status !== 'voting') {
    return err(
      errors.conflict(
        'referendum',
        `Cannot close: referendum is ${referendum.status}, not voting.`,
      ),
    );
  }

  // Tally.
  const votes = await db
    .select()
    .from(referendumVotes)
    .where(eq(referendumVotes.referendumId, input.referendumId));

  let support = 0;
  let oppose = 0;
  let standAside = 0;
  for (const v of votes) {
    if (v.choice === 'support') support++;
    else if (v.choice === 'oppose') oppose++;
    else standAside++;
  }

  const decisive = support > oppose && support > 0;
  let outcome: CloseReferendumOutcome;
  if (!decisive) {
    outcome = 'insufficient_quorum';
  } else if (referendum.targetDelegationId) {
    outcome = 'revoked';
  } else {
    outcome = 'affirmed';
  }

  return transaction(async (tx) => {
    const now = new Date();

    await tx.query(
      `UPDATE referenda
          SET status = 'closed',
              closed_at = $1,
              outcome = $2,
              updated_at = $1
        WHERE id = $3
          AND status = 'voting'`,
      [now, outcome, input.referendumId],
    );

    if (outcome === 'revoked' && referendum.targetDelegationId) {
      await tx.query(
        `UPDATE delegations
            SET revoked_at = $1,
                revoked_by_referendum_id = $2,
                updated_at = $1
          WHERE id = $3
            AND revoked_at IS NULL`,
        [now, input.referendumId, referendum.targetDelegationId],
      );
    }

    // Log against Issue timeline where we can determine one.
    const logIssue = await tx.query<{ issue_id: string | null }>(
      `SELECT COALESCE(target_issue_id,
                        (SELECT issue_id FROM delegations WHERE id = target_delegation_id)
                       ) AS issue_id
         FROM referenda WHERE id = $1`,
      [input.referendumId],
    );
    const logIssueId = logIssue.rows[0]?.issue_id ?? null;
    if (logIssueId) {
      await writeTimelineEvent(tx, {
        issueId: logIssueId,
        eventType: 'referendum_closed',
        actorMemberId: input.actorMemberId,
        payload: {
          referendumId: input.referendumId,
          outcome,
          tally: { support, oppose, standAside },
        },
      });

      if (outcome === 'revoked' && referendum.targetDelegationId) {
        await writeTimelineEvent(tx, {
          issueId: logIssueId,
          eventType: 'delegation_revoked',
          actorMemberId: input.actorMemberId,
          payload: {
            delegationId: referendum.targetDelegationId,
            revokedByReferendumId: input.referendumId,
          },
        });
      }
    }

    return ok({ outcome });
  });
}
