import { and, eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { needsOffers, exchangeRequests } from '@/db/schema';
import type { ExchangeRequest, NeedOffer } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { recordCreditEarned, recordCreditSpent } from '../time-credits/index.ts';

export type CreateNeedOfferInput = {
  readonly neighborhoodId: string;
  readonly postedByMemberId?: string;
  readonly type: 'need' | 'offer';
  readonly title: string;
  readonly body?: string;
  readonly isUrgent?: boolean;
  readonly isAnonymous?: boolean;
  readonly expiresAt?: Date;
};

export async function createNeedOffer(
  input: CreateNeedOfferInput,
): Promise<Result<{ needOfferId: string }, AppError>> {
  const title = input.title.trim();
  if (title.length < 1 || title.length > 200) {
    return err(errors.validation([{ path: 'title', message: 'Title must be 1–200 characters.' }]));
  }

  const id = ulid();
  await db.insert(needsOffers).values({
    id,
    neighborhoodId: input.neighborhoodId,
    postedByMemberId: input.postedByMemberId ?? null,
    type: input.type,
    title,
    body: input.body?.trim() ?? '',
    isUrgent: input.isUrgent ?? false,
    isAnonymous: input.isAnonymous ?? false,
    status: 'active',
    expiresAt: input.expiresAt ?? null,
  });

  return ok({ needOfferId: id });
}

export async function listActiveNeedsOffers(
  neighborhoodId: string,
  type?: 'need' | 'offer',
): Promise<NeedOffer[]> {
  const conditions = [
    eq(needsOffers.neighborhoodId, neighborhoodId),
    eq(needsOffers.status, 'active'),
  ];
  if (type) conditions.push(eq(needsOffers.type, type));

  return db
    .select()
    .from(needsOffers)
    .where(and(...conditions))
    .orderBy(needsOffers.createdAt);
}

export async function getNeedOfferById(id: string): Promise<NeedOffer | null> {
  const rows = await db.select().from(needsOffers).where(eq(needsOffers.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function listExchangeRequestsForItem(needOfferId: string): Promise<ExchangeRequest[]> {
  return db
    .select()
    .from(exchangeRequests)
    .where(eq(exchangeRequests.needOfferId, needOfferId))
    .orderBy(exchangeRequests.createdAt);
}

export type RequestExchangeInput = {
  readonly needOfferId: string;
  readonly requesterMemberId: string;
  readonly mode: 'gift' | 'time_credit';
  readonly creditAmount?: string;
  readonly notes?: string;
};

export async function requestExchange(
  input: RequestExchangeInput,
): Promise<Result<{ requestId: string }, AppError>> {
  if (input.mode === 'time_credit' && !input.creditAmount) {
    return err(
      errors.validation([{ path: 'creditAmount', message: 'Credit amount required for time-credit exchanges.' }]),
    );
  }
  if (input.mode === 'gift' && input.creditAmount) {
    return err(
      errors.validation([{ path: 'creditAmount', message: 'Credit amount must be empty for gift exchanges.' }]),
    );
  }

  const needOffer = await db
    .select()
    .from(needsOffers)
    .where(eq(needsOffers.id, input.needOfferId))
    .limit(1);
  if (!needOffer[0]) return err(errors.notFound('need_offer'));
  if (needOffer[0].status !== 'active') {
    return err(errors.conflict('need_offer', 'This need/offer is no longer active.'));
  }

  const id = ulid();
  await db.insert(exchangeRequests).values({
    id,
    needOfferId: input.needOfferId,
    requesterMemberId: input.requesterMemberId,
    mode: input.mode,
    creditAmount: input.creditAmount ?? null,
    status: 'pending',
    notes: input.notes ?? null,
  });

  return ok({ requestId: id });
}

export async function completeExchange(args: {
  readonly requestId: string;
  readonly recordedByMemberId: string;
}): Promise<Result<void, AppError>> {
  const rows = await db
    .select()
    .from(exchangeRequests)
    .where(eq(exchangeRequests.id, args.requestId))
    .limit(1);
  const req = rows[0];
  if (!req) return err(errors.notFound('exchange_request'));
  if (req.status !== 'accepted') {
    return err(errors.conflict('exchange_request', 'Exchange must be accepted before completing.'));
  }

  const needOfferRows = await db
    .select()
    .from(needsOffers)
    .where(eq(needsOffers.id, req.needOfferId))
    .limit(1);
  const needOffer = needOfferRows[0];
  if (!needOffer) return err(errors.notFound('need_offer'));

  return transaction(async (tx) => {
    await tx.query(
      `UPDATE exchange_requests SET status = 'completed', completed_at = now(), updated_at = now() WHERE id = $1`,
      [args.requestId],
    );
    await tx.query(
      `UPDATE needs_offers SET status = 'fulfilled', updated_at = now() WHERE id = $1`,
      [req.needOfferId],
    );

    // Credit ledger entries only for time-credit exchanges.
    if (req.mode === 'time_credit' && req.creditAmount && needOffer.postedByMemberId) {
      await recordCreditEarned(tx, {
        neighborhoodId: needOffer.neighborhoodId,
        memberId: req.requesterMemberId,
        amountText: req.creditAmount,
        exchangeRequestId: req.id,
        recordedByMemberId: args.recordedByMemberId,
        memo: `Exchange fulfilled: ${needOffer.title}`,
      });
      await recordCreditSpent(tx, {
        neighborhoodId: needOffer.neighborhoodId,
        memberId: needOffer.postedByMemberId,
        amountText: req.creditAmount,
        exchangeRequestId: req.id,
        recordedByMemberId: args.recordedByMemberId,
        memo: `Exchange received: ${needOffer.title}`,
      });
    }

    return ok(undefined);
  });
}
