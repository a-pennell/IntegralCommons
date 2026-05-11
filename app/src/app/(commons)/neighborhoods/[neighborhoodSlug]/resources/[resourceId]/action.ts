'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getResourceById, updateResourceStatus } from '@/server/resources';

const Schema = z.object({
  resourceId: z.string().min(1),
  neighborhoodSlug: z.string().min(1),
  status: z.enum(['available', 'unavailable', 'removed']),
});

export async function updateResourceStatusAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    resourceId: formData.get('resourceId'),
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    status: formData.get('status'),
  });
  if (!parsed.success) redirect('/');

  const { resourceId, neighborhoodSlug, status } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/resources`;

  const resource = await getResourceById(resourceId);
  if (!resource) redirect(back);
  if (resource.offeredByMemberId !== session.value.memberId) redirect(`${back}/${resourceId}?error=not_yours`);

  await updateResourceStatus(resourceId, status);

  if (status === 'removed') redirect(back);
  redirect(`${back}/${resourceId}`);
}
