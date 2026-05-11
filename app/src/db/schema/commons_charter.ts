import { sql } from 'drizzle-orm';
import { check, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { charterSectionStatusEnum } from '../enums.ts';
import { members } from './members.ts';
import { neighborhoods } from './neighborhoods.ts';

/**
 * CommonsCharterSection — one versioned section of a neighborhood's
 * Commons Charter (e.g., 'stewardship_principles', 'resource_guidelines').
 *
 * Versioning: when a section is re-drafted, the existing ratified row
 * transitions to status='superseded' and a new draft row is inserted.
 * superseded_by_id is a soft self-reference (no ORM FK) pointing to the
 * row that supersedes this one.
 *
 * Only one row per (neighborhood_id, section_key) may be in 'draft' or
 * 'ratified' state at a time — enforced via partial unique indexes.
 */
export const commonsCharterSections = pgTable(
  'commons_charter_sections',
  {
    id: text('id').primaryKey(),
    neighborhoodId: text('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'restrict' }),
    sectionKey: text('section_key').notNull(),
    title: text('title').notNull(),
    body: text('body').notNull(),
    version: integer('version').notNull().default(1),
    status: charterSectionStatusEnum('status').notNull().default('draft'),
    ratifiedAt: timestamp('ratified_at', { withTimezone: true }),
    ratifiedByMemberId: text('ratified_by_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    // Soft self-reference to the row that supersedes this one.
    supersededById: text('superseded_by_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check(
      'commons_charter_sections_id_ulid_length',
      sql`char_length(${table.id}) = 26`,
    ),
    neighborhoodSectionIdx: index('commons_charter_sections_neighborhood_section_idx').on(
      table.neighborhoodId,
      table.sectionKey,
    ),
    sectionKeyLenCheck: check(
      'commons_charter_sections_key_length',
      sql`char_length(${table.sectionKey}) BETWEEN 1 AND 100`,
    ),
    ratifiedConsistent: check(
      'commons_charter_sections_ratified_consistent',
      sql`
        (${table.status} = 'ratified' AND ${table.ratifiedAt} IS NOT NULL)
        OR ${table.status} != 'ratified'
      `,
    ),
    versionPositive: check('commons_charter_sections_version_positive', sql`${table.version} >= 1`),
  }),
);

export type CommonsCharterSection = typeof commonsCharterSections.$inferSelect;
export type NewCommonsCharterSection = typeof commonsCharterSections.$inferInsert;
