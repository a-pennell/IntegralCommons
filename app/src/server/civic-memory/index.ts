/**
 * Civic Memory module public surface.
 *
 * Writes to `timeline_events` must go through `writeTimelineEvent()` — the
 * DB role `civic_memory_role` blocks UPDATE/DELETE, so once a row lands it
 * cannot be altered. `listTimelineEventsForIssue()` is the read path.
 */

export { listTimelineEventsForIssue } from './list-events.ts';
export { listTimelineEventsForSpace, type TimelineEventWithIssue } from './list-events-for-space.ts';
export { writeTimelineEvent, type WriteTimelineEventInput } from './write-event.ts';
export {
  publishSummary,
  type PublishSummaryInput,
  type PublishSummaryOk,
} from './publish-summary.ts';
export { listSummariesForIssue, type SummaryWithAuthor } from './list-summaries.ts';
