'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { registerProducer } from '@/server/synapse';

const Schema = z.object({
  orgName: z.string().min(1).max(120),
  locationDescription: z.string().min(1).max(300),
  bio: z.string().max(1000).optional(),
});

export async function registerProducerAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    orgName: formData.get('orgName'),
    locationDescription: formData.get('locationDescription'),
    bio: formData.get('bio') || undefined,
  });
  if (!parsed.success) redirect('?error=invalid');

  const { orgName, locationDescription, bio } = parsed.data;

  const result = await registerProducer({
    managedByMemberId: session.value.memberId,
    orgName,
    locationDescription,
    ...(bio ? { bio } : {}),
  });

  if (!result.ok) redirect('?error=failed');
  redirect(`/synapse/producers/${result.value.producerId}`);
}
