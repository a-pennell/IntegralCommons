import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { resolveGovernanceProfile, type GovernanceProfile } from '@/server/governance-config';
import { Folio } from '@/components/ui/folio';

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
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      <Folio
        marginWidth="220px"
        className=""
        margin={
          <>
            <div className="eyebrow text-[color:var(--color-ink)]">Settings</div>
            <div className="metadata mt-1 tabular">Governance · v1</div>
            <div className="mt-6 metadata tabular text-[color:var(--color-muted)] italic">
              Read-only. Every change routes through a governance Issue.
            </div>
            <nav className="mt-8 flex flex-col gap-2">
              <div className="eyebrow">Related</div>
              <a
                href={`/spaces/${space.slug}/settings/notifications` as Route}
                className="metadata underline underline-offset-4 hover:text-[color:var(--color-accent)]"
              >
                Digest cadence
              </a>
              <a
                href={`/spaces/${space.slug}/settings/export` as Route}
                className="metadata underline underline-offset-4 hover:text-[color:var(--color-accent)]"
              >
                Export data
              </a>
              <a
                href={`/spaces/${space.slug}/issues?type=governance` as Route}
                className="metadata underline underline-offset-4 hover:text-[color:var(--color-accent)]"
              >
                Open governance issue
              </a>
            </nav>
          </>
        }
      >
        <header className="mb-12">
          <div className="eyebrow">Governance</div>
          <h1 className="mt-3 text-(length:--text-display) leading-(--text-display--line-height) tracking-(--text-display--letter-spacing) font-[var(--font-display)] font-extrabold text-[color:var(--color-ink)]">
            The active rules
          </h1>
          <p className="mt-4 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
            How this Space governs itself, today. Each parameter was either set at bootstrap or
            adjusted through a finalized Decision Record.
          </p>
        </header>

        <dl className="space-y-12">
          <Row label="Decision method (default)">
            {profile.decisionMethodDefault === 'consent' ? (
              <>
                <strong className="font-medium">Consent</strong> — a decision passes when no member
                has an unresolved objection. Dissent is captured as a stand-aside.
              </>
            ) : (
              profile.decisionMethodDefault
            )}
          </Row>

          <Row label="Deliberation floor">
            <span className="metadata tabular">{profile.deliberation.standardIssueHours}h</span>{' '}
            minimum on standard issues before any vote can start.
          </Row>

          <Row label="Quorum thresholds">
            <Numbered>
              <li>
                Awareness <Pct value={profile.quorum.awarenessPct} /> of active members
              </li>
              <li>
                Participation <Pct value={profile.quorum.participationPct} /> of active members
              </li>
              <li>
                Extension multiplier{' '}
                <span className="metadata tabular">{profile.quorum.extensionMultiplier}×</span>
              </li>
            </Numbered>
          </Row>

          <Row label="Rate limits (constitutional floors)">
            <Numbered>
              <li>
                <span className="metadata tabular">{profile.rateLimits.createIssuePerDay}</span>{' '}
                new issues per member per day
              </li>
              <li>
                <span className="metadata tabular">
                  {profile.rateLimits.initiateReferendumPerRollingWeek}
                </span>{' '}
                referendum per rolling 7-day window per member
              </li>
            </Numbered>
          </Row>

          <Row label="Temporal stability">
            <Numbered>
              <li>
                Standard issue ·{' '}
                <span className="metadata tabular">
                  {profile.stability.standardIssueDays}d
                </span>{' '}
                before the same decision can be challenged without a 2/3 supermajority
              </li>
              <li>
                Policy change ·{' '}
                <span className="metadata tabular">{profile.stability.policyChangeDays}d</span>
              </li>
              <li>
                Constitutional amendment ·{' '}
                <span className="metadata tabular">
                  {profile.stability.constitutionalAmendmentDays}d
                </span>
              </li>
            </Numbered>
          </Row>

          <Row label="Perspective taxonomy">
            <TagList tags={profile.taxonomyVocabulary} />
          </Row>

          <Row label="Scope tags">
            {profile.scopeTagVocabulary.length === 0 ? (
              <span className="text-[color:var(--color-muted)] italic">
                None configured. Add scope tags via a governance issue.
              </span>
            ) : (
              <TagList tags={profile.scopeTagVocabulary} />
            )}
          </Row>
        </dl>
      </Folio>
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="eyebrow mb-2">{label}</dt>
      <dd className="font-[var(--font-body)] text-(length:--text-body) leading-(--text-body--line-height) text-[color:var(--color-ink)]">
        {children}
      </dd>
    </div>
  );
}

function Numbered({ children }: { children: React.ReactNode }) {
  return <ol className="ml-0 mt-1 list-none space-y-2">{children}</ol>;
}

function Pct({ value }: { value: number }) {
  return <span className="metadata tabular">{Math.round(value * 100)}%</span>;
}

function TagList({ tags }: { tags: GovernanceProfile['taxonomyVocabulary'] }) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-2">
      {tags.map((t) => (
        <li
          key={t}
          className="metadata tabular border border-[color:var(--color-rule)] px-2 py-1 text-[color:var(--color-ink)]"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}
