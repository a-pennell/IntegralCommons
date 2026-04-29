import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { timelineEvents } from '@/db/schema';
import type { TimelineEvent } from '@/db/schema';

/**
 * Read the Civic Memory timeline for an Issue, ordered newest first.
 *
 * This read is a scan of `timeline_events WHERE issue_id = $1`. The
 * (issue_id, occurred_at DESC) index on the table makes it cheap.
 *
 * The caller is responsible for authorizing the viewer — timeline events are
 * Space-scoped, and the viewer must have an active Membership in the Space
 * the Issue belongs to.
 */

export async function listTimelineEventsForIssue(
  issueId: string,
  options: { readonly limit?: number } = {},
): Promise<ReadonlyArray<TimelineEvent>> {
  const limit = options.limit ?? 500;
  return db
    .select()
    .from(timelineEvents)
    .where(eq(timelineEvents.issueId, issueId))
    .orderBy(desc(timelineEvents.occurredAt))
    .limit(limit);
}
