import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Member — a human account. One Member per email address.
 *
 * Right-to-be-Forgotten zeros out email and display_name but leaves the row
 * in place: Civic Memory references are redacted to "[removed member]" rather
 * than deleted, because erasing them would corrupt the decision record.
 */
export const members = pgTable(
  'members',
  {
    id: text('id').primaryKey(),
    email: text('email'),
    displayName: text('display_name'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    idUlidCheck: check('members_id_ulid_length', sql`char_length(${table.id}) = 26`),
    emailUniq: uniqueIndex('members_email_uniq')
      .on(table.email)
      .where(sql`${table.email} IS NOT NULL`),
    emailCreatedIdx: index('members_email_created_idx').on(table.email, table.createdAt),
    rtbfConsistent: check(
      'members_rtbf_consistent',
      sql`${table.deletedAt} IS NULL OR (${table.email} IS NULL AND ${table.displayName} IS NULL)`,
    ),
  }),
);

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
