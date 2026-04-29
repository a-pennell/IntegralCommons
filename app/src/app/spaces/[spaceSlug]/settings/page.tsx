import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { resolveGovernanceProfile, type GovernanceProfile } from '@/server/governance-config';

type RouteParams = { spaceSlug: string };

export default async function SettingsPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/settings`)}`);
  }

  const found = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!found) notFound();
  const { space } = found;

  const profile = resolveGovernanceProfile(space.governanceProfile);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.name}
      </div>
      <h1 className="mb-2 text-3xl font-[var(--font-display)]">Governance</h1>
      <p className="mb-8 text-sm text-[color:var(--color-muted)]">
        These are the active rules for this Space. Read-only — every change routes through a
        governance Issue (
        <a className="underline" href={`/spaces/${space.slug}/issues` as Route}>
          see Issues
        </a>
        ).
      </p>

      <div className="mb-8 flex gap-4 text-sm">
        <a
          href={`/spaces/${space.slug}/settings/notifications` as Route}
          className="underline text-[color:var(--color-muted)]"
        >
          Notifications
        </a>
        <a
          href={`/spaces/${space.slug}/settings/export` as Route}
          className="underline text-[color:var(--color-muted)]"
        >
          Export data
        </a>
      </div>

      <dl className="space-y-6">
        <Row label="Decision method (default)">
          {profile.decisionMethodDefault === 'consent' ? (
            <>
              <strong>Consent</strong> — a decision passes when no member has an unresolved
              objection. Dissent is captured as a stand-aside.
            </>
          ) : (
            profile.decisionMethodDefault
          )}
        </Row>

        <Row label="Deliberation floor">
          {profile.deliberation.standardIssueHours} hours minimum on standard Issues before any vote
          can start.
        </Row>

        <Row label="Quorum thresholds">
          <ul className="list-inside list-disc">
            <li>
              Awareness: <Pct value={profile.quorum.awarenessPct} /> of active Members
            </li>
            <li>
              Participation: <Pct value={profile.quorum.participationPct} /> of active Members
            </li>
            <li>Extension multiplier: {profile.quorum.extensionMultiplier}&times;</li>
          </ul>
        </Row>

        <Row label="Rate limits (constitutional floors)">
          <ul className="list-inside list-disc">
            <li>{profile.rateLimits.createIssuePerDay} new Issues per Member per day</li>
            <li>
              {profile.rateLimits.initiateReferendumPerRollingWeek} referendum per rolling 7-day
              window per Member
            </li>
          </ul>
        </Row>

        <Row label="Temporal stability">
          <ul className="list-inside list-disc">
            <li>
              Standard Issue: {profile.stability.standardIssueDays} days before the same decision
              can be challenged without a 2/3 supermajority
            </li>
            <li>Policy change: {profile.stability.policyChangeDays} days</li>
            <li>Constitutional amendment: {profile.stability.constitutionalAmendmentDays} days</li>
          </ul>
        </Row>

        <Row label="Perspective taxonomy">
          <TagList tags={profile.taxonomyVocabulary} />
        </Row>

        <Row label="Scope tags">
          {profile.scopeTagVocabulary.length === 0 ? (
            <span className="text-[color:var(--color-muted)]">
              None configured. Add scope tags via a governance Issue.
            </span>
          ) : (
            <TagList tags={profile.scopeTagVocabulary} />
          )}
        </Row>
      </dl>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[color:var(--color-rule)] pt-4">
      <dt className="mb-1 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {label}
      </dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

function Pct({ value }: { value: number }) {
  return <>{Math.round(value * 100)}%</>;
}

function TagList({ tags }: { tags: GovernanceProfile['taxonomyVocabulary'] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((t) => (
        <li
          key={t}
          className="border border-[color:var(--color-rule)] bg-white/50 px-2 py-0.5 text-xs"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}
