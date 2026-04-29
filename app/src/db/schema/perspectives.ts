import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  pgTable,
  text,
  timestamp,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { issues } from './issues.ts';
import { members } from './members.ts';

/**
 * Perspective — a Member's structured contribution to an Issue. First-class,
 * not a comment. One level of nesting max (FR-021).
 *
 * The single-level-nesting CHECK uses a subquery (Postgres 16+). Service-layer
 * code must also enforce this for defence-in-depth; see
 * `app/src/server/perspectives/submit.ts`.
 */
export const perspectives = pgTable(
  'perspectives',
  {
    id: text('id').primaryKey(),
    issueId: text('issue_id')
      .notNull()
      .references(() => issues.id, { onDelete: 'restrict' }),
    authorId: text('author_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    bodyMarkdown: text('body_markdown').notNull(),
    taxonomyType: text('taxonomy_type').notNull(),
    fromDirectExperience: boolean('from_direct_experience').notNull().default(false),
    parentPerspectiveId: text('parent_perspective_id').references(
      (): AnyPgColumn => perspectives.id,
      { onDelete: 'restrict' },
    ),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    editedAt: timestamp('edited_at', { withTimezone: true }),
  },
  (table) => ({
    idUlidCheck: check('perspectives_id_ulid_length', sql`char_length(${table.id}) = 26`),
    bodyLenCheck: check(
      'perspectives_body_length',
      sql`char_length(${table.bodyMarkdown}) BETWEEN 1 AND 10000`,
    ),
    issueCreatedIdx: index('perspectives_issue_created_idx').on(table.issueId, table.createdAt),
    authorIdx: index('perspectives_author_idx').on(table.authorId),
    parentIdx: index('perspectives_parent_idx')
      .on(table.parentPerspectiveId)
      .where(sql`${table.parentPerspectiveId} IS NOT NULL`),
    // One-level nesting: parent must itself have parentPerspectiveId = NULL.
    // Requires Postgres 16+ (subquery in CHECK). Service layer enforces too.
    singleLevelCheck: check(
      'perspectives_single_level_nesting',
      sql`${table.parentPerspectiveId} IS NULL OR (SELECT p.parent_perspective_id FROM perspectives p WHERE p.id = ${table.parentPerspectiveId}) IS NULL`,
    ),
  }),
);

export type Perspective = typeof perspectives.$inferSelect;
export type NewPerspective = typeof perspectives.$inferInsert;
