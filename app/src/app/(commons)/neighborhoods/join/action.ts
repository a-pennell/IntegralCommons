'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlug, joinNeighborhood } from '@/server/neighborhoods';

const Schema = z.object({
  neighborhoodId: z.string().min(1),
  neighborhoodSlug: z.string().min(1),
});

export async function joinNeighborhoodAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/neighborhoods');

  const parsed = Schema.safeParse({
    neighborhoodId: formData.get('neighborhoodId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
  });
  if (!parsed.success) redirect('/neighborhoods');

  const { neighborhoodId, neighborhoodSlug } = parsed.data;

  const neighborhood = await getNeighborhoodBySlug(neighborhoodSlug);
  if (!neighborhood || neighborhood.id !== neighborhoodId) redirect('/neighborhoods');

  await joinNeighborhood({ neighborhoodId, memberId: session.value.memberId });

  redirect(`/neighborhoods/${neighborhoodSlug}`);
}
