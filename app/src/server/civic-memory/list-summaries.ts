import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { members, officialSummaries } from '@/db/schema';
import type { OfficialSummary } from '@/db/schema';

/**
 * List Official Summaries for an Issue, newest version first (FR-041).
 *
 * Includes the author's display name for the UI. Versions are immutable —
 * no UPDATE ever occurs on these rows.
 */

export type SummaryWithAuthor = OfficialSummary & {
  authorDisplayName: string | null;
};

export async function listSummariesForIssue(
  issueId: string,
): Promise<ReadonlyArray<SummaryWithAuthor>> {
  const rows = await db
    .select({
      summary: officialSummaries,
      authorDisplayName: members.displayName,
    })
    .from(officialSummaries)
    .leftJoin(members, eq(officialSummaries.authorMemberId, members.id))
    .where(eq(officialSummaries.issueId, issueId))
    .orderBy(desc(officialSummaries.version));

  return rows.map((r) => ({
    ...r.summary,
    authorDisplayName: r.authorDisplayName,
  }));
}
