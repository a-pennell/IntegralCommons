import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { issues, memberships } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Reopen a decided Issue.
 *
 * FR-015 requires `reopen_reason` — the service layer enforces a non-empty
 * value. The transition goes from 'decided' → 'reopened'; a new DR must be
 * drafted and finalized (possibly with `supersedesDecisionRecordId`) to
 * close it again.
 *
 * `issues.current_decision_record_id` is left in place so the prior DR
 * remains linked until a superseding one is finalized.
 */

export type ReopenIssueInput = {
  readonly issueId: string;
  readonly actorMemberId: string;
  readonly reason: string;
};

export async function reopenIssue(input: ReopenIssueInput): Promise<Result<void, AppError>> {
  const reason = input.reason.trim();
  if (reason.length < 1 || reason.length > 2_000) {
    return err(
      errors.validation([
        { path: 'reason', message: 'Reopen reason must be 1–2,000 characters (FR-015).' },
      ]),
    );
  }

  const rows = await db.select().from(issues).where(eq(issues.id, input.issueId)).limit(1);
  const issue = rows[0];
  if (!issue) return err(errors.notFound('issue'));
  if (issue.status !== 'decided') {
    return err(
      errors.conflict(
        'issue',
        `Only decided Issues can be reopened. Current status: ${issue.status}.`,
      ),
    );
  }

  // Caller must be an active Member of the Space.
  const mship = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(eq(memberships.spaceId, issue.spaceId))
    .limit(1);
  if (!mship[0]) {
    return err(errors.notFound('membership'));
  }

  return transaction(async (tx) => {
    await tx.query(
      `UPDATE issues
          SET status = 'reopened',
              reopen_reason = $1,
              updated_at = now()
        WHERE id = $2`,
      [reason, input.issueId],
    );

    await writeTimelineEvent(tx, {
      issueId: input.issueId,
      eventType: 'issue_status_changed',
      actorMemberId: input.actorMemberId,
      payload: { from: 'decided', to: 'reopened', reason },
    });

    return ok(undefined);
  });
}
