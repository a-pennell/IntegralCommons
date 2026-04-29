import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { decisionRecords, issues, quorumStates, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';
import { memberHoldsCapability } from '@/server/delegations';
import { ConsentMethod } from './consent-method.ts';
import type { DecisionMethod } from './method.ts';
import { applyGovernanceChangeIfNeeded } from '@/server/governance-config';

/**
 * Finalize a Decision Record. One-way operation — once `finalized_at` is
 * set, the row is immutable (the DB trigger
 * `decision_records_no_mutate_when_finalized_trigger` enforces this at the
 * DB layer). Issue status transitions to 'decided' in the same transaction,
 * and `issues.current_decision_record_id` is wired up. The DB trigger
 * `issue_status_consistency_trigger` blocks status='decided' without a DR.
 */

const METHOD_REGISTRY: Record<string, DecisionMethod> = {
  consent: ConsentMethod,
};

export type FinalizeDecisionRecordInput = {
  readonly decisionRecordId: string;
  readonly finalizerMemberId: string;
};

export type FinalizeDecisionRecordOk = {
  readonly decisionRecordId: string;
  readonly issueId: string;
  readonly issueStatus: 'decided';
};

export async function finalizeDecisionRecord(
  input: FinalizeDecisionRecordInput,
): Promise<Result<FinalizeDecisionRecordOk, AppError>> {
  const row = await db
    .select({
      dr: decisionRecords,
      issue: issues,
      space: spaces,
      quorum: quorumStates,
    })
    .from(decisionRecords)
    .innerJoin(issues, eq(issues.id, decisionRecords.issueId))
    .innerJoin(spaces, eq(spaces.id, issues.spaceId))
    .leftJoin(quorumStates, eq(quorumStates.issueId, issues.id))
    .where(eq(decisionRecords.id, input.decisionRecordId))
    .limit(1);

  const r = row[0];
  if (!r) return err(errors.notFound('decision record'));
  const { dr, issue, space, quorum } = r;

  if (dr.finalizedAt !== null) {
    return err(errors.conflict('decision_record', 'This Decision Record is already finalized.'));
  }

  // Facilitator gate (waived for bootstrap meta-method finalization).
  const isBootstrap = issue.isBootstrap && space.bootstrapCompletedAt === null;
  if (!isBootstrap) {
    const holds = await memberHoldsCapability({
      spaceId: issue.spaceId,
      issueId: issue.id,
      memberId: input.finalizerMemberId,
      capability: 'facilitation',
    });
    if (!holds) {
      return err(
        errors.notAuthorized(
          'facilitation delegation on this Issue',
          'Only the delegated facilitator may finalize a Decision Record.',
        ),
      );
    }
  }

  // Run the decision method's gate.
  const method = METHOD_REGISTRY[dr.howMethod];
  if (!method) {
    return err(
      errors.internal(
        `decision method "${dr.howMethod}" is not registered. Phase 1 supports: ${Object.keys(METHOD_REGISTRY).join(', ')}.`,
      ),
    );
  }

  const gate = await method.canFinalize({
    issueId: issue.id,
    spaceId: issue.spaceId,
    facilitatorMemberId: input.finalizerMemberId,
    decisionRecord: {
      whatText: dr.whatText,
      howMethod: dr.howMethod,
      rationaleText: dr.rationaleText,
      unresolvedObjectionsText: dr.unresolvedObjectionsText,
      reviewDate: new Date(dr.reviewDate),
    },
    quorum: {
      awarenessCount: quorum?.awarenessCount ?? 0,
      awarenessRequired: quorum?.awarenessRequired ?? 1,
      participationCount: quorum?.participationCount ?? 0,
      participationRequired: quorum?.participationRequired ?? 1,
    },
  });
  if (!gate.ok) return gate;

  return transaction(async (tx) => {
    const now = new Date();
    const drSupersedes = dr.supersedesDecisionRecordId;

    await tx.query(
      `UPDATE decision_records
          SET finalized_at = $1, finalized_by_member_id = $2, updated_at = $1
        WHERE id = $3
          AND finalized_at IS NULL`,
      [now, input.finalizerMemberId, input.decisionRecordId],
    );

    // Attach the DR to the Issue + transition status.
    await tx.query(
      `UPDATE issues
          SET current_decision_record_id = $1,
              status = 'decided',
              review_date = (SELECT review_date FROM decision_records WHERE id = $1),
              updated_at = $2
        WHERE id = $3`,
      [input.decisionRecordId, now, issue.id],
    );

    await writeTimelineEvent(tx, {
      issueId: issue.id,
      eventType: 'decision_record_finalized',
      actorMemberId: input.finalizerMemberId,
      payload: {
        decisionRecordId: input.decisionRecordId,
        howMethod: dr.howMethod,
        supersedesDecisionRecordId: drSupersedes,
      },
    });

    if (drSupersedes) {
      await writeTimelineEvent(tx, {
        issueId: issue.id,
        eventType: 'decision_record_superseded',
        actorMemberId: input.finalizerMemberId,
        payload: {
          priorDecisionRecordId: drSupersedes,
          supersededByDecisionRecordId: input.decisionRecordId,
        },
      });
    }

    await writeTimelineEvent(tx, {
      issueId: issue.id,
      eventType: 'issue_status_changed',
      actorMemberId: input.finalizerMemberId,
      payload: { from: issue.status, to: 'decided' },
    });

    // Bootstrap completion: if this DR closes the Bootstrap Issue, stamp
    // `spaces.bootstrap_completed_at`. Inline SQL here to avoid a circular
    // module import (@/server/spaces depends on @/server/issues).
    if (issue.isBootstrap && space.bootstrapCompletedAt === null) {
      await tx.query(
        `UPDATE spaces
            SET bootstrap_completed_at = $1, updated_at = $1
          WHERE id = $2
            AND bootstrap_completed_at IS NULL`,
        [now, issue.spaceId],
      );
    }

    // Governance-profile change: if the Issue is a governance-change Issue,
    // apply the proposed profile atomically within this transaction (US9, T178).
    const govResult = await applyGovernanceChangeIfNeeded(tx, {
      spaceId: issue.spaceId,
      issueStructuredSections: issue.structuredSections,
    });
    if (!govResult.ok) {
      // Roll back the whole finalization — a CR violation blocks the DR.
      throw Object.assign(
        new Error(`Constitutional violation (${govResult.cr ?? 'unknown'}): ${govResult.reason}`),
        { cr: govResult.cr },
      );
    }

    return ok({
      decisionRecordId: input.decisionRecordId,
      issueId: issue.id,
      issueStatus: 'decided' as const,
    });
  });
}
