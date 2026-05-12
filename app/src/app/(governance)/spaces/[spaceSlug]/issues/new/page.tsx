import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { resolveGovernanceProfile, type GovernanceProfile } from '@/server/governance-config';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
import { createIssueAction, createGovernanceIssueAction } from './action';

type RouteParams = { spaceSlug: string };
type SearchParams = { error?: string; type?: string };

export default async function NewIssuePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/issues/new`)}`);
  }

  const found = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!found) notFound();
  const { space } = found;
  const profile = resolveGovernanceProfile(space.governanceProfile);
  const { error, type } = await searchParams;
  const isGovernance = type === 'governance';
  const preBootstrap = space.bootstrapCompletedAt === null;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">{isGovernance ? 'Governance change · New' : 'Issue · New'}</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          {isGovernance ? 'Open a governance change' : 'Open an issue'}
        </h1>
      </header>

      {preBootstrap ? (
        <div className="mb-6">
          <Note tone="info">
            Bootstrap is incomplete. Until the Bootstrap Decision Record is finalized, only the
            Bootstrap Issue can be opened.
          </Note>
        </div>
      ) : null}

      {isGovernance ? (
        <div className="mb-6">
          <Note tone="info">
            <strong className="font-medium not-italic">Governance change.</strong> When a Decision
            Record on this Issue is finalized, the proposed governance profile will be applied to
            this Space.
          </Note>
        </div>
      ) : null}

      {error ? (
        <div className="mb-6">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form
        action={isGovernance ? createGovernanceIssueAction : createIssueAction}
        className="space-y-10"
      >
        <input type="hidden" name="spaceId" value={space.id} />

        <Field
          id="title"
          name="title"
          label="Title"
          type="text"
          required
          minLength={1}
          maxLength={200}
        />

        <Textarea
          id="scope"
          name="scope"
          label="Scope"
          required
          minLength={1}
          maxLength={500}
          rows={3}
          hint="What this Issue is about, and what it isn't."
        />

        {isGovernance ? <GovernanceProfileFields profile={profile} /> : null}

        {profile.scopeTagVocabulary.length > 0 ? (
          <fieldset>
            <legend className="eyebrow mb-2">Scope tags</legend>
            <p className="mb-4 max-w-prose text-(length:--text-caption) leading-(--text-caption--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
              Members tagged with any of these will be auto-included if this Issue becomes a
              referendum.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {profile.scopeTagVocabulary.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-ink)]"
                >
                  <input
                    type="checkbox"
                    name="scopeTags"
                    value={tag}
                    className="h-4 w-4 accent-[color:var(--color-accent)]"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {!isGovernance ? (
          <div>
            <label className="flex items-start gap-3 text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-ink)]">
              <input
                type="checkbox"
                name="hasEcologicalScope"
                className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
              />
              <span>
                <span className="font-medium">This issue has ecological scope</span>
                <span className="mt-0.5 block text-(length:--text-caption) text-[color:var(--color-muted)]">
                  Marks the issue as touching land use, water, species habitat, or other ecological
                  concerns — enabling EIL data attachment when the integration is live.
                </span>
              </span>
            </label>
          </div>
        ) : null}

        <div className="pt-2">
          <Button type="submit">{isGovernance ? 'Open governance Issue' : 'Open Issue'}</Button>
        </div>
      </form>

      {!isGovernance ? (
        <p className="mt-12 text-(length:--text-caption) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          Want to change how this Space governs itself?{' '}
          <a
            href="?type=governance"
            className="not-italic underline underline-offset-4 hover:text-[color:var(--color-accent)]"
          >
            Open a governance change Issue
          </a>
          .
        </p>
      ) : null}

      <footer className="mt-16 border-t border-[color:var(--color-rule)] pt-6">
        <p className="text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          The first event written to this Issue&rsquo;s Civic Memory is{' '}
          <code className="metadata not-italic">issue_created</code>. The timeline is append-only —
          the record never disappears, even if the Issue is later archived.
        </p>
      </footer>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'rate_limited':
      return 'You have reached the daily limit for opening issues. Try again tomorrow.';
    case 'bootstrap_required':
      return 'This Space is still in Bootstrap — only the Bootstrap Issue can be opened right now.';
    case 'invalid_tag':
      return "One or more scope tags do not match this Space's configured vocabulary.";
    case 'validation':
      return 'One of the fields was invalid. Please check and try again.';
    case 'invalid_profile':
      return 'One or more governance profile values are outside the allowed range. Check the constitutional floors and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// ─── Governance profile form ──────────────────────────────────────────────

function GovernanceProfileFields({ profile }: { profile: GovernanceProfile }) {
  return (
    <div className="space-y-10">
      <fieldset className="space-y-5">
        <legend className="eyebrow mb-1 text-[color:var(--color-ink)]">Deliberation floors</legend>
        <p className="text-(length:--text-caption) text-[color:var(--color-muted)] italic">
          Only tightening (increasing) these values is permitted. Constitutional minimums are noted.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileNumField
            name="deliberation_standardIssueHours"
            label="Standard issue period (hours)"
            min={48}
            defaultValue={profile.deliberation.standardIssueHours}
            hint="Min 48 h"
          />
          <ProfileNumField
            name="deliberation_tier2AmendmentDays"
            label="Tier 2 amendment period (days)"
            min={7}
            defaultValue={profile.deliberation.tier2AmendmentDays}
            hint="Min 7 days"
          />
          <ProfileNumField
            name="deliberation_tier1AmendmentDays"
            label="Tier 1 amendment period (days)"
            min={14}
            defaultValue={profile.deliberation.tier1AmendmentDays}
            hint="Min 14 days"
          />
          <ProfileNumField
            name="deliberation_decisionMethodChangeDays"
            label="Decision method change period (days)"
            min={7}
            defaultValue={profile.deliberation.decisionMethodChangeDays}
            hint="Min 7 days"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-1 text-[color:var(--color-ink)]">Quorum thresholds</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileNumField
            name="quorum_awarenessPct"
            label="Awareness quorum (%)"
            min={25}
            max={100}
            step={1}
            defaultValue={Math.round(profile.quorum.awarenessPct * 100)}
            hint="25–100%"
          />
          <ProfileNumField
            name="quorum_participationPct"
            label="Participation quorum (%)"
            min={10}
            max={100}
            step={1}
            defaultValue={Math.round(profile.quorum.participationPct * 100)}
            hint="10–100%"
          />
          <ProfileNumField
            name="quorum_deliberationHours"
            label="Deliberation period (hours)"
            min={48}
            defaultValue={profile.quorum.deliberationHours}
            hint="Min 48 h"
          />
          <ProfileNumField
            name="quorum_extensionMultiplier"
            label="Extension multiplier (×)"
            min={1.25}
            max={2}
            step={0.05}
            defaultValue={profile.quorum.extensionMultiplier}
            hint="1.25–2.0"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-1 text-[color:var(--color-ink)]">Rate limits</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileNumField
            name="rateLimits_createIssuePerDay"
            label="Issues per member per day"
            min={1}
            max={3}
            step={1}
            defaultValue={profile.rateLimits.createIssuePerDay}
            hint="1–3 (constitutional ceiling: 3)"
          />
          <div>
            <div className="eyebrow mb-1 text-[color:var(--color-ink)]">
              Referenda per rolling 7-day window
            </div>
            <div className="metadata tabular text-[color:var(--color-ink)]">1</div>
            <p className="mt-0.5 text-(length:--text-caption) text-[color:var(--color-muted)] italic">
              Fixed — constitutional requirement
            </p>
            <input type="hidden" name="rateLimits_initiateReferendumPerRollingWeek" value="1" />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-1 text-[color:var(--color-ink)]">Temporal stability</legend>
        <p className="text-(length:--text-caption) text-[color:var(--color-muted)] italic">
          Minimum days before the same decision type can be re-opened without a supermajority.
          Cannot be shortened.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileNumField
            name="stability_standardIssueDays"
            label="Standard issue (days)"
            min={30}
            defaultValue={profile.stability.standardIssueDays}
            hint="Min 30 days"
          />
          <ProfileNumField
            name="stability_policyChangeDays"
            label="Policy change (days)"
            min={60}
            defaultValue={profile.stability.policyChangeDays}
            hint="Min 60 days"
          />
          <ProfileNumField
            name="stability_constitutionalAmendmentDays"
            label="Constitutional amendment (days)"
            min={90}
            defaultValue={profile.stability.constitutionalAmendmentDays}
            hint="Min 90 days"
          />
          <ProfileNumField
            name="stability_delegationGrantDays"
            label="Delegation grant (days)"
            min={30}
            defaultValue={profile.stability.delegationGrantDays}
            hint="Min 30 days"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="eyebrow mb-1 text-[color:var(--color-ink)]">Referendum threshold</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProfileNumField
            name="referendumThreshold_minimumSupporters"
            label="Minimum supporters (count)"
            min={2}
            step={1}
            defaultValue={profile.referendumThreshold.minimumSupporters}
            hint="Min 2 members"
          />
          <ProfileNumField
            name="referendumThreshold_minimumSupportersPct"
            label="Minimum support (%)"
            min={5}
            max={50}
            step={1}
            defaultValue={Math.round(profile.referendumThreshold.minimumSupportersPct * 100)}
            hint="5–50%"
          />
        </div>
      </fieldset>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="taxonomyVocabulary"
            className="eyebrow mb-1 block text-[color:var(--color-ink)]"
          >
            Perspective taxonomy
          </label>
          <p className="mb-2 text-(length:--text-caption) text-[color:var(--color-muted)] italic">
            Comma-separated labels members choose from when adding a perspective.
          </p>
          <input
            id="taxonomyVocabulary"
            name="taxonomyVocabulary"
            type="text"
            defaultValue={profile.taxonomyVocabulary.join(', ')}
            className="w-full rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) font-[var(--font-mono)] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="scopeTagVocabulary"
            className="eyebrow mb-1 block text-[color:var(--color-ink)]"
          >
            Scope tags
          </label>
          <p className="mb-2 text-(length:--text-caption) text-[color:var(--color-muted)] italic">
            Comma-separated. Leave empty to disable scope tagging on issues.
          </p>
          <input
            id="scopeTagVocabulary"
            name="scopeTagVocabulary"
            type="text"
            defaultValue={profile.scopeTagVocabulary.join(', ')}
            className="w-full rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) font-[var(--font-mono)] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function ProfileNumField({
  name,
  label,
  min,
  max,
  step = 1,
  defaultValue,
  hint,
}: {
  name: string;
  label: string;
  min: number;
  max?: number;
  step?: number;
  defaultValue: number;
  hint: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="eyebrow mb-1 block text-[color:var(--color-ink)]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        min={min}
        {...(max !== undefined ? { max } : {})}
        step={step}
        defaultValue={defaultValue}
        required
        className="w-full rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) font-[var(--font-mono)] text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
      />
      <p className="mt-0.5 text-(length:--text-caption) text-[color:var(--color-muted)] italic">
        {hint}
      </p>
    </div>
  );
}
