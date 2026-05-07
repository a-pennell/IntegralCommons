import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { creditTransactions } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import type { PoolClient } from 'pg';

type Tx = PoolClient;

type CreditEntryArgs = {
  readonly neighborhoodId: string;
  readonly memberId: string;
  readonly amountText: string;
  readonly exchangeRequestId?: string;
  readonly recordedByMemberId?: string;
  readonly memo?: string;
};

/** Insert an append-only credit ledger row. Internal use only. */
async function insertCreditTransaction(
  tx: Tx,
  type: 'earned' | 'spent' | 'adjustment' | 'demurrage_applied',
  args: CreditEntryArgs,
): Promise<void> {
  await tx.query(
    `INSERT INTO credit_transactions (id, neighborhood_id, member_id, transaction_type, amount_text, exchange_request_id, memo, recorded_by_member_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      ulid(),
      args.neighborhoodId,
      args.memberId,
      type,
      args.amountText,
      args.exchangeRequestId ?? null,
      args.memo ?? null,
      args.recordedByMemberId ?? null,
    ],
  );
}

export async function recordCreditEarned(tx: Tx, args: CreditEntryArgs): Promise<void> {
  await insertCreditTransaction(tx, 'earned', args);
}

export async function recordCreditSpent(tx: Tx, args: CreditEntryArgs): Promise<void> {
  await insertCreditTransaction(tx, 'spent', { ...args, amountText: args.amountText });
}

export async function recordCreditAdjustment(args: {
  readonly neighborhoodId: string;
  readonly memberId: string;
  readonly amountText: string;
  readonly recordedByMemberId: string;
  readonly memo: string;
}): Promise<Result<void, AppError>> {
  if (!args.memo.trim()) {
    return err(errors.validation([{ path: 'memo', message: 'Adjustments require a memo.' }]));
  }
  await db.insert(creditTransactions).values({
    id: ulid(),
    neighborhoodId: args.neighborhoodId,
    memberId: args.memberId,
    transactionType: 'adjustment',
    amountText: args.amountText,
    memo: args.memo.trim(),
    recordedByMemberId: args.recordedByMemberId,
  });
  return ok(undefined);
}

/** Sum all credit_transactions for a member in a neighborhood. */
export async function getBalanceForMember(
  neighborhoodId: string,
  memberId: string,
): Promise<number> {
  const rows = await db
    .select({ total: sql<string>`COALESCE(SUM(amount_text::numeric), 0)` })
    .from(creditTransactions)
    .where(
      and(
        eq(creditTransactions.neighborhoodId, neighborhoodId),
        eq(creditTransactions.memberId, memberId),
      ),
    );
  return parseFloat(rows[0]?.total ?? '0');
}
