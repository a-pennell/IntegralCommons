import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listReferendaForSpace } from '@/server/referenda';
import { getSpaceBySlugForMember } from '@/server/spaces';
import type { Referendum } from '@/db/schema';
import { Citation } from '@/components/ui/citation';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusStamp, type Status } from '@/components/ui/status-stamp';

type RouteParams = { spaceSlug: string };

export default async function ReferendaIndexPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/referenda`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const all = await listReferendaForSpace(space.space.id);
  const open = all.filter((r) => r.status !== 'closed');
  const closed = all.filter((r) => r.status === 'closed');

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 flex items-baseline justify-between border-b-2 border-[color:var(--color-ink)] pb-4">
        <div>
          <div className="eyebrow">Referenda</div>
          <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
            All referenda
          </h1>
        </div>
        <a
          href={`/spaces/${space.space.slug}/referenda/new` as Route}
          className="text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)]"
        >
          + Initiate
        </a>
      </header>

      <p className="mb-12 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
        Referenda are the instrument for revoking a delegation, overturning a Decision Record, or
        proposing a governance change. Use them sparingly. Each carries a deliberation floor before
        voting opens.
      </p>

      <section className="mb-14">
        <SectionHeader label="Open" count={open.length} />
        {open.length === 0 ? (
          <p className="border-t border-[color:var(--color-rule)] py-6 text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
            No referenda are currently open in this Space.
          </p>
        ) : (
          <ul className="border-t border-[color:var(--color-rule)]">
            {open.map((r) => (
              <ReferendumRow key={r.id} referendum={r} spaceSlug={space.space.slug} />
            ))}
          </ul>
        )}
      </section>

      {closed.length > 0 ? (
        <section>
          <SectionHeader label="From the register" count={closed.length} />
          <ul className="border-t border-[color:var(--color-rule)]">
            {closed.map((r) => (
              <ReferendumRow key={r.id} referendum={r} spaceSlug={space.space.slug} />
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

function ReferendumRow({
  referendum: r,
  spaceSlug,
}: {
  referendum: Referendum;
  spaceSlug: string;
}) {
  return (
    <li className="border-b border-[color:var(--color-rule)]">
      <a
        href={`/spaces/${spaceSlug}/referenda/${r.id}` as Route}
        className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-6 py-4 transition-colors hover:bg-[color:var(--color-paper-soft)]"
      >
        <Citation type="REF" number={r.id.slice(-5).toUpperCase()} />
        <div>
          <div className="text-(length:--text-body) leading-tight font-[var(--font-body)] text-[color:var(--color-ink)]">
            On {targetLabel(r.targetType)}
          </div>
          <div className="metadata tabular mt-1">
            initiated {formatShortDate(r.createdAt)}
            {r.outcome ? (
              <>
                {' · outcome '}
                <span
                  className={
                    r.outcome === 'affirmed'
                      ? 'text-[color:var(--color-accent)]'
                      : r.outcome === 'revoked'
                        ? 'text-[color:var(--color-oxblood)]'
                        : ''
                  }
                >
                  {r.outcome}
                </span>
              </>
            ) : null}
          </div>
        </div>
        <StatusStamp status={r.status as Status} />
      </a>
    </li>
  );
}

function targetLabel(type: Referendum['targetType']): string {
  switch (type) {
    case 'delegation':
      return 'a delegation';
    case 'decision_record':
      return 'a Decision Record';
    case 'governance_profile_change':
      return 'a governance profile change';
  }
}

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
