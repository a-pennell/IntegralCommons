import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { referenda, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';
import { cr010VoteBeforeDeliberation } from '@/server/constitution';
import { resolveGovernanceProfile } from '@/server/governance-config';

/**
 * Transition `deliberating → voting` (CR-010).
 *
 * The deliberation floor comes from the Space's governance_profile
 * (default: 72 hours). Any member may call this; the guard is the clock,
 * not a specific role.
 */

export async function startReferendumVoting(input: {
  readonly referendumId: string;
  readonly actorMemberId: string;
}): Promise<Result<void, AppError>> {
  const row = await db
    .select({ ref: referenda, space: spaces })
    .from(referenda)
    .innerJoin(spaces, eq(spaces.id, referenda.spaceId))
    .where(eq(referenda.id, input.referendumId))
    .limit(1);
  if (!row[0]) return err(errors.notFound('referendum'));
  const { ref, space } = row[0];

  if (ref.status !== 'deliberating') {
    return err(
      errors.conflict(
        'referendum',
        `Cannot start voting: referendum is ${ref.status}, not deliberating.`,
      ),
    );
  }

  const profile = resolveGovernanceProfile(space.governanceProfile);
  const minDeliberationMs = profile.deliberation.standardIssueHours * 60 * 60 * 1000;

  const violation = cr010VoteBeforeDeliberation({
    deliberationStartedAt: ref.deliberationStartedAt,
    minimumDeliberationMs: minDeliberationMs,
  });
  if (violation) {
    return err(errors.constitutional(violation.cr, violation.explanation));
  }

  return transaction(async (tx) => {
    const now = new Date();
    await tx.query(
      `UPDATE referenda
          SET voting_started_at = $1,
              status = 'voting',
              updated_at = $1
        WHERE id = $2
          AND status = 'deliberating'`,
      [now, input.referendumId],
    );

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
        eventType: 'referendum_voting_started',
        actorMemberId: input.actorMemberId,
        payload: { referendumId: input.referendumId },
      });
    }

    return ok(undefined);
  });
}
