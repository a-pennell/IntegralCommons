import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { producerStatusEnum } from '../enums.ts';
import { members } from './members.ts';

/**
 * Producer — a farm, food cooperative, or other food-system actor.
 *
 * Producers are distinct from household Members: they opt into public
 * visibility by default and declare surpluses/shortages at an
 * organisational level rather than a personal one.
 *
 * A single Member can manage multiple producer profiles (e.g. a
 * co-op administrator managing several farms).
 */
export const producers = pgTable(
  'producers',
  {
    id: text('id').primaryKey(),
    managedByMemberId: text('managed_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    orgName: text('org_name').notNull(),
    locationDescription: text('location_description').notNull(),
    bio: text('bio'),
    isPublic: boolean('is_public').notNull().default(true),
    status: producerStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('producers_id_ulid_length', sql`char_length(${table.id}) = 26`),
    memberIdx: index('producers_member_idx').on(table.managedByMemberId),
    statusIdx: index('producers_status_idx').on(table.status),
  }),
);

export type Producer = typeof producers.$inferSelect;
export type NewProducer = typeof producers.$inferInsert;
