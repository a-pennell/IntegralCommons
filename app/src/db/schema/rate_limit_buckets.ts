import { integer, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import { rateLimitedActionEnum } from '../enums.ts';
import { members } from './members.ts';

/**
 * RateLimitBucket — per-Member, per-action rate-limit state.
 *
 * Enforces CR-009. Phase 1 defaults (hardcoded in the service layer):
 *   - initiate_referendum: 1 per rolling 7-day window.
 *   - create_issue: 3 per calendar day (UTC).
 *
 * Spaces MAY override to TIGHTER limits via governance_profile. The service
 * layer refuses looser limits than the defaults (CR-009 floor).
 */
export const rateLimitBuckets = pgTable(
  'rate_limit_buckets',
  {
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    actionType: rateLimitedActionEnum('action_type').notNull(),
    windowStart: timestamp('window_start', { withTimezone: true }).notNull(),
    count: integer('count').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.memberId, table.actionType, table.windowStart],
    }),
  }),
);

export type RateLimitBucket = typeof rateLimitBuckets.$inferSelect;
export type NewRateLimitBucket = typeof rateLimitBuckets.$inferInsert;
