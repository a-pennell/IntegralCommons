import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { creditTransactionTypeEnum } from '../enums.ts';
import { members } from './members.ts';
import { neighborhoods } from './neighborhoods.ts';

/**
 * CreditTransaction — append-only time-credit ledger.
 *
 * APPEND-ONLY: Corrections are expressed as new rows with
 *   type='adjustment' and a negative or positive amount. Never update or
 *   delete existing rows.
 *
 * amount_text: stored as text to avoid float-precision issues with 0.5
 *   increments. Service layer validates that it parses to a non-zero
 *   multiple of 0.5. Negative values are valid (e.g., 'spent', 'adjustment').
 *
 * exchange_request_id: links to the exchange that generated this row.
 *   Nullable for adjustments and system-generated demurrage.
 *
 * recorded_by_member_id: the steward or system actor that recorded this
 *   entry. Nullable only for automated demurrage rows.
 *
 * Demurrage: per-neighborhood rate_pct and period are stored out-of-band
 *   (neighborhood.settings JSONB, added in Phase 2). The scheduled job
 *   inserts rows with type='demurrage_applied'.
 */
export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: text('id').primaryKey(),
    neighborhoodId: text('neighborhood_id')
      .notNull()
      .references(() => neighborhoods.id, { onDelete: 'restrict' }),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    transactionType: creditTransactionTypeEnum('transaction_type').notNull(),
    amountText: text('amount_text').notNull(),
    // Soft FK to exchange_requests (cross-table, no ORM FK to keep schema clean).
    exchangeRequestId: text('exchange_request_id'),
    memo: text('memo'),
    recordedByMemberId: text('recorded_by_member_id').references(() => members.id, {
      onDelete: 'restrict',
    }),
    // No updatedAt — this table is append-only.
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check(
      'credit_transactions_id_ulid_length',
      sql`char_length(${table.id}) = 26`,
    ),
    memberNeighborhoodOccurredIdx: index('credit_transactions_member_neighborhood_idx').on(
      table.neighborhoodId,
      table.memberId,
      table.occurredAt,
    ),
    neighborhoodOccurredIdx: index('credit_transactions_neighborhood_occurred_idx').on(
      table.neighborhoodId,
      table.occurredAt,
    ),
    amountNotEmpty: check(
      'credit_transactions_amount_not_empty',
      sql`char_length(${table.amountText}) > 0`,
    ),
  }),
);

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;
