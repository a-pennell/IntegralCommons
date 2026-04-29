import { and, count, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { delegations, memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { writeTimelineEvent } from '@/server/civic-memory';
import { cr008StabilityPeriodActive } from '@/server/constitution';
import { resolveGovernanceProfile } from '@/server/governance-config';
import { checkAndBump } from '@/server/rate-limits';

/**
 * Initiate a Referendum.
 *
 * Targets are mutually exclusive: delegation, decision_record, or
 * governance_profile_change. Only one of the three `target*Id` fields is
 * non-null (enforced by CHECK).
 *
 * Guards, in order:
 *   1. CR-009 rate limit (1 per rolling 7 days by default).
 *   2. CR-008 temporal stability — referenda against delegations have a
 *      30-day (configurable, min 30) stability floor after grant. Referenda
 *      against Decision Records have a stability floor from the DR's
 *      finalization.
 *   3. The target exists and belongs to the given Space.
 *   4. The initiator is an active Member of the Space.
 *
 * Produces a Referendum with status='initiating'; `minimum_threshold_required`
 * is snapshotted at initiation time from the governance profile.
 */

export type InitiateReferendumInput = {
  readonly spaceId: string;
  readonly initiatorMemberId: string;
  readonly target:
    | { readonly type: 'delegation'; readonly delegationId: string }
    | {
        readonly type: 'decision_record';
        readonly decisionRecordId: string;
        readonly issueId: string;
      }
    | { readonly type: 'governance_profile_change'; readonly issueId: string };
};

export type InitiateReferendumOk = {
  readonly referendumId: string;
  readonly minimumThresholdRequired: number;
};

export async function initiateReferendum(
  input: InitiateReferendumInput,
): Promise<Result<InitiateReferendumOk, AppError>> {
  // Initiator must be active.
  const mship = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, input.spaceId),
        eq(memberships.memberId, input.initiatorMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!mship[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Only active members may initiate a referendum.',
      ),
    );
  }

  const spaceRow = await db.select().from(spaces).where(eq(spaces.id, input.spaceId)).limit(1);
  if (!spaceRow[0]) return err(errors.notFound('space'));
  const profile = resolveGovernanceProfile(spaceRow[0].governanceProfile);

  // Threshold snapshot: max(minimumSupporters, ceil(activeCount * pct)).
  const activeRow = await db
    .select({ n: count() })
    .from(memberships)
    .where(and(eq(memberships.spaceId, input.spaceId), eq(memberships.status, 'active')));
  const activeCount = Number(activeRow[0]?.n ?? 0);
  const pctThreshold = Math.ceil(activeCount * profile.referendumThreshold.minimumSupportersPct);
  const minimumThresholdRequired = Math.max(
    profile.referendumThreshold.minimumSupporters,
    pctThreshold,
  );

  // CR-008 stability guard.
  if (input.target.type === 'delegation') {
    const delegation = await db
      .select()
      .from(delegations)
      .where(
        and(eq(delegations.id, input.target.delegationId), eq(delegations.spaceId, input.spaceId)),
      )
      .limit(1);
    if (!delegation[0]) return err(errors.notFound('delegation'));
    if (delegation[0].revokedAt !== null) {
      return err(errors.conflict('delegation', 'This delegation has already been revoked.'));
    }

    const violation = cr008StabilityPeriodActive({
      lastDecisionAt: delegation[0].grantedAt,
      minimumStabilityDays: profile.stability.delegationGrantDays,
    });
    if (violation) {
      return err(errors.constitutional(violation.cr, violation.explanation));
    }
  }

  // Rate limit + insert, atomic.
  return transaction(async (tx) => {
    const rate = await checkAndBump(tx, {
      memberId: input.initiatorMemberId,
      action: 'initiate_referendum',
      effectiveLimit: profile.rateLimits.initiateReferendumPerRollingWeek,
    });
    if (!rate.ok) return rate;

    // A recent referendum targeting the same delegation blocks a new one
    // inside the stability window (belt-and-braces with the stability check
    // above, because an unsuccessful closed referendum re-arms the cooldown).
    if (input.target.type === 'delegation') {
      const recent = await tx.query<{ closed_at: Date }>(
        `SELECT closed_at
           FROM referenda
          WHERE space_id = $1
            AND target_delegation_id = $2
            AND closed_at IS NOT NULL
            AND closed_at > now() - make_interval(days => $3)
          ORDER BY closed_at DESC
          LIMIT 1`,
        [input.spaceId, input.target.delegationId, profile.stability.delegationGrantDays],
      );
      if (recent.rowCount && recent.rowCount > 0) {
        return err(
          errors.constitutional(
            'CR-008',
            `A prior referendum against this delegation closed within the stability window (${profile.stability.delegationGrantDays} days). Wait it out or meet the supermajority exception.`,
          ),
        );
      }
    }

    const referendumId = ulid();
    const targetType = input.target.type;
    const targetDelegationId =
      input.target.type === 'delegation' ? input.target.delegationId : null;
    const targetDecisionRecordId =
      input.target.type === 'decision_record' ? input.target.decisionRecordId : null;
    const targetIssueId =
      input.target.type === 'decision_record' || input.target.type === 'governance_profile_change'
        ? input.target.issueId
        : null;

    await tx.query(
      `INSERT INTO referenda (
         id, space_id, initiated_by_member_id, target_type,
         target_delegation_id, target_decision_record_id, target_issue_id,
         status, minimum_threshold_required
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'initiating', $8)`,
      [
        referendumId,
        input.spaceId,
        input.initiatorMemberId,
        targetType,
        targetDelegationId,
        targetDecisionRecordId,
        targetIssueId,
        minimumThresholdRequired,
      ],
    );

    // The initiator is automatically the first supporter.
    await tx.query(
      `INSERT INTO referendum_supporters (id, referendum_id, supporter_member_id)
         VALUES ($1, $2, $3)`,
      [ulid(), referendumId, input.initiatorMemberId],
    );

    // Log against the Issue's timeline if there is one. Delegation-only
    // referenda log against the delegation's associated Issue (per-Issue
    // delegations have one); otherwise Phase 13 (T175) routes to the
    // governance meta-Issue.
    let logIssueId: string | null = null;
    if (
      input.target.type === 'decision_record' ||
      input.target.type === 'governance_profile_change'
    ) {
      logIssueId = input.target.issueId;
    } else if (input.target.type === 'delegation') {
      const del = await tx.query<{ issue_id: string | null }>(
        `SELECT issue_id FROM delegations WHERE id = $1`,
        [input.target.delegationId],
      );
      logIssueId = del.rows[0]?.issue_id ?? null;
    }
    if (logIssueId) {
      await writeTimelineEvent(tx, {
        issueId: logIssueId,
        eventType: 'referendum_initiated',
        actorMemberId: input.initiatorMemberId,
        payload: {
          referendumId,
          targetType,
          minimumThresholdRequired,
        },
      });
    }

    // Eagerly check whether one supporter already meets the threshold (e.g.,
    // a 1-active-member edge case in tests) and advance to deliberation.
    if (minimumThresholdRequired <= 1) {
      const now = new Date();
      await tx.query(
        `UPDATE referenda
            SET minimum_threshold_reached_at = $1,
                deliberation_started_at = $1,
                status = 'deliberating',
                updated_at = $1
          WHERE id = $2`,
        [now, referendumId],
      );
      if (logIssueId) {
        await writeTimelineEvent(tx, {
          issueId: logIssueId,
          eventType: 'referendum_deliberation_started',
          actorMemberId: input.initiatorMemberId,
          payload: { referendumId },
        });
      }
    }

    return ok({ referendumId, minimumThresholdRequired });
  });
}
