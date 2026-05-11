import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { stewardshipEntryTypeEnum } from '../enums.ts';
import { members } from './members.ts';
import { neighborhoods } from './neighborhoods.ts';

/**
 * StewardshipEntry — append-only log of steward activity within a
 * neighborhood. Intentionally non-evaluative: records what was done, not
 * whether it was done well.
 *
 * APPEND-ONLY: No UPDATE or DELETE — corrections are new rows of type
 * 'action_taken' with a note referencing the prior entry.
 *
 * subject_member_id: the member the entry relates to (e.g., a care check).
 *   Nullable when the entry is about the neighborhood itself.
 *
 * linked_resource_id: soft text reference to a Resource row. No ORM-level
 *   FK to avoid coupling Local Commons tables to each other at import time.
 */
export const stewardshipEntries = pgTable(
  'stewardship_entries',
  {
    id: text('id').primaryKey(),
    neighborhoodId: text('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'restrict' }),
    actorMemberId: text('actor_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    subjectMemberId: text('subject_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    entryType: stewardshipEntryTypeEnum('entry_type').notNull(),
    notes: text('notes').notNull().default(''),
    linkedResourceId: text('linked_resource_id'),
    // No updatedAt — this table is append-only.
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('stewardship_entries_id_ulid_length', sql`char_length(${table.id}) = 26`),
    neighborhoodOccurredIdx: index('stewardship_entries_neighborhood_occurred_idx').on(
      table.neighborhoodId,
      table.occurredAt,
    ),
    actorIdx: index('stewardship_entries_actor_idx').on(table.actorMemberId),
    subjectIdx: index('stewardship_entries_subject_idx').on(table.subjectMemberId),
  }),
);

export type StewardshipEntry = typeof stewardshipEntries.$inferSelect;
export type NewStewardshipEntry = typeof stewardshipEntries.$inferInsert;
