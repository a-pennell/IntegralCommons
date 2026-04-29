import { sql } from 'drizzle-orm';
import {
  check,
  date,
  index,
  pgTable,
  text,
  timestamp,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { issues } from './issues.ts';
import { members } from './members.ts';

/**
 * DecisionRecord — the persistent, revisable record of a decision.
 *
 * All five required elements from FR-023 are present as columns.
 * `unresolved_objections_text` is NOT NULL with default '' so authors must
 * explicitly capture "no objections" rather than omit the field.
 *
 * Finalization is one-way: once `finalized_at IS NOT NULL`, the row is
 * effectively immutable. A supersession creates a NEW DecisionRecord row
 * with `supersedes_decision_record_id` pointing at the prior one.
 */
export const decisionRecords = pgTable(
  'decision_records',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'restrict' }),
    draftedByMemberId: text('drafted_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    whatText: text('what_text').notNull(),
    howMethod: text('how_method').notNull(),
    rationaleText: text('rationale_text').notNull(),
    unresolvedObjectionsText: text('unresolved_objections_text').notNull().default(''),
    reviewDate: date('review_date').notNull(),
    finalizedAt: timestamp('finalized_at', { withTimezone: true }),
    finalizedByMemberId: text('finalized_by_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    supersedesDecisionRecordId: text('supersedes_decision_record_id').references(
      (): AnyPgColumn => decisionRecords.id,
      { onDelete: 'restrict' },
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('decision_records_id_ulid_length', sql`char_length(${table.id}) = 26`),
    issueFinalizedIdx: index('decision_records_issue_finalized_idx').on(
      table.issueId,
      table.finalizedAt,
    ),
    supersedesIdx: index('decision_records_supersedes_idx')
      .on(table.supersedesDecisionRecordId)
      .where(sql`${table.supersedesDecisionRecordId} IS NOT NULL`),
    whatLenCheck: check(
      'decision_records_what_length',
      sql`char_length(${table.whatText}) BETWEEN 1 AND 20000`,
    ),
    rationaleLenCheck: check(
      'decision_records_rationale_length',
      sql`char_length(${table.rationaleText}) BETWEEN 1 AND 20000`,
    ),
    objectionsLenCheck: check(
      'decision_records_objections_length',
      sql`char_length(${table.unresolvedObjectionsText}) <= 20000`,
    ),
    finalizerConsistent: check(
      'decision_records_finalizer_consistent',
      sql`(${table.finalizedAt} IS NULL) = (${table.finalizedByMemberId} IS NULL)`,
    ),
  }),
);

export type DecisionRecord = typeof decisionRecords.$inferSelect;
export type NewDecisionRecord = typeof decisionRecords.$inferInsert;
