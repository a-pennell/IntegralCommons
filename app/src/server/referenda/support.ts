import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { memberships, referenda } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Co-sign a Referendum's initiation.
 *
 * Each active Member may support at most once per Referendum (UNIQUE
 * constraint). Supporting does NOT count against the supporter's own
 * `initiate_referendum` rate limit — that is the initiator's cost.
 *
 * When support count reaches `minimum_threshold_required`, the Referendum
 * transitions `initiating → deliberating` and the deliberation clock starts.
 */

export async function supportReferendum(input: {
  readonly referendumId: string;
  readonly supporterMemberId: string;
}): Promise<Result<{ readonly thresholdReached: boolean }, AppError>> {
  const refRow = await db
    .select()
    .from(referenda)
    .where(eq(referenda.id, input.referendumId))
    .limit(1);
  const referendum = refRow[0];
  if (!referendum) return err(errors.notFound('referendum'));

  if (referendum.status !== 'initiating') {
    return err(
      errors.conflict(
        'referendum',
        `Cannot add support: referendum is ${referendum.status}, not initiating.`,
      ),
    );
  }

  const mship = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, referendum.spaceId),
        eq(memberships.memberId, input.supporterMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!mship[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Only active members may support a referendum.',
      ),
    );
  }

  return transaction(async (tx) => {
    // Insert-or-no-op the supporter row.
    await tx.query(
      `INSERT INTO referendum_supporters (id, referendum_id, supporter_member_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (referendum_id, supporter_member_id) DO NOTHING`,
      [ulid(), input.referendumId, input.supporterMemberId],
    );

    // Recount supporters.
    const counted = await tx.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n FROM referendum_supporters WHERE referendum_id = $1`,
      [input.referendumId],
    );
    const current = Number(counted.rows[0]?.n ?? 0);

    if (current >= referendum.minimumThresholdRequired) {
      const now = new Date();
      await tx.query(
        `UPDATE referenda
            SET minimum_threshold_reached_at = COALESCE(minimum_threshold_reached_at, $1),
                deliberation_started_at = COALESCE(deliberation_started_at, $1),
                status = CASE WHEN status = 'initiating' THEN 'deliberating'::referendum_status ELSE status END,
                updated_at = $1
          WHERE id = $2
            AND status = 'initiating'`,
        [now, input.referendumId],
      );

      // Log against the same Issue the referendum was initiated against (if any).
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
          eventType: 'referendum_deliberation_started',
          actorMemberId: input.supporterMemberId,
          payload: { referendumId: input.referendumId, supporterCount: current },
        });
      }
      return ok({ thresholdReached: true });
    }

    return ok({ thresholdReached: false });
  });
}
