'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { draftCharterSection } from '@/server/commons-charter';

const Schema = z.object({
  neighborhoodSlug: z.string().min(1),
  sectionKey: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9_]+$/, 'Only lowercase letters, digits, and underscores'),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(5000),
});

export async function draftSectionAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    sectionKey: formData.get('sectionKey'),
    title: formData.get('title'),
    body: formData.get('body'),
  });
  if (!parsed.success) redirect('?error=invalid');

  const { neighborhoodSlug, sectionKey, title, body } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/charter`;

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect(back);
  if (result.membership.role !== 'steward') redirect(`${back}?error=not_steward`);

  const outcome = await draftCharterSection({
    neighborhoodId: result.neighborhood.id,
    sectionKey,
    title,
    body,
    draftedByMemberId: session.value.memberId,
  });

  if (!outcome.ok) redirect(`${back}/new?error=failed`);

  redirect(back);
}
