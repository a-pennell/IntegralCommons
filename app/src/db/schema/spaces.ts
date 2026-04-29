import { sql } from 'drizzle-orm';
import { check, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { digestCadenceEnum } from '../enums.ts';

/**
 * Space — a governing group's container. Every Issue, Perspective, DR, and
 * Membership belongs to exactly one Space.
 *
 * `governance_profile` holds per-Space thresholds, scope-tag vocabulary,
 * taxonomy vocabulary, decision-method default. See
 * docs/commonground-default-governance-policy.md for the JSONB shape.
 */
export const spaces = pgTable(
  'spaces',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    governanceProfile: jsonb('governance_profile')
      .notNull()
      .default(sql`'{}'::jsonb`),
    bootstrapCompletedAt: timestamp('bootstrap_completed_at', { withTimezone: true }),
    digestCadenceDefault: digestCadenceEnum('digest_cadence_default').notNull().default('weekly'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('spaces_id_ulid_length', sql`char_length(${table.id}) = 26`),
    slugUniq: uniqueIndex('spaces_slug_uniq').on(table.slug),
  }),
);

export type Space = typeof spaces.$inferSelect;
export type NewSpace = typeof spaces.$inferInsert;
