'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { createResource } from '@/server/resources';

const Schema = z.object({
  neighborhoodSlug: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  kind: z.enum(['tool', 'space', 'skill', 'material', 'other']),
  locationHint: z.string().max(200).optional(),
  tags: z.string().optional(),
});

export async function addResourceAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    kind: formData.get('kind'),
    locationHint: formData.get('locationHint') || undefined,
    tags: formData.get('tags') || undefined,
  });

  if (!parsed.success) redirect('?error=invalid');

  const { neighborhoodSlug, title, description, kind, locationHint, tags } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/resources`;

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect(back);

  const tagList = tags
    ? tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const outcome = await createResource({
    neighborhoodId: result.neighborhood.id,
    offeredByMemberId: session.value.memberId,
    title,
    ...(description ? { description } : {}),
    kind,
    ...(locationHint ? { locationHint } : {}),
    tags: tagList,
  });

  if (!outcome.ok) redirect(`${back}/new?error=failed`);

  redirect(back);
}
