'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { writeStdEntry } from '@/server/stewardship';

const ENTRY_TYPES = [
  'action_taken',
  'member_care',
  'resource_noted',
  'charter_note',
  'handover',
  'ecological_note',
] as const;

const Schema = z.object({
  neighborhoodSlug: z.string().min(1),
  entryType: z.enum(ENTRY_TYPES),
  notes: z.string().max(2000).optional(),
});

export async function writeEntryAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    entryType: formData.get('entryType'),
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) redirect('?error=invalid');

  const { neighborhoodSlug, entryType, notes } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/stewardship`;

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect(back);
  if (result.membership.role !== 'steward') redirect(`${back}?error=not_steward`);

  const outcome = await writeStdEntry({
    neighborhoodId: result.neighborhood.id,
    actorMemberId: session.value.memberId,
    entryType,
    ...(notes ? { notes } : {}),
  });

  if (!outcome.ok) redirect(`${back}/new?error=failed`);

  redirect(back);
}
