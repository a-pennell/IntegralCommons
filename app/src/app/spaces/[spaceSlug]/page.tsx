import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { ensureBootstrapIssue, getSpaceBySlugForMember } from '@/server/spaces';
import { listIssuesForSpace } from '@/server/issues';
import { listReferendaForSpace } from '@/server/referenda';
import type { Issue, Referendum } from '@/db/schema';
import { Citation } from '@/components/ui/citation';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusStamp, type Status } from '@/components/ui/status-stamp';

type RouteParams = { spaceSlug: string };

export default async function SpaceDashboardPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const session = await requireSession();
  if (!session.ok) {
    const { spaceSlug } = await params;
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}`)}`);
  }

  const { spaceSlug } = await params;
  const result = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!result) notFound();
  const { space } = result;

  const isPreBootstrap = space.bootstrapCompletedAt === null;
  let bootstrapIssueSlug: string | null = null;
  if (isPreBootstrap) {
    const res = await ensureBootstrapIssue({
      spaceId: space.id,
      founderMemberId: session.value.memberId,
    });
    if (res.ok) bootstrapIssueSlug = res.value.slug;
  }

  const [activeIssues, allReferenda] = await Promise.all([
    listIssuesForSpace({
      spaceId: space.id,
      viewerMemberId: session.value.memberId,
      statuses: ['open', 'exploring'],
      limit: 10,
    }),
    listReferendaForSpace(space.id),
  ]);

  const openReferenda = allReferenda.filter((r) => r.status !== 'closed');
  const stalledCount = await listIssuesForSpace({
    spaceId: space.id,
    viewerMemberId: session.value.memberId,
    statuses: ['stalled'],
    limit: 100,
  }).then((rows) => rows.length);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-10 py-14"
    >
      {/* Dateline header */}
      <header className="mb-12 flex items-baseline justify-between border-b-2 border-[color:var(--color-ink)] pb-4">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)]">
            {isPreBootstrap ? 'Awaiting bootstrap' : 'In session'}
          </h1>
        </div>
        <div className="metadata tabular text-right">
          {formatDateline(new Date())}
        </div>
      </header>

      {/* Bootstrap call-to-attention, if applicable */}
      {isPreBootstrap && bootstrapIssueSlug ? (
        <section className="mb-14">
          <SectionHeader label="Awaiting your attention" count={1} />
          <div className="border-l-2 border-[color:var(--color-accent)] pl-5">
            <div className="metadata mb-2 tabular">Bootstrap required</div>
            <h3 className="text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)]">
              Decide how decisions get made
            </h3>
            <p className="mt-2 max-w-prose text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-ink-soft)]">
              Before this Space can decide other questions, it must first decide its
              governance — the Bootstrap Issue. It closes via the hardcoded consent
              meta-method.
            </p>
            <a
              href={`/spaces/${space.slug}/issues/${bootstrapIssueSlug}` as Route}
              className="mt-3 inline-block text-(length:--text-small) text-[color:var(--color-accent)] underline underline-offset-4"
            >
              Open the Bootstrap Issue ▸
            </a>
          </div>
        </section>
      ) : null}

      {/* In session — issues currently open or exploring */}
      <section className="mb-14">
        <SectionHeader
          label="In session"
          count={activeIssues.length}
          right={
            activeIssues.length > 0 ? (
              <a
                href={`/spaces/${space.slug}/issues` as Route}
                className="hover:text-[color:var(--color-accent)]"
              >
                See all ▸
              </a>
            ) : null
          }
        />
        {activeIssues.length === 0 ? (
          <EmptyLine>No issues are currently open in this Space.</EmptyLine>
        ) : (
          <ul className="border-t border-[color:var(--color-rule)]">
            {activeIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} spaceSlug={space.slug} />
            ))}
          </ul>
        )}
      </section>

      {/* Open referenda */}
      <section className="mb-14">
        <SectionHeader label="Open referenda" count={openReferenda.length} />
        {openReferenda.length === 0 ? (
          <EmptyLine>No referenda are currently open in this Space.</EmptyLine>
        ) : (
          <ul className="border-t border-[color:var(--color-rule)]">
            {openReferenda.map((ref) => (
              <ReferendumRow key={ref.id} referendum={ref} spaceSlug={space.slug} />
            ))}
          </ul>
        )}
      </section>

      {/* Health — vital signs */}
      <section>
        <SectionHeader label="Health" />
        <dl className="grid grid-cols-2 gap-x-10 gap-y-4 sm:grid-cols-3">
          <Vital label="Active issues" value={activeIssues.length} />
          <Vital label="Open referenda" value={openReferenda.length} />
          <Vital label="Stalled" value={stalledCount} tone={stalledCount > 0 ? 'attention' : 'quiet'} />
        </dl>
      </section>
    </main>
  );
}

function IssueRow({ issue, spaceSlug }: { issue: Issue; spaceSlug: string }) {
  return (
    <li className="border-b border-[color:var(--color-rule)]">
      <a
        href={`/spaces/${spaceSlug}/issues/${issue.slug}` as Route}
        className="flex items-baseline gap-5 py-3 transition-colors hover:bg-[color:var(--color-paper-soft)]"
      >
        <Citation type="ISS" number={shortId(issue.id)} />
        <span className="flex-1 text-(length:--text-body) leading-tight">{issue.title}</span>
        <StatusStamp status={issue.status as Status} />
      </a>
    </li>
  );
}

function ReferendumRow({
  referendum,
  spaceSlug,
}: {
  referendum: Referendum;
  spaceSlug: string;
}) {
  return (
    <li className="border-b border-[color:var(--color-rule)]">
      <a
        href={`/spaces/${spaceSlug}/referenda/${referendum.id}` as Route}
        className="flex items-baseline gap-5 py-3 transition-colors hover:bg-[color:var(--color-paper-soft)]"
      >
        <Citation type="REF" number={shortId(referendum.id)} />
        <span className="flex-1 text-(length:--text-body) leading-tight italic">
          Targeting {referendum.targetType.replace('_', ' ')}
        </span>
        <StatusStamp status={referendum.status as Status} />
      </a>
    </li>
  );
}

function Vital({
  label,
  value,
  tone = 'quiet',
}: {
  label: string;
  value: number | string;
  tone?: 'quiet' | 'attention';
}) {
  return (
    <div className="border-l border-[color:var(--color-rule)] pl-4">
      <dt className="eyebrow">{label}</dt>
      <dd
        className={`mt-1 font-[var(--font-display)] text-(length:--text-heading) tabular ${
          tone === 'attention' ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-ink)]'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-t border-[color:var(--color-rule)] py-4 text-(length:--text-small) text-[color:var(--color-muted)] italic">
      {children}
    </p>
  );
}

function shortId(ulid: string): string {
  // ULIDs aren't naturally sequential numbers; show last 5 chars in mono as a stable handle.
  return ulid.slice(-5).toUpperCase();
}

function formatDateline(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
