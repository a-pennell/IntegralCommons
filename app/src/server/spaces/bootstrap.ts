import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { issues, memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { createIssue } from '@/server/issues';
import { grantDelegation } from '@/server/delegations';

/**
 * Ensure a Space has its Bootstrap Issue.
 *
 * CR-004 requires the first governance act to be answering "how should we
 * make decisions?" — that is itself an Issue, and it must be closed via the
 * hardcoded consent meta-method regardless of what Space config says.
 *
 * `ensureBootstrapIssue` is idempotent: if the Space already has a
 * Bootstrap Issue, it returns the existing one. If not, it creates one with
 * `is_bootstrap = true` (the partial unique index enforces at most one per
 * Space) and grants the founder facilitation capability for that Issue.
 *
 * This helper is called from the Space-home page the first time a founder
 * loads a freshly-created Space.
 */

export type EnsureBootstrapIssueInput = {
  readonly spaceId: string;
  readonly founderMemberId: string;
};

export type EnsureBootstrapIssueOk = {
  readonly issueId: string;
  readonly slug: string;
  readonly created: boolean;
};

export async function ensureBootstrapIssue(
  input: EnsureBootstrapIssueInput,
): Promise<Result<EnsureBootstrapIssueOk, AppError>> {
  const spaceRow = await db.select().from(spaces).where(eq(spaces.id, input.spaceId)).limit(1);
  const space = spaceRow[0];
  if (!space) return err(errors.notFound('space'));
  if (space.bootstrapCompletedAt !== null) {
    return err(errors.conflict('space', 'Bootstrap is already complete for this Space.'));
  }

  // Verify founder's membership before proceeding.
  const membership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, input.spaceId),
        eq(memberships.memberId, input.founderMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!membership[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Only an active founder can trigger Bootstrap.',
      ),
    );
  }

  const existing = await db
    .select({ id: issues.id, slug: issues.slug })
    .from(issues)
    .where(and(eq(issues.spaceId, input.spaceId), eq(issues.isBootstrap, true)))
    .limit(1);
  if (existing[0]) {
    return ok({ issueId: existing[0].id, slug: existing[0].slug, created: false });
  }

  const created = await createIssue({
    spaceId: input.spaceId,
    creatorMemberId: input.founderMemberId,
    title: 'How should we make decisions?',
    scope:
      'The founding governance question — how this Space reaches decisions. Closed via the hardcoded consent meta-method (CR-004).',
    isBootstrap: true,
  });
  if (!created.ok) return created;

  const grant = await grantDelegation({
    spaceId: input.spaceId,
    issueId: created.value.issueId,
    granteeMemberId: input.founderMemberId,
    granterMemberId: input.founderMemberId,
    capability: 'facilitation',
    grantedByType: 'bootstrap',
  });
  if (!grant.ok) return grant;

  return ok({ issueId: created.value.issueId, slug: created.value.slug, created: true });
}

/**
 * Complete Bootstrap — called from the decisions.finalize hook when the
 * Bootstrap Issue's DR is finalized. Stamps `bootstrap_completed_at` and
 * materializes any proposed governance_profile from the DR's payload.
 *
 * Phase 1 simplification: the governance_profile overrides live in the
 * Bootstrap DR's rationaleText as a free-form description rather than
 * structured JSON — Phase 13 (T176+) introduces the structured
 * profile-diff carrier. Here we simply stamp the completion timestamp.
 */
export async function completeBootstrapIfApplicable(args: {
  readonly spaceId: string;
  readonly issueId: string;
}): Promise<Result<{ readonly completed: boolean }, AppError>> {
  const issue = await db.select().from(issues).where(eq(issues.id, args.issueId)).limit(1);
  if (!issue[0]) return err(errors.notFound('issue'));

  if (!issue[0].isBootstrap) {
    return ok({ completed: false });
  }

  const space = await db.select().from(spaces).where(eq(spaces.id, args.spaceId)).limit(1);
  if (!space[0]) return err(errors.notFound('space'));

  if (space[0].bootstrapCompletedAt !== null) {
    return ok({ completed: false });
  }

  await db
    .update(spaces)
    .set({ bootstrapCompletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(spaces.id, args.spaceId), isNull(spaces.bootstrapCompletedAt)));

  return ok({ completed: true });
}
