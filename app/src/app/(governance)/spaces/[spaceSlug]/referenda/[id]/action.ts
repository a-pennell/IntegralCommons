'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import {
  castVote,
  closeReferendum,
  startReferendumVoting,
  supportReferendum,
} from '@/server/referenda';

const RefInputSchema = z.object({
  referendumId: z.string().length(26),
  spaceSlug: z.string().min(1),
});

function backTo(spaceSlug: string, id: string) {
  return `/spaces/${spaceSlug}/referenda/${id}`;
}

export async function supportReferendumAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = RefInputSchema.safeParse({
    referendumId: formData.get('referendumId'),
    spaceSlug: formData.get('spaceSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  await supportReferendum({
    referendumId: parsed.data.referendumId,
    supporterMemberId: session.value.memberId,
  });
  redirect(backTo(parsed.data.spaceSlug, parsed.data.referendumId));
}

export async function startVotingAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = RefInputSchema.safeParse({
    referendumId: formData.get('referendumId'),
    spaceSlug: formData.get('spaceSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  await startReferendumVoting({
    referendumId: parsed.data.referendumId,
    actorMemberId: session.value.memberId,
  });
  redirect(backTo(parsed.data.spaceSlug, parsed.data.referendumId));
}

const VoteInputSchema = RefInputSchema.extend({
  choice: z.enum(['support', 'oppose', 'stand_aside']),
});

export async function castVoteAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = VoteInputSchema.safeParse({
    referendumId: formData.get('referendumId'),
    spaceSlug: formData.get('spaceSlug'),
    choice: formData.get('choice'),
  });
  if (!parsed.success) redirect('/spaces');

  await castVote({
    referendumId: parsed.data.referendumId,
    voterMemberId: session.value.memberId,
    choice: parsed.data.choice,
  });
  redirect(backTo(parsed.data.spaceSlug, parsed.data.referendumId));
}

export async function closeReferendumAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = RefInputSchema.safeParse({
    referendumId: formData.get('referendumId'),
    spaceSlug: formData.get('spaceSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  await closeReferendum({
    referendumId: parsed.data.referendumId,
    actorMemberId: session.value.memberId,
  });
  redirect(backTo(parsed.data.spaceSlug, parsed.data.referendumId));
}
