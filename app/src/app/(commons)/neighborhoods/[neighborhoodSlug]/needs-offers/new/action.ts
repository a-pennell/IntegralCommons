'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { createNeedOffer } from '@/server/needs-offers';

const Schema = z.object({
  neighborhoodSlug: z.string().min(1),
  type: z.enum(['need', 'offer']),
  title: z.string().min(1).max(200),
  body: z.string().max(2000).optional(),
  isUrgent: z.enum(['on']).optional(),
  expiresAt: z.string().optional(),
});

export async function postNeedOfferAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    type: formData.get('type'),
    title: formData.get('title'),
    body: formData.get('body') || undefined,
    isUrgent: formData.get('isUrgent') || undefined,
    expiresAt: formData.get('expiresAt') || undefined,
  });

  if (!parsed.success) {
    redirect('?error=invalid');
  }

  const { neighborhoodSlug, type, title, body, isUrgent, expiresAt } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers`;

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect(back);

  const outcome = await createNeedOffer({
    neighborhoodId: result.neighborhood.id,
    postedByMemberId: session.value.memberId,
    type,
    title,
    ...(body ? { body } : {}),
    isUrgent: isUrgent === 'on',
    ...(expiresAt ? { expiresAt: new Date(expiresAt) } : {}),
  });

  if (!outcome.ok) redirect(`${back}/new?error=failed`);

  redirect(`${back}?tab=${type === 'need' ? 'needs' : 'offers'}`);
}
