'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getSpaceByIdForMember, inviteMember } from '@/server/spaces';

const InputSchema = z.object({
  spaceId: z.string().length(26),
  email: z.string().email().trim().toLowerCase(),
});

export async function inviteMemberAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) {
    redirect('/login');
  }

  const parsed = InputSchema.safeParse({
    spaceId: formData.get('spaceId'),
    email: formData.get('email'),
  });
  if (!parsed.success) {
    redirect(`/spaces?error=invalid`);
  }

  const space = await getSpaceByIdForMember(parsed.data.spaceId, session.value.memberId);
  if (!space) {
    redirect('/spaces?error=not_found');
  }

  const hdrs = await headers();
  const host = hdrs.get('host') ?? 'localhost:3000';
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const baseUrl = `${proto}://${host}`;

  const result = await inviteMember({
    spaceId: parsed.data.spaceId,
    inviterMemberId: session.value.memberId,
    email: parsed.data.email,
    baseUrl,
  });

  const back = `/spaces/${space.space.slug}/invite`;
  if (!result.ok) {
    const kind =
      result.error.kind === 'Conflict'
        ? 'conflict'
        : result.error.kind === 'NotAuthorized'
          ? 'not_authorized'
          : 'invalid';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`${back}?sent=${encodeURIComponent(parsed.data.email)}`);
}
