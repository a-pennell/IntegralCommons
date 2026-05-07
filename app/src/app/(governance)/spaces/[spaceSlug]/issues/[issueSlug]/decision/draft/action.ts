'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { issues, spaces } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { draftDecisionRecord, finalizeDecisionRecord } from '@/server/decisions';

const DraftInputSchema = z.object({
  issueId: z.string().length(26),
  whatText: z.string().min(10).max(20_000),
  rationaleText: z.string().min(10).max(20_000),
  unresolvedObjectionsText: z.string().max(20_000).default(''),
  reviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function draftDecisionRecordAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = DraftInputSchema.safeParse({
    issueId: formData.get('issueId'),
    whatText: formData.get('whatText'),
    rationaleText: formData.get('rationaleText'),
    unresolvedObjectionsText: formData.get('unresolvedObjectionsText') ?? '',
    reviewDate: formData.get('reviewDate'),
  });
  if (!parsed.success) redirect('/spaces');

  const ctxRows = await db
    .select({ issueSlug: issues.slug, spaceSlug: spaces.slug })
    .from(issues)
    .innerJoin(spaces, eq(spaces.id, issues.spaceId))
    .where(eq(issues.id, parsed.data.issueId))
    .limit(1);
  const ctx = ctxRows[0];
  if (!ctx) redirect('/spaces');

  const result = await draftDecisionRecord({
    issueId: parsed.data.issueId,
    drafterMemberId: session.value.memberId,
    whatText: parsed.data.whatText,
    howMethod: 'consent',
    rationaleText: parsed.data.rationaleText,
    unresolvedObjectionsText: parsed.data.unresolvedObjectionsText,
    reviewDate: new Date(`${parsed.data.reviewDate}T00:00:00Z`),
  });

  const back = `/spaces/${ctx.spaceSlug}/issues/${ctx.issueSlug}/decision/draft`;
  if (!result.ok) {
    const kind =
      result.error.kind === 'NotAuthorized'
        ? 'not_facilitator'
        : result.error.kind === 'ValidationError'
          ? 'validation'
          : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`/spaces/${ctx.spaceSlug}/issues/${ctx.issueSlug}/decision`);
}

const FinalizeInputSchema = z.object({
  decisionRecordId: z.string().length(26),
  spaceSlug: z.string().min(1),
  issueSlug: z.string().min(1),
});

export async function finalizeAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = FinalizeInputSchema.safeParse({
    decisionRecordId: formData.get('decisionRecordId'),
    spaceSlug: formData.get('spaceSlug'),
    issueSlug: formData.get('issueSlug'),
  });
  if (!parsed.success) redirect('/spaces');

  const result = await finalizeDecisionRecord({
    decisionRecordId: parsed.data.decisionRecordId,
    finalizerMemberId: session.value.memberId,
  });

  const back = `/spaces/${parsed.data.spaceSlug}/issues/${parsed.data.issueSlug}/decision/draft`;
  if (!result.ok) {
    const e = result.error;
    const kind =
      e.kind === 'NotAuthorized'
        ? 'not_facilitator'
        : e.kind === 'ValidationError'
          ? 'validation'
          : e.kind === 'Conflict' && e.reason.includes('BLOCKED')
            ? 'blocked'
            : e.kind === 'Conflict' && e.reason.includes('finalized')
              ? 'already_finalized'
              : e.kind === 'ConstitutionalViolation' && e.cr === 'CR-011'
                ? 'awareness'
                : e.kind === 'NotFound'
                  ? 'not_found'
                  : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`/spaces/${parsed.data.spaceSlug}/issues/${parsed.data.issueSlug}/decision`);
}
