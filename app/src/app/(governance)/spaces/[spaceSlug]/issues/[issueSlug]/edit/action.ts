'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { updateIssue } from '@/server/issues';
import { memberHoldsCapability } from '@/server/delegations';

const UpdateInputSchema = z.object({
  issueId: z.string().length(26),
  spaceId: z.string().length(26),
  spaceSlug: z.string().min(1),
  issueSlug: z.string().min(1),
  title: z.string().min(1).max(200).trim().optional(),
  scope: z.string().min(1).max(500).trim().optional(),
});

export async function updateIssueAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = UpdateInputSchema.safeParse({
    issueId: formData.get('issueId'),
    spaceId: formData.get('spaceId'),
    spaceSlug: formData.get('spaceSlug'),
    issueSlug: formData.get('issueSlug'),
    title: formData.get('title') || undefined,
    scope: formData.get('scope') || undefined,
  });
  if (!parsed.success) redirect('/spaces');

  const { issueId, spaceId, spaceSlug, issueSlug, title, scope } = parsed.data;
  const back = `/spaces/${spaceSlug}/issues/${issueSlug}/edit`;

  const hasFacilitation = await memberHoldsCapability({
    spaceId,
    issueId,
    memberId: session.value.memberId,
    capability: 'facilitation',
  });
  if (!hasFacilitation) redirect(`${back}?error=not_facilitator`);

  const result = await updateIssue({
    issueId,
    editorMemberId: session.value.memberId,
    ...(title !== undefined && { title }),
    ...(scope !== undefined && { scope }),
  });

  if (!result.ok) {
    const kind = result.error.kind === 'ValidationError' ? 'validation' : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`/spaces/${spaceSlug}/issues/${issueSlug}`);
}
