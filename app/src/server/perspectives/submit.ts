import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { issues, memberships, perspectives, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { writeTimelineEvent } from '@/server/civic-memory';
import { resolveGovernanceProfile } from '@/server/governance-config';
import { recomputeParticipationCount } from '@/server/quorum';

/**
 * Submit a Perspective on an Issue.
 *
 * Enforces:
 *   - FR-017 through FR-022 (first-class object, taxonomy tag, one-level
 *     nesting, direct-experience flag).
 *   - The taxonomy_type must be one of the Space's configured vocabulary
 *     (defaults per FR-019: values/risk/equity/feasibility/relational/temporal).
 *   - One-level-deep response constraint (FR-021): parent perspective must
 *     itself have no parent. DB also enforces this via CHECK; we fail fast
 *     at the service layer.
 *
 * Updates `quorum_states.participation_count` inside the same transaction.
 */

export type SubmitPerspectiveInput = {
  readonly issueId: string;
  readonly authorMemberId: string;
  readonly bodyMarkdown: string;
  readonly taxonomyType: string;
  readonly fromDirectExperience?: boolean;
  readonly parentPerspectiveId?: string;
};

export type SubmitPerspectiveOk = { readonly perspectiveId: string };

export async function submitPerspective(
  input: SubmitPerspectiveInput,
): Promise<Result<SubmitPerspectiveOk, AppError>> {
  const body = input.bodyMarkdown;
  if (body.length < 1 || body.length > 10_000) {
    return err(
      errors.validation([
        { path: 'bodyMarkdown', message: 'Perspective body must be 1–10,000 characters.' },
      ]),
    );
  }

  // Load Issue + Space so we can pull the taxonomy vocabulary + verify
  // membership + reject writes against finalized Issues.
  const row = await db
    .select({ issue: issues, space: spaces })
    .from(issues)
    .innerJoin(spaces, eq(spaces.id, issues.spaceId))
    .where(eq(issues.id, input.issueId))
    .limit(1);
  if (!row[0]) return err(errors.notFound('issue'));
  const { issue, space } = row[0];

  if (issue.status === 'archived' || issue.status === 'decided') {
    return err(
      errors.conflict(
        'issue',
        'Perspectives cannot be added to a decided or archived Issue. Reopen it first to contribute.',
      ),
    );
  }

  // Caller must be an active Member of the Space.
  const member = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, issue.spaceId),
        eq(memberships.memberId, input.authorMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!member[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Only active members may add a Perspective.',
      ),
    );
  }

  // Taxonomy check against the Space's configured vocabulary.
  const profile = resolveGovernanceProfile(space.governanceProfile);
  const taxonomy = input.taxonomyType.trim().toLowerCase();
  if (!profile.taxonomyVocabulary.includes(taxonomy)) {
    return err(
      errors.validation([
        {
          path: 'taxonomyType',
          message: `Unknown taxonomy type "${taxonomy}". Allowed: ${profile.taxonomyVocabulary.join(', ')}.`,
        },
      ]),
    );
  }

  // One-level nesting: parent's parent must be null. The DB CHECK also
  // enforces this, but we fail fast with a clean error.
  if (input.parentPerspectiveId) {
    const parent = await db
      .select({ parentId: perspectives.parentPerspectiveId, issueId: perspectives.issueId })
      .from(perspectives)
      .where(eq(perspectives.id, input.parentPerspectiveId))
      .limit(1);
    if (!parent[0]) return err(errors.notFound('parent perspective'));
    if (parent[0].issueId !== input.issueId) {
      return err(
        errors.conflict('perspective', 'Parent Perspective belongs to a different Issue.'),
      );
    }
    if (parent[0].parentId !== null) {
      return err(
        errors.validation([
          {
            path: 'parentPerspectiveId',
            message:
              'Perspectives only support one level of nesting (FR-021). Reply to the parent, not a reply.',
          },
        ]),
      );
    }
  }

  return transaction(async (tx) => {
    const perspectiveId = ulid();
    await tx.query(
      `INSERT INTO perspectives (
         id, issue_id, author_id, body_markdown, taxonomy_type,
         from_direct_experience, parent_perspective_id
       ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        perspectiveId,
        input.issueId,
        input.authorMemberId,
        body,
        taxonomy,
        input.fromDirectExperience ?? false,
        input.parentPerspectiveId ?? null,
      ],
    );

    await recomputeParticipationCount(tx, input.issueId);

    await writeTimelineEvent(tx, {
      issueId: input.issueId,
      eventType: 'perspective_added',
      actorMemberId: input.authorMemberId,
      payload: {
        perspectiveId,
        taxonomyType: taxonomy,
        fromDirectExperience: input.fromDirectExperience ?? false,
        isReply: Boolean(input.parentPerspectiveId),
      },
    });

    return ok({ perspectiveId });
  });
}
