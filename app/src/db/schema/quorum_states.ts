import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { issues } from './issues.ts';

/**
 * QuorumState — per-Issue three-tier quorum tracking (awareness /
 * participation / decision). Denormalized for fast reads; recomputed lazily
 * on writes that affect counts and reconciled by the scheduled quorum-check
 * pg-boss job.
 *
 * One row per Issue.
 */
export const quorumStates = pgTable(
  'quorum_states',
  {
    issueId: text('issue_id')
      .primaryKey()
      .references(() => issues.id, { onDelete: 'restrict' }),
    awarenessCount: integer('awareness_count').notNull().default(0),
    awarenessRequired: integer('awareness_required').notNull(),
    participationCount: integer('participation_count').notNull().default(0),
    participationRequired: integer('participation_required').notNull(),
    decisionQuorumMet: boolean('decision_quorum_met').notNull().default(false),
    deliberationPeriodEndsAt: timestamp('deliberation_period_ends_at', {
      withTimezone: true,
    }).notNull(),
    extensionPeriodEndsAt: timestamp('extension_period_ends_at', { withTimezone: true }),
    stalledAt: timestamp('stalled_at', { withTimezone: true }),
    unstalledAt: timestamp('unstalled_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    deliberationDueIdx: index('quorum_states_deliberation_due_idx')
      .on(table.deliberationPeriodEndsAt)
      .where(sql`${table.stalledAt} IS NULL`),
  }),
);

export type QuorumState = typeof quorumStates.$inferSelect;
export type NewQuorumState = typeof quorumStates.$inferInsert;
