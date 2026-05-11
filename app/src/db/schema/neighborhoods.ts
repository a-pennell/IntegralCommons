import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { neighborhoodStatusEnum } from '../enums.ts';
import { members } from './members.ts';

/**
 * Neighborhood — the root entity for Local Commons.
 *
 * A neighborhood may optionally link to a CommonGround space
 * (linked_space_id) for deliberation. That reference is stored as text
 * without an ORM-level FK because it crosses schema boundaries; a raw-SQL
 * FK is added post-migration in triggers.sql.
 */
export const neighborhoods = pgTable(
  'neighborhoods',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description').notNull().default(''),
    /**
     * Plain-language description of the neighborhood's approximate geographic
     * extent (Phase 1). Steward writes something like "The blocks around Oak
     * Street from 1st to 8th Ave, including Riverside Park." Displayed to
     * members as orientation context; never enforced as a gate. Map polygon
     * drawing is deferred to Phase 2.
     */
    boundaryDescription: text('boundary_description').notNull().default(''),
    status: neighborhoodStatusEnum('status').notNull().default('active'),
    // Cross-schema soft reference to a CommonGround space.
    linkedSpaceId: text('linked_space_id'),
    createdByMemberId: text('created_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('neighborhoods_id_ulid_length', sql`char_length(${table.id}) = 26`),
    slugUniq: uniqueIndex('neighborhoods_slug_uniq').on(table.slug),
    statusIdx: index('neighborhoods_status_idx').on(table.status),
    nameLenCheck: check(
      'neighborhoods_name_length',
      sql`char_length(${table.name}) BETWEEN 1 AND 200`,
    ),
  }),
);

export type Neighborhood = typeof neighborhoods.$inferSelect;
export type NewNeighborhood = typeof neighborhoods.$inferInsert;
