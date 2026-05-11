import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp, numeric } from 'drizzle-orm/pg-core';
import { allocationStatusEnum, consentStatusEnum } from '../enums.ts';
import { members } from './members.ts';
import { surplusShortageDeclarations } from './declarations.ts';
import { producers } from './producers.ts';

/**
 * AllocationProposal — a proposed routing of a surplus to a need.
 *
 * Synapse proposes; communities decide. A proposal has no effect until
 * all required consent parties have responded with 'consented'.
 * The system never executes an allocation — it surfaces opportunities
 * and waits for human consent before recording a commitment.
 */
export const allocationProposals = pgTable(
  'allocation_proposals',
  {
    id: text('id').primaryKey(),
    proposedByMemberId: text('proposed_by_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    surplusDeclarationId: text('surplus_declaration_id')
      .notNull()
      .references(() => surplusShortageDeclarations.id, { onDelete: 'restrict' }),
    shortageDeclarationId: text('shortage_declaration_id').references(
      () => surplusShortageDeclarations.id,
      { onDelete: 'restrict' },
    ),
    quantity: numeric('quantity', { precision: 10, scale: 2 }),
    notes: text('notes'),
    status: allocationStatusEnum('status').notNull().default('proposed'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('allocation_proposals_id_ulid_length', sql`char_length(${table.id}) = 26`),
    statusIdx: index('allocation_proposals_status_idx').on(table.status),
    surplusIdx: index('allocation_proposals_surplus_idx').on(table.surplusDeclarationId),
  }),
);

export const allocationConsents = pgTable(
  'allocation_consents',
  {
    id: text('id').primaryKey(),
    proposalId: text('proposal_id')
      .notNull()
      .references(() => allocationProposals.id, { onDelete: 'restrict' }),
    consentingMemberId: text('consenting_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    representingProducerId: text('representing_producer_id').references(() => producers.id, {
      onDelete: 'restrict',
    }),
    status: consentStatusEnum('status').notNull().default('pending'),
    notes: text('notes'),
    respondedAt: timestamp('responded_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('allocation_consents_id_ulid_length', sql`char_length(${table.id}) = 26`),
    proposalIdx: index('allocation_consents_proposal_idx').on(table.proposalId),
    memberIdx: index('allocation_consents_member_idx').on(table.consentingMemberId),
  }),
);

export type AllocationProposal = typeof allocationProposals.$inferSelect;
export type NewAllocationProposal = typeof allocationProposals.$inferInsert;
export type AllocationConsent = typeof allocationConsents.$inferSelect;
export type NewAllocationConsent = typeof allocationConsents.$inferInsert;
