import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listActiveNeedsOffers } from '@/server/needs-offers';
import { Note } from '@/components/ui/note';

type RouteParams = { neighborhoodSlug: string };
type SearchParams = { tab?: string };

export default async function NeedsOffersPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug } = await params;
  const { tab } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/needs-offers`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const activeTab = tab === 'offers' ? 'offers' : 'needs';
  const items = await listActiveNeedsOffers(
    result.neighborhood.id,
    activeTab === 'needs' ? 'need' : 'offer',
  );

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-center justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Mutual Aid</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Needs &amp; Offers
          </h1>
        </div>
        <a
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers/new`}
          className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
        >
          + Post
        </a>
      </header>

      {/* Tab bar */}
      <nav className="mb-6 flex gap-1">
        {(['needs', 'offers'] as const).map((t) => {
          const isActive = activeTab === t;
          return (
            <a
              key={t}
              href={`/neighborhoods/${neighborhoodSlug}/needs-offers${t === 'offers' ? '?tab=offers' : ''}`}
              className={`rounded px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] capitalize transition-colors ${
                isActive
                  ? 'bg-[color:var(--color-accent-soft)] font-medium text-[color:var(--color-accent)]'
                  : 'font-normal text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]'
              }`}
            >
              {t}
            </a>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <Note tone="info">No active {activeTab} right now.</Note>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <a
                href={`/neighborhoods/${neighborhoodSlug}/needs-offers/${item.id}`}
                className="group block"
              >
                <div className="flex items-center gap-2">
                  {item.isUrgent ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium tracking-wider text-red-600 uppercase">
                      Urgent
                    </span>
                  ) : null}
                  <span className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] group-hover:text-[color:var(--color-accent)]">
                    {item.title}
                  </span>
                </div>
                {item.body ? (
                  <p className="mt-1 line-clamp-2 text-(length:--text-small) text-[color:var(--color-muted)]">
                    {item.body}
                  </p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
