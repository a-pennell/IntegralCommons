'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/server/auth';
import { completeExchange } from '@/server/needs-offers';
import { db } from '@/db';
import { exchangeRequests, needsOffers } from '@/db/schema';

const BaseSchema = z.object({
  requestId: z.string().length(26),
  needOfferId: z.string().length(26),
  neighborhoodSlug: z.string().min(1),
});

async function verifyPoster(needOfferId: string, memberId: string, back: string): Promise<void> {
  const rows = await db
    .select({ postedByMemberId: needsOffers.postedByMemberId })
    .from(needsOffers)
    .where(eq(needsOffers.id, needOfferId))
    .limit(1);
  if (rows[0]?.postedByMemberId !== memberId) redirect(`${back}?error=not_yours`);
}

export async function acceptExchangeAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = BaseSchema.safeParse({
    requestId: formData.get('requestId'),
    needOfferId: formData.get('needOfferId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
  });
  if (!parsed.success) redirect('/');

  const { requestId, needOfferId, neighborhoodSlug } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers/${needOfferId}`;
  await verifyPoster(needOfferId, session.value.memberId, back);

  await db
    .update(exchangeRequests)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(exchangeRequests.id, requestId));

  redirect(back);
}

export async function declineExchangeAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = BaseSchema.safeParse({
    requestId: formData.get('requestId'),
    needOfferId: formData.get('needOfferId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
  });
  if (!parsed.success) redirect('/');

  const { requestId, needOfferId, neighborhoodSlug } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers/${needOfferId}`;
  await verifyPoster(needOfferId, session.value.memberId, back);

  await db
    .update(exchangeRequests)
    .set({ status: 'declined', updatedAt: new Date() })
    .where(eq(exchangeRequests.id, requestId));

  redirect(back);
}

export async function completeExchangeAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = BaseSchema.safeParse({
    requestId: formData.get('requestId'),
    needOfferId: formData.get('needOfferId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
  });
  if (!parsed.success) redirect('/');

  const { requestId, needOfferId, neighborhoodSlug } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers/${needOfferId}`;
  await verifyPoster(needOfferId, session.value.memberId, back);

  const outcome = await completeExchange({
    requestId,
    recordedByMemberId: session.value.memberId,
  });

  if (!outcome.ok) redirect(`${back}?error=complete_failed`);

  redirect(`/neighborhoods/${neighborhoodSlug}/needs-offers`);
}
