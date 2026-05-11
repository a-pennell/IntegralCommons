'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { spaces } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { initiateReferendum } from '@/server/referenda';

const InputSchema = z.object({
  spaceId: z.string().length(26),
  delegationId: z.string().length(26),
});

export async function initiateReferendumAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = InputSchema.safeParse({
    spaceId: formData.get('spaceId'),
    delegationId: formData.get('delegationId'),
  });
  if (!parsed.success) redirect('/spaces');

  const space = await db
    .select({ slug: spaces.slug })
    .from(spaces)
    .where(eq(spaces.id, parsed.data.spaceId))
    .limit(1);
  if (!space[0]) redirect('/spaces');

  const result = await initiateReferendum({
    spaceId: parsed.data.spaceId,
    initiatorMemberId: session.value.memberId,
    target: { type: 'delegation', delegationId: parsed.data.delegationId },
  });

  const back = `/spaces/${space[0].slug}/referenda/new`;
  if (!result.ok) {
    const e = result.error;
    const kind =
      e.kind === 'RateLimited'
        ? 'rate_limited'
        : e.kind === 'ConstitutionalViolation' && e.cr === 'CR-008'
          ? 'stability'
          : e.kind === 'Conflict'
            ? 'conflict'
            : e.kind === 'ValidationError'
              ? 'validation'
              : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`/spaces/${space[0].slug}/referenda/${result.value.referendumId}`);
}
