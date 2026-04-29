import { sql } from 'drizzle-orm';
import { check, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { members } from './members.ts';
import { spaces } from './spaces.ts';

/**
 * DigestDelivery — log of rhythm-based digests sent. Idempotent: at most one
 * row per (member, space, scheduled_for). Re-running the digest job is a
 * no-op.
 *
 * If there is nothing meaningful to digest, no row is inserted (FR-044).
 */
export const digestDeliveries = pgTable(
  'digest_deliveries',
  {
    id: text('id').primaryKey(),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'restrict' }),
    scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    contentHash: text('content_hash').notNull(),
    dispatchedAdapter: text('dispatched_adapter').notNull(),
  },
  (table) => ({
    idUlidCheck: check('digest_deliveries_id_ulid_length', sql`char_length(${table.id}) = 26`),
    idempotencyUniq: uniqueIndex('digest_deliveries_idempotency_uniq').on(
      table.memberId,
      table.spaceId,
      table.scheduledFor,
    ),
  }),
);

export type DigestDelivery = typeof digestDeliveries.$inferSelect;
export type NewDigestDelivery = typeof digestDeliveries.$inferInsert;
