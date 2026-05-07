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
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons · Mutual Aid</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Needs &amp; Offers
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          Ask for what you need. Offer what you can.
        </p>
      </header>

      {/* Tab bar */}
      <nav className="mb-8 flex gap-6 border-b border-[color:var(--color-rule)] pb-0">
        {(['needs', 'offers'] as const).map((t) => {
          const isActive = activeTab === t;
          return (
            <a
              key={t}
              href={`/neighborhoods/${neighborhoodSlug}/needs-offers${t === 'offers' ? '?tab=offers' : ''}`}
              className={`pb-3 font-[var(--font-display)] text-(length:--text-body) capitalize transition-colors ${
                isActive
                  ? 'border-b-2 border-[color:var(--color-accent)] font-semibold text-[color:var(--color-ink)]'
                  : 'text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]'
              }`}
            >
              {t}
            </a>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <Note tone="info">
          No active {activeTab} right now.
        </Note>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {items.map((item) => (
            <li key={item.id} className="py-5">
              <div className="flex items-baseline gap-3">
                {item.isUrgent ? (
                  <span className="metadata text-[color:var(--color-accent)]">Urgent</span>
                ) : null}
                <span className="font-[var(--font-display)] font-semibold text-(length:--text-body) text-[color:var(--color-ink)]">
                  {item.title}
                </span>
              </div>
              {item.body ? (
                <p className="mt-1 text-(length:--text-body) text-[color:var(--color-ink-soft)]">
                  {item.body}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
