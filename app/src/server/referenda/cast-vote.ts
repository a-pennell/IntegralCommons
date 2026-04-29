import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { delegations, memberships, referenda } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { cr001SubjectMemberVotingOnOwnRemoval } from '@/server/constitution';

/**
 * Cast a vote on a Referendum in the voting phase.
 *
 * Guards:
 *   - Referendum must be in `voting` status.
 *   - Voter must be an active Member of the Space.
 *   - Voter may not cast a vote on a removal referendum that targets them
 *     (CR-001). They may submit Perspectives but not vote on their own
 *     removal.
 *   - One vote per Member per Referendum (UNIQUE constraint).
 */

export type VoteChoice = 'support' | 'oppose' | 'stand_aside';

export async function castVote(input: {
  readonly referendumId: string;
  readonly voterMemberId: string;
  readonly choice: VoteChoice;
}): Promise<Result<{ readonly voteId: string }, AppError>> {
  const refRow = await db
    .select()
    .from(referenda)
    .where(eq(referenda.id, input.referendumId))
    .limit(1);
  const referendum = refRow[0];
  if (!referendum) return err(errors.notFound('referendum'));

  if (referendum.status !== 'voting') {
    return err(
      errors.conflict(
        'referendum',
        `Votes can only be cast while the referendum is in voting; current status: ${referendum.status}.`,
      ),
    );
  }

  const mship = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, referendum.spaceId),
        eq(memberships.memberId, input.voterMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!mship[0]) {
    return err(
      errors.notAuthorized('an active Membership in this Space', 'Only active members may vote.'),
    );
  }

  // CR-001 subject-member-cannot-vote guard.
  // Heuristic: for referenda targeting a delegation held by memberX, memberX
  // is the subject. For removal Issues encoded through a governance-profile
  // change, a future version will wire an explicit subject_member_id; Phase
  // 1 covers delegation targets only.
  let subjectMemberId: string | null = null;
  if (referendum.targetDelegationId) {
    const del = await db
      .select({ granteeMemberId: delegations.granteeMemberId })
      .from(delegations)
      .where(eq(delegations.id, referendum.targetDelegationId))
      .limit(1);
    subjectMemberId = del[0]?.granteeMemberId ?? null;
  }

  const cr001 = cr001SubjectMemberVotingOnOwnRemoval({
    voterMemberId: input.voterMemberId,
    subjectMemberId,
  });
  if (cr001) {
    return err(errors.constitutional(cr001.cr, cr001.explanation));
  }

  return transaction(async (tx) => {
    const voteId = ulid();
    try {
      await tx.query(
        `INSERT INTO referendum_votes (id, referendum_id, voter_member_id, choice)
           VALUES ($1, $2, $3, $4)`,
        [voteId, input.referendumId, input.voterMemberId, input.choice],
      );
    } catch (e) {
      // UNIQUE violation = already voted.
      const pgErr = e as { code?: string };
      if (pgErr.code === '23505') {
        return err(
          errors.conflict('referendum_vote', 'You have already cast a vote on this referendum.'),
        );
      }
      throw e;
    }
    return ok({ voteId });
  });
}
