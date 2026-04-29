import { sql } from 'drizzle-orm';
import { check, index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { timelineEventTypeEnum } from '../enums.ts';
import { issues } from './issues.ts';
import { members } from './members.ts';

/**
 * TimelineEvent — the Civic Memory record. Append-only.
 *
 * APPEND-ONLY is enforced at the DATABASE level via a dedicated Postgres
 * role (`civic_memory_role`) that has INSERT and SELECT privileges only.
 * UPDATE and DELETE are REVOKEd. See triggers.sql for the grant SQL.
 *
 * The application writes events as the civic_memory_role, so any attempted
 * UPDATE/DELETE fails at the database. See FR-025, FR-026.
 */
export const timelineEvents = pgTable(
  'timeline_events',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'restrict' }),
    eventType: timelineEventTypeEnum('event_type').notNull(),
    actorMemberId: text('actor_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    payload: jsonb('payload')
      .notNull()
      .default(sql`'{}'::jsonb`),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('timeline_events_id_ulid_length', sql`char_length(${table.id}) = 26`),
    issueOccurredIdx: index('timeline_events_issue_occurred_idx').on(
      table.issueId,
      table.occurredAt,
    ),
  }),
);

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type NewTimelineEvent = typeof timelineEvents.$inferInsert;
