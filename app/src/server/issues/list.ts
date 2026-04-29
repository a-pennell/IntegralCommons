import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { issues, memberships } from '@/db/schema';
import type { Issue } from '@/db/schema';

/**
 * List Issues in a Space, scoped to what the caller can see (i.e., the
 * caller must be an active Member).
 *
 * `statuses` filters by issue status. Pass an empty array for "all".
 */

type IssueStatus = Issue['status'];

export async function listIssuesForSpace(args: {
  readonly spaceId: string;
  readonly viewerMemberId: string;
  readonly statuses?: ReadonlyArray<IssueStatus>;
  readonly limit?: number;
}): Promise<ReadonlyArray<Issue>> {
  // Visibility check — collapses to an empty list for non-members.
  const visibility = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(eq(memberships.spaceId, args.spaceId), eq(memberships.memberId, args.viewerMemberId)),
    )
    .limit(1);
  if (!visibility[0]) return [];

  const statusFilter = args.statuses?.length
    ? inArray(issues.status, args.statuses as IssueStatus[])
    : undefined;

  const where = statusFilter
    ? and(eq(issues.spaceId, args.spaceId), statusFilter)
    : eq(issues.spaceId, args.spaceId);

  return db
    .select()
    .from(issues)
    .where(where)
    .orderBy(desc(issues.createdAt))
    .limit(args.limit ?? 200);
}
