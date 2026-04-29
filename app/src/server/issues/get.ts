import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { issues, memberships } from '@/db/schema';
import type { Issue } from '@/db/schema';

/**
 * Fetch a single Issue by (spaceId, slug), scoped to the caller's visibility.
 * Returns null when the Issue does not exist OR the caller is not a member
 * of the Space.
 */
export async function getIssueBySlugForMember(args: {
  readonly spaceId: string;
  readonly slug: string;
  readonly viewerMemberId: string;
}): Promise<Issue | null> {
  const visibility = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(eq(memberships.spaceId, args.spaceId), eq(memberships.memberId, args.viewerMemberId)),
    )
    .limit(1);
  if (!visibility[0]) return null;

  const rows = await db
    .select()
    .from(issues)
    .where(and(eq(issues.spaceId, args.spaceId), eq(issues.slug, args.slug)))
    .limit(1);
  return rows[0] ?? null;
}

/** By id, same visibility semantics. */
export async function getIssueByIdForMember(args: {
  readonly issueId: string;
  readonly viewerMemberId: string;
}): Promise<Issue | null> {
  const rows = await db
    .select()
    .from(issues)
    .innerJoin(
      memberships,
      and(eq(memberships.spaceId, issues.spaceId), eq(memberships.memberId, args.viewerMemberId)),
    )
    .where(eq(issues.id, args.issueId))
    .limit(1);
  return rows[0]?.issues ?? null;
}
