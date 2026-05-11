'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlug, joinNeighborhood } from '@/server/neighborhoods';

const Schema = z.object({
  neighborhoodSlug: z.string().min(1).max(80),
  isAnonymous: z.enum(['true', 'false']).transform((v) => v === 'true'),
});

export async function joinNeighborhoodAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/neighborhoods');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    isAnonymous: formData.get('isAnonymous') ?? 'false',
  });
  if (!parsed.success) redirect('/neighborhoods');

  const { neighborhoodSlug, isAnonymous } = parsed.data;

  const neighborhood = await getNeighborhoodBySlug(neighborhoodSlug);
  if (!neighborhood) redirect('/neighborhoods');

  const result = await joinNeighborhood({
    neighborhoodId: neighborhood.id,
    memberId: session.value.memberId,
    ...(isAnonymous ? { isAnonymous: true } : {}),
  });

  if (!result.ok) {
    // Already a member — just land them in the neighborhood.
    redirect(`/neighborhoods/${neighborhoodSlug}`);
  }

  if (isAnonymous) {
    redirect(`/neighborhoods/${neighborhoodSlug}?joined=anonymous`);
  }
  redirect(`/neighborhoods/${neighborhoodSlug}?joined=true`);
}
