'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { issues, spaces } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { submitPerspective } from '@/server/perspectives';

const InputSchema = z.object({
  issueId: z.string().length(26),
  taxonomyType: z.string().min(1).max(60).trim().toLowerCase(),
  bodyMarkdown: z.string().min(1).max(10_000),
  fromDirectExperience: z.boolean(),
  parentPerspectiveId: z.string().length(26).optional(),
});

export async function submitPerspectiveAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = InputSchema.safeParse({
    issueId: formData.get('issueId'),
    taxonomyType: formData.get('taxonomyType'),
    bodyMarkdown: formData.get('bodyMarkdown'),
    fromDirectExperience: formData.get('fromDirectExperience') === 'on',
    parentPerspectiveId: formData.get('parentPerspectiveId') || undefined,
  });
  if (!parsed.success) redirect('/spaces?error=invalid');

  // Resolve Issue + Space slug for the redirect target.
  const ctxRows = await db
    .select({ issueSlug: issues.slug, spaceSlug: spaces.slug })
    .from(issues)
    .innerJoin(spaces, eq(spaces.id, issues.spaceId))
    .where(eq(issues.id, parsed.data.issueId))
    .limit(1);
  const ctx = ctxRows[0];
  if (!ctx) redirect('/spaces?error=not_found');

  const result = await submitPerspective({
    issueId: parsed.data.issueId,
    authorMemberId: session.value.memberId,
    bodyMarkdown: parsed.data.bodyMarkdown,
    taxonomyType: parsed.data.taxonomyType,
    fromDirectExperience: parsed.data.fromDirectExperience,
    ...(parsed.data.parentPerspectiveId !== undefined && {
      parentPerspectiveId: parsed.data.parentPerspectiveId,
    }),
  });

  const backBase = `/spaces/${ctx.spaceSlug}/issues/${ctx.issueSlug}`;
  const replyQs = parsed.data.parentPerspectiveId
    ? `?replyTo=${parsed.data.parentPerspectiveId}`
    : '';

  if (!result.ok) {
    let kind = 'error';
    if (result.error.kind === 'ValidationError') {
      const nestingIssue = result.error.issues.some((i) => i.path === 'parentPerspectiveId');
      kind = nestingIssue ? 'nesting' : 'validation';
    } else if (result.error.kind === 'Conflict') {
      kind = 'archived';
    }
    redirect(`${backBase}/perspectives/new${replyQs}${replyQs ? '&' : '?'}error=${kind}`);
  }

  redirect(`${backBase}#perspectives`);
}
