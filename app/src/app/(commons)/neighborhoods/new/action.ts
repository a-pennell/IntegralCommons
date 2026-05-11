'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { createNeighborhood } from '@/server/neighborhoods';
import { seedTemplateCharter } from '@/server/commons-charter';

const Schema = z.object({
  name: z.string().min(1).max(200).trim(),
  slug: z
    .string()
    .min(1)
    .max(80)
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(300).trim().optional(),
  boundaryDescription: z.string().max(1000).trim().optional(),
});

export async function createNeighborhoodAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') || undefined,
    boundaryDescription: formData.get('boundaryDescription') || undefined,
  });
  if (!parsed.success) redirect('/neighborhoods/new?error=validation');

  const result = await createNeighborhood({
    createdByMemberId: session.value.memberId,
    name: parsed.data.name,
    slug: parsed.data.slug,
    ...(parsed.data.description ? { description: parsed.data.description } : {}),
    ...(parsed.data.boundaryDescription
      ? { boundaryDescription: parsed.data.boundaryDescription }
      : {}),
  });

  if (!result.ok) {
    const kind = result.error.kind === 'Conflict' ? 'conflict' : 'error';
    redirect(`/neighborhoods/new?error=${kind}`);
  }

  // Seed template charter sections for the new neighborhood.
  await seedTemplateCharter(result.value.neighborhoodId);

  redirect(`/neighborhoods/${result.value.slug}?onboarding=true`);
}
