'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { requireSession } from '@/server/auth';
import { db } from '@/db';
import { needsOffers } from '@/db/schema';

const Schema = z.object({
  needOfferId: z.string().length(26),
  neighborhoodSlug: z.string().min(1),
});

export async function withdrawAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    needOfferId: formData.get('needOfferId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
  });
  if (!parsed.success) redirect('/');

  const { needOfferId, neighborhoodSlug } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers`;

  const rows = await db
    .select({ postedByMemberId: needsOffers.postedByMemberId, status: needsOffers.status })
    .from(needsOffers)
    .where(eq(needsOffers.id, needOfferId))
    .limit(1);

  const item = rows[0];
  if (!item) redirect(back);
  if (item.postedByMemberId !== session.value.memberId) redirect(`${back}/${needOfferId}?error=not_yours`);
  if (item.status !== 'active') redirect(`${back}/${needOfferId}`);

  await db
    .update(needsOffers)
    .set({ status: 'withdrawn', updatedAt: new Date() })
    .where(eq(needsOffers.id, needOfferId));

  redirect(back);
}
