'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { transitionIssueStatus } from '@/server/issues';
import {
  findActiveDelegations,
  grantDelegation,
  memberHoldsCapability,
} from '@/server/delegations';

const TransitionInputSchema = z.object({
  issueId: z.string().length(26),
  spaceId: z.string().length(26),
  toStatus: z.enum(['open', 'exploring']),
  spaceSlug: z.string().min(1),
  issueSlug: z.string().min(1),
});

export async function transitionStatusAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = TransitionInputSchema.safeParse({
    issueId: formData.get('issueId'),
    spaceId: formData.get('spaceId'),
    toStatus: formData.get('toStatus'),
    spaceSlug: formData.get('spaceSlug'),
    issueSlug: formData.get('issueSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  const { issueId, spaceId, toStatus, spaceSlug, issueSlug } = parsed.data;
  const back = `/spaces/${spaceSlug}/issues/${issueSlug}`;

  const hasFacilitation = await memberHoldsCapability({
    spaceId,
    issueId,
    memberId: session.value.memberId,
    capability: 'facilitation',
  });
  if (!hasFacilitation) redirect(`${back}?error=not_facilitator`);

  const result = await transitionIssueStatus({
    issueId,
    toStatus,
    actorMemberId: session.value.memberId,
  });

  if (!result.ok) {
    const kind = result.error.kind === 'Conflict' ? 'conflict' : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(back);
}

const VolunteerInputSchema = z.object({
  issueId: z.string().length(26),
  spaceId: z.string().length(26),
  spaceSlug: z.string().min(1),
  issueSlug: z.string().min(1),
});

/**
 * Any active member may volunteer to facilitate an issue that has no
 * existing facilitator. Phase 1 shortcut: uses `group_consent` without a
 * backing DR. In Phase 2 this path is gated behind a lightweight consent
 * process on the issue itself.
 */
export async function volunteerFacilitatorAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = VolunteerInputSchema.safeParse({
    issueId: formData.get('issueId'),
    spaceId: formData.get('spaceId'),
    spaceSlug: formData.get('spaceSlug'),
    issueSlug: formData.get('issueSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  const { issueId, spaceId, spaceSlug, issueSlug } = parsed.data;
  const back = `/spaces/${spaceSlug}/issues/${issueSlug}`;

  // Only allow if no one holds facilitation for this issue yet.
  const existing = await findActiveDelegations({
    spaceId,
    issueId,
    capability: 'facilitation',
  });
  if (existing.length > 0) redirect(back);

  const result = await grantDelegation({
    spaceId,
    issueId,
    granteeMemberId: session.value.memberId,
    granterMemberId: session.value.memberId,
    capability: 'facilitation',
    grantedByType: 'group_consent',
  });

  if (!result.ok) redirect(`${back}?error=grant_failed`);
  redirect(back);
}
