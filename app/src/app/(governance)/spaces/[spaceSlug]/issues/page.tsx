import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listIssuesForSpace } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
import type { Issue } from '@/db/schema';
import { Citation } from '@/components/ui/citation';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusStamp, type Status } from '@/components/ui/status-stamp';

type RouteParams = { spaceSlug: string };
type SearchParams = { status?: string };

const STATUS_FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'open', label: 'Open', match: (s: string) => s === 'open' },
  { key: 'exploring', label: 'Exploring', match: (s: string) => s === 'exploring' },
  { key: 'decided', label: 'Decided', match: (s: string) => s === 'decided' },
  { key: 'stalled', label: 'Stalled', match: (s: string) => s === 'stalled' },
  { key: 'archived', label: 'Archived', match: (s: string) => s === 'archived' },
] as const;

export default async function IssuesIndexPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  const { status } = await searchParams;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/issues`)}`);
  }

  const found = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!found) notFound();
  const { space } = found;

  const all = await listIssuesForSpace({
    spaceId: space.id,
    viewerMemberId: session.value.memberId,
  });

  const activeFilter = STATUS_FILTERS.find((f) => f.key === (status ?? 'all')) ?? STATUS_FILTERS[0];
  const filtered = all.filter((i) => activeFilter.match(i.status));

  const counts = STATUS_FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f.key] = all.filter((i) => f.match(i.status)).length;
    return acc;
  }, {});

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 flex items-baseline justify-between border-b-2 border-[color:var(--color-ink)] pb-4">
        <div>
          <div className="eyebrow">Issues</div>
          <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
            All issues
          </h1>
        </div>
        <a
          href={`/spaces/${space.slug}/issues/new` as Route}
          className="text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)]"
        >
          + Open an issue
        </a>
      </header>

      {/* Status filter — bibliography-style index, not chips */}
      <nav aria-label="Filter by status" className="mb-10">
        <ul className="flex flex-wrap items-baseline gap-x-1">
          {STATUS_FILTERS.map((f, i) => {
            const isActive = f.key === activeFilter.key;
            const href: Route =
              f.key === 'all'
                ? (`/spaces/${space.slug}/issues` as Route)
                : (`/spaces/${space.slug}/issues?status=${f.key}` as Route);
            return (
              <li key={f.key} className="flex items-baseline">
                {i > 0 ? (
                  <span aria-hidden className="mx-2 text-[color:var(--color-muted)]">
                    ·
                  </span>
                ) : null}
                <a
                  href={href}
                  className={`text-(length:--text-small) font-[var(--font-display)] ${
                    isActive
                      ? 'font-semibold text-[color:var(--color-accent)] underline underline-offset-4'
                      : 'font-normal text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]'
                  }`}
                >
                  {f.label}{' '}
                  <span className="metadata tabular text-[color:var(--color-muted)]">
                    {counts[f.key] ?? 0}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <section>
        <SectionHeader label={activeFilter.label} count={filtered.length} />
        {filtered.length === 0 ? (
          <p className="border-t border-[color:var(--color-rule)] py-6 text-(length:--text-small) text-[color:var(--color-muted)] italic">
            {activeFilter.key === 'all'
              ? 'No issues yet. When a member opens one, it appears here.'
              : `No issues with status "${activeFilter.label.toLowerCase()}".`}
          </p>
        ) : (
          <ul className="border-t border-[color:var(--color-rule)]">
            {filtered.map((issue) => (
              <IssueRow key={issue.id} issue={issue} spaceSlug={space.slug} />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function IssueRow({ issue, spaceSlug }: { issue: Issue; spaceSlug: string }) {
  const opened = formatShortDate(issue.createdAt);
  return (
    <li className="border-b border-[color:var(--color-rule)]">
      <a
        href={`/spaces/${spaceSlug}/issues/${issue.slug}` as Route}
        className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 py-4 transition-colors hover:bg-[color:var(--color-paper-soft)]"
      >
        <Citation type="ISS" number={shortId(issue.id)} />
        <div>
          <div className="text-(length:--text-body) leading-tight font-[var(--font-body)] text-[color:var(--color-ink)]">
            {issue.title}
          </div>
          <div className="metadata tabular mt-1">
            opened {opened}
            {issue.scopeTags.length > 0 ? (
              <>
                {' '}
                ·{' '}
                {issue.scopeTags.map((t, i) => (
                  <span key={t}>
                    {i > 0 ? ', ' : ''}
                    {t}
                  </span>
                ))}
              </>
            ) : null}
          </div>
        </div>
        <StatusStamp status={issue.status as Status} />
      </a>
    </li>
  );
}

function shortId(ulid: string): string {
  return ulid.slice(-5).toUpperCase();
}

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
