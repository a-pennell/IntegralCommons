import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { delegationCapabilityEnum, delegationGrantSourceEnum } from '../enums.ts';
import { decisionRecords } from './decision_records.ts';
import { issues } from './issues.ts';
import { members } from './members.ts';
import { spaces } from './spaces.ts';

/**
 * Delegation — a capability granted to a Member, either per-Issue or
 * Space-wide. Revocable by design.
 *
 * There is DELIBERATELY no `irrevocable` column. This enforces CR-005
 * structurally — no application code can set one, and any PR that tries to
 * add such a column would fail review.
 *
 * target_referendum_id is populated when revocation was driven by a
 * referendum. Declared without an FK here because referenda.ts imports this
 * file; the FK is added in raw SQL post-migration.
 */
export const delegations = pgTable(
  'delegations',
  {
    id: text('id').primaryKey(),
    spaceId: text('space_id')
      .notNull()
      .references(() => spaces.id, { onDelete: 'restrict' }),
    // NULL => space-wide capability. NOT NULL => per-Issue delegation.
    issueId: text('issue_id').references(() => issues.id, { onDelete: 'restrict' }),
    granteeMemberId: text('grantee_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    grantedByType: delegationGrantSourceEnum('granted_by_type').notNull(),
    grantedByDecisionRecordId: text('granted_by_decision_record_id').references(
      () => decisionRecords.id,
      { onDelete: 'restrict' },
    ),
    capability: delegationCapabilityEnum('capability').notNull(),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    // FK added in raw SQL post-migration (avoids circular ORM import with referenda.ts).
    revokedByReferendumId: text('revoked_by_referendum_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('delegations_id_ulid_length', sql`char_length(${table.id}) = 26`),
    // Expiry is not in the predicate: now() is STABLE, not IMMUTABLE. Service
    // layer filters out expired delegations when querying with this index.
    activeIdx: index('delegations_active_idx')
      .on(table.spaceId, table.issueId, table.capability)
      .where(sql`${table.revokedAt} IS NULL`),
    granteeActiveIdx: index('delegations_grantee_active_idx')
      .on(table.granteeMemberId)
      .where(sql`${table.revokedAt} IS NULL`),
    revokedAfterGranted: check(
      'delegations_revoked_after_granted',
      sql`${table.revokedAt} IS NULL OR ${table.revokedAt} > ${table.grantedAt}`,
    ),
    revokedByConsistent: check(
      'delegations_revoked_by_consistent',
      sql`${table.revokedByReferendumId} IS NULL OR ${table.revokedAt} IS NOT NULL`,
    ),
  }),
);

export type Delegation = typeof delegations.$inferSelect;
export type NewDelegation = typeof delegations.$inferInsert;
