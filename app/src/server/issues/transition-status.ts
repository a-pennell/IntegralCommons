import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { issues } from '@/db/schema';
import type { Issue } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Issue status state machine.
 *
 *    open ⇄ exploring                  ← editors freely
 *    exploring → decided               ← requires current_decision_record_id (FR-014)
 *                                        enforced at both DB-trigger and service
 *    decided  → reopened               ← requires reopen_reason (FR-015)
 *    reopened → decided                ← with a new (superseding) DR
 *    any      → archived               ← end state
 *    stalled  → anything EXCEPT decided (FR-039)
 *
 * The decided/reopened/archived transitions land fully in M3 (US5 — T112, T113).
 * Phase 5 only implements the open↔exploring path, which is what US3
 * needs. Service-layer guards below reject all other transitions with a
 * clear error; the DB trigger covers decided-specific safety.
 */

type IssueStatus = Issue['status'];

const ALLOWED_PHASE_5: Record<IssueStatus, ReadonlyArray<IssueStatus>> = {
  open: ['exploring'],
  exploring: ['open'],
  decided: [], // US5
  reopened: [], // US5
  archived: [],
  stalled: [], // US11
};

export type TransitionStatusInput = {
  readonly issueId: string;
  readonly toStatus: IssueStatus;
  readonly actorMemberId: string;
};

export async function transitionIssueStatus(
  input: TransitionStatusInput,
): Promise<Result<void, AppError>> {
  const rows = await db.select().from(issues).where(eq(issues.id, input.issueId)).limit(1);
  const issue = rows[0];
  if (!issue) return err(errors.notFound('issue'));

  if (issue.status === input.toStatus) {
    return ok(undefined);
  }

  const allowed = ALLOWED_PHASE_5[issue.status];
  if (!allowed.includes(input.toStatus)) {
    return err(
      errors.conflict(
        'issue',
        `Transition ${issue.status} → ${input.toStatus} is not available. See plan §Issue status state machine.`,
      ),
    );
  }

  return transaction(async (tx) => {
    await tx.query(`UPDATE issues SET status = $1, updated_at = now() WHERE id = $2`, [
      input.toStatus,
      input.issueId,
    ]);

    await writeTimelineEvent(tx, {
      issueId: input.issueId,
      eventType: 'issue_status_changed',
      actorMemberId: input.actorMemberId,
      payload: { from: issue.status, to: input.toStatus },
    });

    return ok(undefined);
  });
}
