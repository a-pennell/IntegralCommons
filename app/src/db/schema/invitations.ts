import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { members } from './members.ts';
import { memberships } from './memberships.ts';
import { spaces } from './spaces.ts';

/**
 * Invitation — pending invitation to a Space. Separate from Membership so the
 * invitation can exist without forcing a Member record to be created before
 * the invitee actually logs in.
 */
export const invitations = pgTable(
  'invitations',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'restrict' }),
    invitedEmail: text('invited_email').notNull(),
    invitedByMemberId: text('invited_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '14 days'`),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    acceptedMembershipId: text('accepted_membership_id').references(() => memberships.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('invitations_id_ulid_length', sql`char_length(${table.id}) = 26`),
    tokenHashIdx: index('invitations_token_hash_idx').on(table.tokenHash),
    emailSpaceIdx: index('invitations_email_space_idx').on(table.invitedEmail, table.spaceId),
    acceptedConsistent: check(
      'invitations_accepted_consistent',
      sql`(${table.acceptedAt} IS NULL) = (${table.acceptedMembershipId} IS NULL)`,
    ),
  }),
);

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
