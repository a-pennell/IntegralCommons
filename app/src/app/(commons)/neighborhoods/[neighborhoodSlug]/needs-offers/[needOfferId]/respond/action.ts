'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { requestExchange } from '@/server/needs-offers';

const Schema = z.object({
  needOfferId: z.string().length(26),
  neighborhoodSlug: z.string().min(1),
  mode: z.enum(['gift', 'time_credit']),
  creditAmount: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export async function respondAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    needOfferId: formData.get('needOfferId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    mode: formData.get('mode'),
    creditAmount: formData.get('creditAmount') || undefined,
    notes: formData.get('notes') || undefined,
  });

  if (!parsed.success) redirect('?error=invalid');

  const { needOfferId, neighborhoodSlug, mode, creditAmount, notes } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers/${needOfferId}`;

  const outcome = await requestExchange({
    needOfferId,
    requesterMemberId: session.value.memberId,
    mode,
    ...(mode === 'time_credit' && creditAmount ? { creditAmount } : {}),
    ...(notes ? { notes } : {}),
  });

  if (!outcome.ok) redirect(`${back}?error=respond_failed`);

  redirect(`${back}?responded=1`);
}
