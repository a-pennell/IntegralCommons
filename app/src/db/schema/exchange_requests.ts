import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { exchangeModeEnum, exchangeRequestStatusEnum } from '../enums.ts';
import { members } from './members.ts';
import { needsOffers } from './needs_offers.ts';

/**
 * ExchangeRequest — a member's offer to fulfill a Need, or a request to
 * receive an Offer.
 *
 * GIFT / CREDIT FIREWALL:
 *   `mode` is set at creation and NEVER changes. The service layer enforces
 *   this invariant: gift exchanges (mode='gift') produce no CreditTransaction
 *   rows. Time-credit exchanges (mode='time_credit') require a non-null
 *   credit_amount and generate ledger rows on completion.
 *
 * credit_amount is stored as text to support 0.5-credit increments without
 * floating-point precision issues. The service layer parses and validates
 * that it represents a positive multiple of 0.5.
 */
export const exchangeRequests = pgTable(
  'exchange_requests',
  {
    id: text('id').primaryKey(),
    needOfferId: text('need_offer_id')
      .notNull()
      .references(() => needsOffers.id, { onDelete: 'restrict' }),
    requesterMemberId: text('requester_member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    // Immutable after creation — enforced at service layer.
    mode: exchangeModeEnum('mode').notNull(),
    // Required when mode='time_credit'; must be null when mode='gift'.
    creditAmount: text('credit_amount'),
    status: exchangeRequestStatusEnum('status').notNull().default('pending'),
    notes: text('notes'),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('exchange_requests_id_ulid_length', sql`char_length(${table.id}) = 26`),
    needOfferStatusIdx: index('exchange_requests_need_offer_status_idx').on(
      table.needOfferId,
      table.status,
    ),
    requesterIdx: index('exchange_requests_requester_idx').on(table.requesterMemberId),
    // Gift exchanges must have no credit amount; time-credit exchanges must have one.
    creditAmountConsistent: check(
      'exchange_requests_credit_amount_consistent',
      sql`
        (${table.mode} = 'gift' AND ${table.creditAmount} IS NULL)
        OR
        (${table.mode} = 'time_credit' AND ${table.creditAmount} IS NOT NULL)
      `,
    ),
    completedAtConsistent: check(
      'exchange_requests_completed_at_consistent',
      sql`${table.completedAt} IS NULL OR ${table.status} = 'completed'`,
    ),
  }),
);

export type ExchangeRequest = typeof exchangeRequests.$inferSelect;
export type NewExchangeRequest = typeof exchangeRequests.$inferInsert;
