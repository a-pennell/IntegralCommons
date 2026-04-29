import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listIssuesForSpace } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';

type RouteParams = { spaceSlug: string };
type SearchParams = { status?: string };

const STATUS_FILTER_VALUES = [
  'open',
  'exploring',
  'decided',
  'reopened',
  'archived',
  'stalled',
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

  const statusFilter = STATUS_FILTER_VALUES.find((v) => v === status);

  const list = await listIssuesForSpace({
    spaceId: space.id,
    viewerMemberId: session.value.memberId,
    ...(statusFilter && { statuses: [statusFilter] }),
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
            {space.name}
          </div>
          <h1 className="text-3xl font-[var(--font-display)]">Issues</h1>
        </div>
        <a
          href={`/spaces/${space.slug}/issues/new` as Route}
          className="border border-[color:var(--color-ink)] px-3 py-1 text-sm"
        >
          New Issue
        </a>
      </header>

      <nav aria-label="Status filter" className="mb-4 flex flex-wrap gap-2 text-xs">
        <FilterChip href={`/spaces/${space.slug}/issues` as Route} active={!statusFilter}>
          All
        </FilterChip>
        {STATUS_FILTER_VALUES.map((s) => (
          <FilterChip
            key={s}
            href={`/spaces/${space.slug}/issues?status=${s}` as Route}
            active={statusFilter === s}
          >
            {s}
          </FilterChip>
        ))}
      </nav>

      {list.length === 0 ? (
        <p className="text-[color:var(--color-muted)]">
          {statusFilter
            ? `No Issues with status "${statusFilter}" yet.`
            : 'No Issues yet. When a member opens one, it appears here.'}
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {list.map((issue) => (
            <li key={issue.id} className="py-3">
              <a
                href={`/spaces/${space.slug}/issues/${issue.slug}` as Route}
                className="block hover:underline"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-lg font-[var(--font-display)]">{issue.title}</div>
                  <span className="font-mono text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
                    {issue.status}
                  </span>
                </div>
                <div className="text-sm text-[color:var(--color-muted)]">{issue.scope}</div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: Route;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={
        'border px-2 py-0.5 ' +
        (active
          ? 'border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]'
          : 'border-[color:var(--color-rule)]')
      }
    >
      {children}
    </a>
  );
}
