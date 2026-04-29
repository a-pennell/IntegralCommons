import { createIssue } from '@/server/issues';

/**
 * Meta-Issue helper — opens a blocking Issue when two deliberable
 * constitutional principles collide (CR-012).
 *
 * When the system detects a conflict between principles (e.g.,
 * participation-integrity vs deliberation-first in a referendum edge case)
 * it opens a meta-Issue so the group can deliberate the conflict explicitly
 * rather than having the system silently pick a winner.
 *
 * The offending action is blocked until the meta-Issue is decided.
 *
 * Phase 1: this helper opens the meta-Issue and returns its ID for the
 * caller to surface in a ConstitutionalViolation error. The actual blocking
 * guard lives in the calling service module.
 */

export type MetaIssueInput = {
  readonly spaceId: string;
  readonly initiatorMemberId: string;
  readonly conflictingPrinciples: [string, string];
  readonly context: string;
};

export type MetaIssueResult =
  | { readonly ok: true; readonly issueId: string; readonly slug: string }
  | { readonly ok: false; readonly reason: string };

export async function openMetaIssue(input: MetaIssueInput): Promise<MetaIssueResult> {
  const [a, b] = input.conflictingPrinciples;
  const title = `Constitutional conflict: ${a} vs. ${b}`;
  const scope =
    `A governance action was blocked because ${a} and ${b} conflict in this situation. ` +
    `This meta-Issue exists to deliberate the conflict and produce a Decision Record that ` +
    `resolves it. Until this Issue is decided, the offending action remains blocked. ` +
    `Context: ${input.context}`;

  const result = await createIssue({
    spaceId: input.spaceId,
    creatorMemberId: input.initiatorMemberId,
    title,
    scope,
    structuredSections: {
      changeType: 'meta_conflict',
      conflictingPrinciples: input.conflictingPrinciples,
      context: input.context,
    },
  });

  if (!result.ok) {
    return { ok: false, reason: `Failed to open meta-Issue: ${result.error.kind}` };
  }

  return { ok: true, issueId: result.value.issueId, slug: result.value.slug };
}
