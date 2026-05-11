import { sql } from 'drizzle-orm';
import { boolean, check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { needOfferStatusEnum, needOfferTypeEnum } from '../enums.ts';
import { members } from './members.ts';
import { neighborhoods } from './neighborhoods.ts';

/**
 * NeedOffer — an item on the mutual aid board.
 *
 * is_urgent: short-lived flag for time-sensitive needs. Stewards can
 *   clear it once the urgency passes.
 *
 * is_anonymous: suppresses the poster's identity in the UI. The
 *   posted_by_member_id is retained internally for moderation.
 *
 * posted_by_member_id is nullable to accommodate fully anonymous posts
 * where no member account is linked.
 */
export const needsOffers = pgTable(
  'needs_offers',
  {
    id: text('id').primaryKey(),
    neighborhoodId: text('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'restrict' }),
    postedByMemberId: text('posted_by_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    type: needOfferTypeEnum('type').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    isUrgent: boolean('is_urgent').notNull().default(false),
    isAnonymous: boolean('is_anonymous').notNull().default(false),
    status: needOfferStatusEnum('status').notNull().default('active'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('needs_offers_id_ulid_length', sql`char_length(${table.id}) = 26`),
    neighborhoodTypeIdx: index('needs_offers_neighborhood_type_idx').on(
      table.neighborhoodId,
      table.type,
    ),
    activeIdx: index('needs_offers_active_idx')
      .on(table.neighborhoodId, table.status, table.createdAt)
      .where(sql`${table.status} = 'active'`),
    titleLenCheck: check(
      'needs_offers_title_length',
      sql`char_length(${table.title}) BETWEEN 1 AND 200`,
    ),
  }),
);

export type NeedOffer = typeof needsOffers.$inferSelect;
export type NewNeedOffer = typeof needsOffers.$inferInsert;
