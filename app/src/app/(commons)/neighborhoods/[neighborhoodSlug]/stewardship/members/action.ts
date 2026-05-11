'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember, setMembershipRole } from '@/server/neighborhoods';

const Schema = z.object({
  neighborhoodSlug: z.string().min(1),
  membershipId: z.string().min(1),
  role: z.enum(['member', 'steward']),
});

export async function updateRoleAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    neighborhoodSlug: formData.get('neighborhoodSlug'),
    membershipId: formData.get('membershipId'),
    role: formData.get('role'),
  });
  if (!parsed.success) redirect('/');

  const { neighborhoodSlug, membershipId, role } = parsed.data;
  const back = `/neighborhoods/${neighborhoodSlug}/stewardship/members`;

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect(back);
  if (result.membership.role !== 'steward') redirect(`/neighborhoods/${neighborhoodSlug}/stewardship`);

  await setMembershipRole(membershipId, role);

  redirect(back);
}
