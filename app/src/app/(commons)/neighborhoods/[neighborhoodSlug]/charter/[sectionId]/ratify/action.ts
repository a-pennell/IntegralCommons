'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { ratifyCharterSection } from '@/server/commons-charter';

const Schema = z.object({
  neighborhoodSlug: z.string().min(1),
  sectionId: z.string().min(1),
});

export async function ratifySectionAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    sectionId: formData.get('sectionId'),
  });
  if (!parsed.success) redirect('/');

  const { neighborhoodSlug, sectionId } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/charter`;

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect(back);
  if (result.membership.role !== 'steward') redirect(`${back}?error=not_steward`);

  await ratifyCharterSection({
    sectionId,
    ratifiedByMemberId: session.value.memberId,
  });

  redirect(back);
}
