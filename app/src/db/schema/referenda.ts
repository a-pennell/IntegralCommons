import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import {
  referendumOutcomeEnum,
  referendumStatusEnum,
  referendumTargetEnum,
  voteChoiceEnum,
} from '../enums.ts';
import { decisionRecords } from './decision_records.ts';
import { delegations } from './delegations.ts';
import { issues } from './issues.ts';
import { members } from './members.ts';
import { spaces } from './spaces.ts';

/**
 * Referendum — a structured challenge to a Delegation or Decision Record or
 * governance-profile change, with a mandatory deliberation phase before any
 * vote (CR-010).
 *
 * Exactly ONE of (target_delegation_id, target_decision_record_id,
 * target_issue_id) is non-null — enforced by a CHECK below.
 */
export const referenda = pgTable(
  'referenda',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'restrict' }),
    initiatedByMemberId: text('initiated_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    targetType: referendumTargetEnum('target_type').notNull(),
    targetDelegationId: text('target_delegation_id').references(() => delegations.id, {
      onDelete: 'restrict',
    }),
    targetDecisionRecordId: text('target_decision_record_id').references(() => decisionRecords.id, {
      onDelete: 'restrict',
    }),
    targetIssueId: text('target_issue_id').references(() => issues.id, {
      onDelete: 'restrict',
    }),
    status: referendumStatusEnum('status').notNull().default('initiating'),
    minimumThresholdRequired: integer('minimum_threshold_required').notNull(),
    minimumThresholdReachedAt: timestamp('minimum_threshold_reached_at', {
      withTimezone: true,
    }),
    deliberationStartedAt: timestamp('deliberation_started_at', { withTimezone: true }),
    votingStartedAt: timestamp('voting_started_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    outcome: referendumOutcomeEnum('outcome'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('referenda_id_ulid_length', sql`char_length(${table.id}) = 26`),
    spaceStatusIdx: index('referenda_space_status_idx').on(table.spaceId, table.status),
    initiatorRecencyIdx: index('referenda_initiator_recency_idx').on(
      table.initiatedByMemberId,
      table.createdAt,
    ),
    targetDelegationIdx: index('referenda_target_delegation_idx')
      .on(table.targetDelegationId)
      .where(sql`${table.targetDelegationId} IS NOT NULL`),
    // Exactly one of the three targets is non-null.
    exactlyOneTarget: check(
      'referenda_exactly_one_target',
      sql`(
        (CASE WHEN ${table.targetDelegationId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${table.targetDecisionRecordId} IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN ${table.targetIssueId} IS NOT NULL THEN 1 ELSE 0 END)
      ) = 1`,
    ),
    outcomeOnClose: check(
      'referenda_outcome_on_close',
      sql`(${table.closedAt} IS NULL) = (${table.outcome} IS NULL)`,
    ),
  }),
);

/**
 * ReferendumVote — individual vote on a Referendum.
 * Immutable once cast. One vote per Member per Referendum.
 */
export const referendumVotes = pgTable(
  'referendum_votes',
  {
    id: text('id').primaryKey(),
    referendumId: text('referendum_id')
      .notNull()
      .references(() => referenda.id, { onDelete: 'restrict' }),
    voterMemberId: text('voter_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    choice: voteChoiceEnum('choice').notNull(),
    castAt: timestamp('cast_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('referendum_votes_id_ulid_length', sql`char_length(${table.id}) = 26`),
    oneVoteUniq: uniqueIndex('referendum_votes_one_per_member_uniq').on(
      table.referendumId,
      table.voterMemberId,
    ),
  }),
);

/**
 * ReferendumSupporter — endorsements of a Referendum's initiation, for
 * threshold tracking (CR-006).
 */
export const referendumSupporters = pgTable(
  'referendum_supporters',
  {
    id: text('id').primaryKey(),
    referendumId: text('referendum_id')
      .notNull()
      .references(() => referenda.id, { onDelete: 'restrict' }),
    supporterMemberId: text('supporter_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    supportedAt: timestamp('supported_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('referendum_supporters_id_ulid_length', sql`char_length(${table.id}) = 26`),
    oneSupportUniq: uniqueIndex('referendum_supporters_one_per_member_uniq').on(
      table.referendumId,
      table.supporterMemberId,
    ),
  }),
);

export type Referendum = typeof referenda.$inferSelect;
export type NewReferendum = typeof referenda.$inferInsert;
export type ReferendumVote = typeof referendumVotes.$inferSelect;
export type NewReferendumVote = typeof referendumVotes.$inferInsert;
export type ReferendumSupporter = typeof referendumSupporters.$inferSelect;
export type NewReferendumSupporter = typeof referendumSupporters.$inferInsert;
