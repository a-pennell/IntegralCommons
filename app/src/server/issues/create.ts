import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { writeTimelineEvent } from '@/server/civic-memory';
import { resolveGovernanceProfile, resolveScopeTags } from '@/server/governance-config';
import { snapshotQuorumThresholds } from '@/server/quorum';
import { checkAndBump } from '@/server/rate-limits';
import { cr004NonBootstrapIssueBeforeCompletion } from '@/server/constitution';
import { disambiguate, slugify } from '../spaces/slug.ts';

/**
 * Create a new Issue.
 *
 * Orchestrates, in one transaction:
 *   1. Rate-limit check-and-bump (CR-009).
 *   2. CR-004 guard — non-bootstrap Issues blocked until bootstrap completes.
 *   3. Scope-tag vocabulary validation (CR-007).
 *   4. Slug derivation (disambiguated).
 *   5. Issue row insert + QuorumState snapshot.
 *   6. `issue_created` timeline event via civic_memory_role.
 */

export type CreateIssueInput = {
  readonly spaceId: string;
  readonly creatorMemberId: string;
  readonly title: string;
  readonly scope: string;
  readonly scopeTags?: ReadonlyArray<string>;
  readonly structuredSections?: Record<string, unknown>;
  readonly isBootstrap?: boolean;
  readonly hasEcologicalScope?: boolean;
};

export type CreateIssueOk = {
  readonly issueId: string;
  readonly slug: string;
};

export async function createIssue(
  input: CreateIssueInput,
): Promise<Result<CreateIssueOk, AppError>> {
  const trimmedTitle = input.title.trim();
  const trimmedScope = input.scope.trim();

  if (trimmedTitle.length < 1 || trimmedTitle.length > 200) {
    return err(errors.validation([{ path: 'title', message: 'Title must be 1–200 characters.' }]));
  }
  if (trimmedScope.length < 1 || trimmedScope.length > 500) {
    return err(errors.validation([{ path: 'scope', message: 'Scope must be 1–500 characters.' }]));
  }

  // Pre-load Space + active membership outside the tx (cheap reads).
  const spaceRow = await db.select().from(spaces).where(eq(spaces.id, input.spaceId)).limit(1);
  const space = spaceRow[0];
  if (!space) return err(errors.notFound('space'));

  const membership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, input.spaceId),
        eq(memberships.memberId, input.creatorMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!membership[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Issues can only be created by active members.',
      ),
    );
  }

  // CR-004: non-bootstrap Issues blocked until bootstrap completes.
  const cr004 = cr004NonBootstrapIssueBeforeCompletion({
    bootstrapCompletedAt: space.bootstrapCompletedAt,
    isBootstrap: input.isBootstrap ?? false,
  });
  if (cr004) {
    return err(errors.constitutional(cr004.cr, cr004.explanation));
  }

  const profile = resolveGovernanceProfile(space.governanceProfile);

  // CR-007: validate scope tags against vocabulary.
  const scopeTagsResult = resolveScopeTags({
    supplied: input.scopeTags ?? [],
    profile,
  });
  if (!scopeTagsResult.ok) return scopeTagsResult;

  return transaction(async (tx) => {
    // CR-009 rate limit — atomic with the Issue write.
    const rate = await checkAndBump(tx, {
      memberId: input.creatorMemberId,
      action: 'create_issue',
      effectiveLimit: profile.rateLimits.createIssuePerDay,
    });
    if (!rate.ok) return rate;

    // Slug derivation with per-Space uniqueness.
    const base = slugify(trimmedTitle);
    let slug = base;
    for (let attempt = 1; attempt <= 10; attempt++) {
      slug = disambiguate(base, attempt);
      const existing = await tx.query<{ id: string }>(
        `SELECT id FROM issues WHERE space_id = $1 AND slug = $2 LIMIT 1`,
        [input.spaceId, slug],
      );
      if (existing.rowCount === 0) break;
      if (attempt === 10) {
        return err(errors.conflict('issue', `Unable to allocate a unique slug from "${base}".`));
      }
    }

    const issueId = ulid();
    try {
      await tx.query(
        `INSERT INTO issues (
           id, space_id, title, slug, scope, status, scope_tags, structured_sections,
           is_bootstrap, has_ecological_scope, created_by_member_id
         )
         VALUES ($1, $2, $3, $4, $5, 'open', $6, $7, $8, $9, $10)`,
        [
          issueId,
          input.spaceId,
          trimmedTitle,
          slug,
          trimmedScope,
          scopeTagsResult.value,
          input.structuredSections ?? {},
          input.isBootstrap ?? false,
          input.hasEcologicalScope ?? false,
          input.creatorMemberId,
        ],
      );
    } catch (e) {
      // The partial unique index allows exactly one bootstrap Issue per Space (CR-004).
      if (
        typeof e === 'object' &&
        e !== null &&
        'code' in e &&
        (e as { code: string }).code === '23505' &&
        'constraint' in e &&
        (e as { constraint: string }).constraint === 'issues_space_bootstrap_uniq'
      ) {
        return err(
          errors.constitutional('CR-004', 'A bootstrap Issue already exists for this Space.'),
        );
      }
      throw e;
    }

    // Quorum snapshot.
    const snap = await snapshotQuorumThresholds(tx, {
      spaceId: input.spaceId,
      profile,
    });
    await tx.query(
      `INSERT INTO quorum_states (
         issue_id, awareness_required, participation_required, deliberation_period_ends_at
       ) VALUES ($1, $2, $3, $4)`,
      [issueId, snap.awarenessRequired, snap.participationRequired, snap.deliberationPeriodEndsAt],
    );

    // Append-only Civic Memory event.
    await writeTimelineEvent(tx, {
      issueId,
      eventType: 'issue_created',
      actorMemberId: input.creatorMemberId,
      payload: {
        title: trimmedTitle,
        slug,
        scopeTags: scopeTagsResult.value,
        isBootstrap: input.isBootstrap ?? false,
        hasEcologicalScope: input.hasEcologicalScope ?? false,
      },
    });

    return ok({ issueId, slug });
  });
}
