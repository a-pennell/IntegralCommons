import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { issues, memberships, spaces } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';
import { resolveGovernanceProfile, resolveScopeTags } from '@/server/governance-config';

/**
 * Update non-finalizing fields of an Issue (title, scope, structured_sections,
 * scope_tags). Status transitions go through `transitionStatus`.
 *
 * Writes an `issue_edited` Civic Memory event capturing the diff.
 */

export type UpdateIssueInput = {
  readonly issueId: string;
  readonly editorMemberId: string;
  readonly title?: string;
  readonly scope?: string;
  readonly scopeTags?: ReadonlyArray<string>;
  readonly structuredSections?: Record<string, unknown>;
};

export async function updateIssue(input: UpdateIssueInput): Promise<Result<void, AppError>> {
  const existing = await db
    .select({ issue: issues, space: spaces })
    .from(issues)
    .innerJoin(spaces, eq(spaces.id, issues.spaceId))
    .where(eq(issues.id, input.issueId))
    .limit(1);

  const row = existing[0];
  if (!row) return err(errors.notFound('issue'));

  const membership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, row.issue.spaceId),
        eq(memberships.memberId, input.editorMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);
  if (!membership[0]) {
    return err(
      errors.notAuthorized(
        'an active Membership in this Space',
        'Only active members may edit an Issue.',
      ),
    );
  }

  // Finalized Issues (status=decided, archived) cannot be mutated through
  // this path. Use transitionStatus/reopen/archive instead.
  if (row.issue.status === 'decided' || row.issue.status === 'archived') {
    return err(
      errors.conflict('issue', 'Cannot edit a decided or archived Issue. Reopen it first.'),
    );
  }

  const profile = resolveGovernanceProfile(row.space.governanceProfile);

  const updates: Record<string, unknown> = {};
  const diff: Record<string, unknown> = {};

  if (input.title !== undefined) {
    const trimmed = input.title.trim();
    if (trimmed.length < 1 || trimmed.length > 200) {
      return err(
        errors.validation([{ path: 'title', message: 'Title must be 1–200 characters.' }]),
      );
    }
    updates.title = trimmed;
    diff.title = { from: row.issue.title, to: trimmed };
  }

  if (input.scope !== undefined) {
    const trimmed = input.scope.trim();
    if (trimmed.length < 1 || trimmed.length > 500) {
      return err(
        errors.validation([{ path: 'scope', message: 'Scope must be 1–500 characters.' }]),
      );
    }
    updates.scope = trimmed;
    diff.scope = { from: row.issue.scope, to: trimmed };
  }

  if (input.scopeTags !== undefined) {
    const resolved = resolveScopeTags({ supplied: input.scopeTags, profile });
    if (!resolved.ok) return resolved;
    updates.scope_tags = resolved.value;
    diff.scopeTags = { from: row.issue.scopeTags, to: resolved.value };
  }

  if (input.structuredSections !== undefined) {
    updates.structured_sections = input.structuredSections;
    diff.structuredSections = { changed: true };
  }

  if (Object.keys(updates).length === 0) {
    return ok(undefined);
  }

  return transaction(async (tx) => {
    const set = Object.keys(updates)
      .map((k, i) => `${k} = $${i + 1}`)
      .concat(['updated_at = now()'])
      .join(', ');
    await tx.query(`UPDATE issues SET ${set} WHERE id = $${Object.keys(updates).length + 1}`, [
      ...Object.values(updates),
      input.issueId,
    ]);

    await writeTimelineEvent(tx, {
      issueId: input.issueId,
      eventType: 'issue_edited',
      actorMemberId: input.editorMemberId,
      payload: diff,
    });

    return ok(undefined);
  });
}
