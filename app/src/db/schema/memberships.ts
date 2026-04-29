import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { digestCadenceEnum, membershipStatusEnum } from '../enums.ts';
import { members } from './members.ts';
import { spaces } from './spaces.ts';

/**
 * Membership — a Member's relationship to a Space.
 *
 * There is no tiered role system (FR-003). Everyone is either invited,
 * active, or departed. Admin-equivalent authority is a Delegation.
 */
export const memberships = pgTable(
  'memberships',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'restrict' }),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    status: membershipStatusEnum('status').notNull(),
    invitedAt: timestamp('invited_at', { withTimezone: true }).notNull().defaultNow(),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    departedAt: timestamp('departed_at', { withTimezone: true }),
    // departure_issue_id populated when departure was a governance-driven
    // removal (CR-001). Declared as text to avoid a circular FK; the FK is
    // enforced in the initial migration SQL after all tables are created.
    departureIssueId: text('departure_issue_id'),
    digestCadence: digestCadenceEnum('digest_cadence'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('memberships_id_ulid_length', sql`char_length(${table.id}) = 26`),
    uniqPerSpace: uniqueIndex('memberships_space_member_uniq').on(table.spaceId, table.memberId),
    spaceStatusIdx: index('memberships_space_status_idx').on(table.spaceId, table.status),
    statusDepartedConsistent: check(
      'memberships_status_departed_consistent',
      sql`(${table.departedAt} IS NULL) <> (${table.status} = 'departed')`,
    ),
  }),
);

export type Membership = typeof memberships.$inferSelect;
export type NewMembership = typeof memberships.$inferInsert;
