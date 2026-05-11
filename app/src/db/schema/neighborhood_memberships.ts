import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { neighborhoodMembershipRoleEnum } from '../enums.ts';
import { members } from './members.ts';
import { neighborhoods } from './neighborhoods.ts';

/**
 * NeighborhoodMembership — a Member's relationship to a Neighborhood.
 *
 * trust_level: 0-3, Superhost-style positive-only reputation.
 *   0 = new/unverified, 1 = known, 2 = trusted, 3 = highly trusted.
 *   Can only increase, never decrease (enforced at service layer).
 *
 * is_anonymous: Member opted into the anonymous tier. Their member_id
 *   is still present for internal record-keeping; display names and
 *   identities are suppressed in the UI.
 *
 * Anonymous members are stored as role='anonymous'. Their member_id
 * references a real member row so that RTBF still works.
 */
export const neighborhoodMemberships = pgTable(
  'neighborhood_memberships',
  {
    id: text('id').primaryKey(),
    neighborhoodId: text('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'restrict' }),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    role: neighborhoodMembershipRoleEnum('role').notNull().default('member'),
    trustLevel: integer('trust_level').notNull().default(0),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
    leftAt: timestamp('left_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check(
      'neighborhood_memberships_id_ulid_length',
      sql`char_length(${table.id}) = 26`,
    ),
    memberNeighborhoodUniq: uniqueIndex('neighborhood_memberships_member_neighborhood_uniq').on(
      table.neighborhoodId,
      table.memberId,
    ),
    neighborhoodActiveIdx: index('neighborhood_memberships_active_idx')
      .on(table.neighborhoodId, table.role)
      .where(sql`${table.leftAt} IS NULL`),
    trustLevelCheck: check(
      'neighborhood_memberships_trust_level_range',
      sql`${table.trustLevel} BETWEEN 0 AND 3`,
    ),
    leftAfterJoined: check(
      'neighborhood_memberships_left_after_joined',
      sql`${table.leftAt} IS NULL OR ${table.leftAt} > ${table.joinedAt}`,
    ),
  }),
);

export type NeighborhoodMembership = typeof neighborhoodMemberships.$inferSelect;
export type NewNeighborhoodMembership = typeof neighborhoodMemberships.$inferInsert;
