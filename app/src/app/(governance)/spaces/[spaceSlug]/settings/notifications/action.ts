'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { spaces } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { setDigestCadence } from '@/server/spaces';

const InputSchema = z.object({
  spaceSlug: z.string().min(1),
  cadence: z.enum(['daily', 'weekly', 'monthly', 'off']),
});

export async function setCadenceAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = InputSchema.safeParse({
    spaceSlug: formData.get('spaceSlug'),
    cadence: formData.get('cadence'),
  });
  if (!parsed.success) redirect('/spaces');

  const spaceRow = await db
    .select({ id: spaces.id })
    .from(spaces)
    .where(eq(spaces.slug, parsed.data.spaceSlug))
    .limit(1);
  if (!spaceRow[0]) redirect('/spaces');

  const back = `/spaces/${parsed.data.spaceSlug}/settings/notifications`;
  const result = await setDigestCadence({
    memberId: session.value.memberId,
    spaceId: spaceRow[0].id,
    cadence: parsed.data.cadence,
  });
  if (!result.ok) {
    const kind =
      result.error.kind === 'ValidationError'
        ? 'too_frequent'
        : result.error.kind === 'NotFound'
          ? 'not_found'
          : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`${back}?saved=${parsed.data.cadence}`);
}
