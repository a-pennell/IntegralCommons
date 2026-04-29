import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { issueStatusEnum, stallReasonEnum } from '../enums.ts';
import { members } from './members.ts';
import { spaces } from './spaces.ts';

/**
 * Issue — the central first-class object. Every decision lives in an Issue.
 *
 * `current_decision_record_id` is declared as `text` without an FK at the
 * ORM level because decision_records itself references issues.id. The FK is
 * added in raw SQL post-migration to break the circular dependency.
 *
 * Service-layer guards (see app/src/server/issues/) enforce:
 *   - FR-014: status='decided' requires current_decision_record_id
 *   - FR-015: status='reopened' requires reopen_reason
 *   - FR-039: status='stalled' may not transition to 'decided'
 *
 * A DB trigger (issue_status_consistency_trigger, see triggers.sql) also
 * enforces FR-014 structurally.
 */
export const issues = pgTable(
  'issues',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'restrict' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    scope: text('scope').notNull(),
    status: issueStatusEnum('status').notNull().default('open'),
    stallReason: stallReasonEnum('stall_reason'),
    currentDecisionRecordId: text('current_decision_record_id'),
    scopeTags: text('scope_tags')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    structuredSections: jsonb('structured_sections')
      .notNull()
      .default(sql`'{}'::jsonb`),
    decisionMethod: text('decision_method'),
    reviewDate: date('review_date'),
    isBootstrap: boolean('is_bootstrap').notNull().default(false),
    reopenReason: text('reopen_reason'),
    createdByMemberId: text('created_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('issues_id_ulid_length', sql`char_length(${table.id}) = 26`),
    slugSpaceUniq: uniqueIndex('issues_space_slug_uniq').on(table.spaceId, table.slug),
    spaceStatusIdx: index('issues_space_status_idx').on(table.spaceId, table.status),
    bootstrapPartialUniq: uniqueIndex('issues_space_bootstrap_uniq')
      .on(table.spaceId)
      .where(sql`${table.isBootstrap} = true`),
    titleLenCheck: check('issues_title_length', sql`char_length(${table.title}) BETWEEN 1 AND 200`),
    scopeLenCheck: check('issues_scope_length', sql`char_length(${table.scope}) BETWEEN 1 AND 500`),
  }),
);

/**
 * IssueView — minimal awareness-quorum tracker. One row per
 * (issue, member) the first time the member views the issue.
 */
export const issueViews = pgTable(
  'issue_views',
  {
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'restrict' }),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    firstViewedAt: timestamp('first_viewed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.issueId, table.memberId] }),
  }),
);

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type IssueView = typeof issueViews.$inferSelect;
export type NewIssueView = typeof issueViews.$inferInsert;
