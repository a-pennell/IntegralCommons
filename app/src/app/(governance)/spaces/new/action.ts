'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { createSpace } from '@/server/spaces';

const InputSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(1000).trim().optional(),
});

export async function createSpaceAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) {
    redirect('/login?next=/spaces/new');
  }

  const parsed = InputSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  });
  if (!parsed.success) {
    redirect('/spaces/new?error=invalid_name');
  }

  const result = await createSpace({
    name: parsed.data.name,
    ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    founderMemberId: session.value.memberId,
  });

  if (!result.ok) {
    const qs = result.error.kind === 'Conflict' ? 'conflict' : 'invalid_name';
    redirect(`/spaces/new?error=${qs}`);
  }

  redirect(`/spaces/${result.value.slug}`);
}
