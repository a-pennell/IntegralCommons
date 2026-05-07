import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { resourceKindEnum, resourceStatusEnum } from '../enums.ts';
import { members } from './members.ts';
import { neighborhoods } from './neighborhoods.ts';

/**
 * Resource — an item in the neighborhood Resource Registry.
 *
 * offered_by_member_id is nullable to support anonymous contributions.
 * location_hint is free-text (cross street, unit number, etc.) — no
 * structured geodata in Phase 1.
 */
export const resources = pgTable(
  'resources',
  {
    id: text('id').primaryKey(),
    neighborhoodId: text('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'restrict' }),
    offeredByMemberId: text('offered_by_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    kind: resourceKindEnum('kind').notNull(),
    status: resourceStatusEnum('status').notNull().default('available'),
    locationHint: text('location_hint'),
    tags: text('tags')
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('resources_id_ulid_length', sql`char_length(${table.id}) = 26`),
    neighborhoodKindIdx: index('resources_neighborhood_kind_idx').on(
      table.neighborhoodId,
      table.kind,
    ),
    neighborhoodStatusIdx: index('resources_neighborhood_status_idx').on(
      table.neighborhoodId,
      table.status,
    ),
    titleLenCheck: check(
      'resources_title_length',
      sql`char_length(${table.title}) BETWEEN 1 AND 200`,
    ),
  }),
);

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
