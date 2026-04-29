import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { issues, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { writeTimelineEvent } from '@/server/civic-memory';
import { memberHoldsCapability } from '@/server/delegations';

/**
 * Draft a Decision Record.
 *
 * The drafter must currently hold the `facilitation` capability on the Issue
 * — either via a per-Issue delegation or a space-wide one. Bootstrap Issues
 * waive that check per CR-004: during bootstrap the founder is implicitly
 * the facilitator of the meta-method's own first Issue.
 *
 * Draft DRs are mutable until finalize (see `finalize.ts`). The draft row
 * is written with `finalized_at = NULL`, and the Issue's
 * `current_decision_record_id` remains unset until finalize.
 */

export type DraftDecisionRecordInput = {
  readonly issueId: string;
  readonly drafterMemberId: string;
  readonly whatText: string;
  readonly howMethod: 'consent';
  readonly rationaleText: string;
  readonly unresolvedObjectionsText: string;
  readonly reviewDate: Date;
  readonly supersedesDecisionRecordId?: string;
};

export type DraftDecisionRecordOk = { readonly decisionRecordId: string };

export async function draftDecisionRecord(
  input: DraftDecisionRecordInput,
): Promise<Result<DraftDecisionRecordOk, AppError>> {
  const row = await db
    .select({ issue: issues, space: spaces })
    .from(issues)
    .innerJoin(spaces, eq(spaces.id, issues.spaceId))
    .where(eq(issues.id, input.issueId))
    .limit(1);
  if (!row[0]) return err(errors.notFound('issue'));
  const { issue, space } = row[0];

  if (issue.status === 'archived') {
    return err(errors.conflict('issue', 'Archived Issues cannot receive new Decision Records.'));
  }
  if (issue.status === 'stalled') {
    return err(
      errors.conflict('issue', 'Stalled Issues must first reach awareness quorum (FR-039).'),
    );
  }

  // Facilitation guard — waived during bootstrap.
  const isBootstrap = issue.isBootstrap && space.bootstrapCompletedAt === null;
  if (!isBootstrap) {
    const holds = await memberHoldsCapability({
      spaceId: issue.spaceId,
      issueId: issue.id,
      memberId: input.drafterMemberId,
      capability: 'facilitation',
    });
    if (!holds) {
      return err(
        errors.notAuthorized(
          'facilitation delegation on this Issue',
          'Only the delegated facilitator may draft a Decision Record.',
        ),
      );
    }
  }

  // Basic field sanity — ConsentMethod.canFinalize re-validates at finalize.
  if (input.whatText.trim().length < 1 || input.whatText.length > 20_000) {
    return err(
      errors.validation([
        { path: 'whatText', message: 'What was decided must be 1–20,000 characters.' },
      ]),
    );
  }
  if (input.rationaleText.trim().length < 1 || input.rationaleText.length > 20_000) {
    return err(
      errors.validation([
        { path: 'rationaleText', message: 'Rationale must be 1–20,000 characters.' },
      ]),
    );
  }
  if (input.unresolvedObjectionsText.length > 20_000) {
    return err(
      errors.validation([
        {
          path: 'unresolvedObjectionsText',
          message: 'Unresolved objections must be ≤ 20,000 characters.',
        },
      ]),
    );
  }
  if (input.reviewDate.getTime() <= Date.now()) {
    return err(
      errors.validation([
        { path: 'reviewDate', message: 'Review date must be in the future (FR-023).' },
      ]),
    );
  }

  return transaction(async (tx) => {
    const drId = ulid();
    await tx.query(
      `INSERT INTO decision_records (
         id, issue_id, drafted_by_member_id, what_text, how_method,
         rationale_text, unresolved_objections_text, review_date,
         supersedes_decision_record_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        drId,
        input.issueId,
        input.drafterMemberId,
        input.whatText,
        input.howMethod,
        input.rationaleText,
        input.unresolvedObjectionsText,
        input.reviewDate.toISOString().slice(0, 10),
        input.supersedesDecisionRecordId ?? null,
      ],
    );

    await writeTimelineEvent(tx, {
      issueId: input.issueId,
      eventType: 'decision_record_drafted',
      actorMemberId: input.drafterMemberId,
      payload: {
        decisionRecordId: drId,
        howMethod: input.howMethod,
        supersedesDecisionRecordId: input.supersedesDecisionRecordId ?? null,
      },
    });

    return ok({ decisionRecordId: drId });
  });
}
