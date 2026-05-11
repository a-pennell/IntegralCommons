import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { issues, timelineEvents } from '@/db/schema';
import type { TimelineEvent } from '@/db/schema';

export type TimelineEventWithIssue = TimelineEvent & {
  issueTitle: string;
  issueSlug: string;
};

export async function listTimelineEventsForSpace(
  spaceId: string,
  options: { readonly limit?: number } = {},
): Promise<ReadonlyArray<TimelineEventWithIssue>> {
  const limit = options.limit ?? 500;

  const spaceIssues = await db
    .select({ id: issues.id, title: issues.title, slug: issues.slug })
    .from(issues)
    .where(eq(issues.spaceId, spaceId));

  if (spaceIssues.length === 0) return [];

  const issueIds = spaceIssues.map((i) => i.id);
  const issueMeta = new Map(spaceIssues.map((i) => [i.id, { title: i.title, slug: i.slug }]));

  const events = await db
    .select()
    .from(timelineEvents)
    .where(inArray(timelineEvents.issueId, issueIds))
    .orderBy(desc(timelineEvents.occurredAt))
    .limit(limit);

  return events.map((e) => ({
    ...e,
    issueTitle: issueMeta.get(e.issueId)?.title ?? '',
    issueSlug: issueMeta.get(e.issueId)?.slug ?? '',
  }));
}
