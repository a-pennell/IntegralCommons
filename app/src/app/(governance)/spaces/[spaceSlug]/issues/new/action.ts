'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { createIssue } from '@/server/issues';
import { getSpaceByIdForMember } from '@/server/spaces';
import {
  GovernanceProfileSchema,
  resolveGovernanceProfile,
  proposeGovernanceChange,
} from '@/server/governance-config';

const InputSchema = z.object({
  spaceId: z.string().length(26),
  title: z.string().min(1).max(200).trim(),
  scope: z.string().min(1).max(500).trim(),
  scopeTags: z.array(z.string().min(1).max(60)).optional(),
  hasEcologicalScope: z
    .enum(['on'])
    .optional()
    .transform((v) => v === 'on'),
});

export async function createIssueAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) {
    redirect('/login');
  }

  const rawScopeTags = formData.getAll('scopeTags').map((v) => String(v));

  const parsed = InputSchema.safeParse({
    spaceId: formData.get('spaceId'),
    title: formData.get('title'),
    scope: formData.get('scope'),
    scopeTags: rawScopeTags,
    hasEcologicalScope: formData.get('hasEcologicalScope') || undefined,
  });
  if (!parsed.success) {
    redirect('/spaces?error=invalid');
  }

  const space = await getSpaceByIdForMember(parsed.data.spaceId, session.value.memberId);
  if (!space) redirect('/spaces?error=not_found');

  const result = await createIssue({
    spaceId: parsed.data.spaceId,
    creatorMemberId: session.value.memberId,
    title: parsed.data.title,
    scope: parsed.data.scope,
    ...(parsed.data.scopeTags !== undefined && { scopeTags: parsed.data.scopeTags }),
    ...(parsed.data.hasEcologicalScope ? { hasEcologicalScope: true } : {}),
  });

  const back = `/spaces/${space.space.slug}/issues/new`;
  if (!result.ok) {
    const kind =
      result.error.kind === 'RateLimited'
        ? 'rate_limited'
        : result.error.kind === 'ConstitutionalViolation' && result.error.cr === 'CR-004'
          ? 'bootstrap_required'
          : result.error.kind === 'ConstitutionalViolation' && result.error.cr === 'CR-007'
            ? 'invalid_tag'
            : result.error.kind === 'ValidationError'
              ? 'validation'
              : 'error';
    redirect(`${back}?error=${kind}`);
  }

  redirect(`/spaces/${space.space.slug}/issues/${result.value.slug}`);
}

export async function createGovernanceIssueAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const spaceId = String(formData.get('spaceId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const scope = String(formData.get('scope') ?? '').trim();
  const rawScopeTags = formData.getAll('scopeTags').map((v) => String(v));

  const space = await getSpaceByIdForMember(spaceId, session.value.memberId);
  if (!space) redirect('/spaces?error=not_found');

  const back = `/spaces/${space.space.slug}/issues/new?type=governance`;

  // Parse individual profile fields from the structured form.
  const getNum = (key: string): number => {
    const v = formData.get(key);
    return v !== null ? Number(v) : NaN;
  };
  const getVocab = (key: string): string[] => {
    const raw = formData.get(key);
    if (!raw || typeof raw !== 'string') return [];
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const profileResult = GovernanceProfileSchema.safeParse({
    version: 1,
    decisionMethodDefault: 'consent',
    deliberation: {
      standardIssueHours: getNum('deliberation_standardIssueHours'),
      tier2AmendmentDays: getNum('deliberation_tier2AmendmentDays'),
      tier1AmendmentDays: getNum('deliberation_tier1AmendmentDays'),
      decisionMethodChangeDays: getNum('deliberation_decisionMethodChangeDays'),
    },
    quorum: {
      awarenessPct: getNum('quorum_awarenessPct') / 100,
      participationPct: getNum('quorum_participationPct') / 100,
      deliberationHours: getNum('quorum_deliberationHours'),
      extensionMultiplier: getNum('quorum_extensionMultiplier'),
    },
    rateLimits: {
      createIssuePerDay: getNum('rateLimits_createIssuePerDay'),
      initiateReferendumPerRollingWeek: getNum('rateLimits_initiateReferendumPerRollingWeek'),
    },
    stability: {
      standardIssueDays: getNum('stability_standardIssueDays'),
      policyChangeDays: getNum('stability_policyChangeDays'),
      constitutionalAmendmentDays: getNum('stability_constitutionalAmendmentDays'),
      delegationGrantDays: getNum('stability_delegationGrantDays'),
    },
    referendumThreshold: {
      minimumSupporters: getNum('referendumThreshold_minimumSupporters'),
      minimumSupportersPct: getNum('referendumThreshold_minimumSupportersPct') / 100,
    },
    taxonomyVocabulary: getVocab('taxonomyVocabulary'),
    scopeTagVocabulary: getVocab('scopeTagVocabulary'),
  });

  if (!profileResult.success) {
    redirect(`${back}&error=invalid_profile`);
  }

  const current = resolveGovernanceProfile(space.space.governanceProfile);
  const sections = proposeGovernanceChange({ current, proposed: profileResult.data });

  const result = await createIssue({
    spaceId,
    creatorMemberId: session.value.memberId,
    title: title || 'Governance change proposal',
    scope: scope || "Propose a change to this Space's governance profile.",
    scopeTags: rawScopeTags,
    structuredSections: sections,
  });

  if (!result.ok) {
    redirect(`${back}&error=error`);
  }

  redirect(`/spaces/${space.space.slug}/issues/${result.value.slug}`);
}
