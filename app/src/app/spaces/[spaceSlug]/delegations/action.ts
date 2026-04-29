'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { revokeDelegation } from '@/server/delegations';

const InputSchema = z.object({
  delegationId: z.string().length(26),
  spaceSlug: z.string().min(1),
});

export async function revokeDelegationAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = InputSchema.safeParse({
    delegationId: formData.get('delegationId'),
    spaceSlug: formData.get('spaceSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  await revokeDelegation({
    delegationId: parsed.data.delegationId,
    actorMemberId: session.value.memberId,
  });

  redirect(`/spaces/${parsed.data.spaceSlug}/delegations`);
}
