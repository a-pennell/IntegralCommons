import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { issues } from './issues.ts';
import { members } from './members.ts';

/**
 * OfficialSummary — manual, facilitator-authored summary of an Issue.
 * Versioned: editing produces a new row with an incremented version. Prior
 * versions remain in place (immutable once published).
 */
export const officialSummaries = pgTable(
  'official_summaries',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'restrict' }),
    version: integer('version').notNull(),
    authorMemberId: text('author_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    bodyMarkdown: text('body_markdown').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    contentHash: text('content_hash').notNull(),
  },
  (table) => ({
    idUlidCheck: check('official_summaries_id_ulid_length', sql`char_length(${table.id}) = 26`),
    issueVersionUniq: uniqueIndex('official_summaries_issue_version_uniq').on(
      table.issueId,
      table.version,
    ),
    issuePublishedIdx: index('official_summaries_issue_published_idx').on(
      table.issueId,
      table.publishedAt,
    ),
    bodyLenCheck: check(
      'official_summaries_body_length',
      sql`char_length(${table.bodyMarkdown}) BETWEEN 1 AND 20000`,
    ),
  }),
);

export type OfficialSummary = typeof officialSummaries.$inferSelect;
export type NewOfficialSummary = typeof officialSummaries.$inferInsert;
