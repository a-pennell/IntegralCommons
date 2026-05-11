import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listResourcesForNeighborhood } from '@/server/resources';
import { listActiveNeedsOffers } from '@/server/needs-offers';
import { listTransactionsForMember, computeBalance } from '@/server/time-credits';

type RouteParams = { neighborhoodSlug: string };

export default async function NeighborhoodPage({ params }: { params: Promise<RouteParams> }) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const [resources, needs, offers, transactions] = await Promise.all([
    listResourcesForNeighborhood(result.neighborhood.id),
    listActiveNeedsOffers(result.neighborhood.id, 'need'),
    listActiveNeedsOffers(result.neighborhood.id, 'offer'),
    listTransactionsForMember(result.neighborhood.id, session.value.memberId, 50),
  ]);

  const balance = computeBalance(transactions);
  const hasCredits = transactions.length > 0;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-start justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Local Commons</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            {result.neighborhood.name}
          </h1>
          {result.neighborhood.description ? (
            <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
              {result.neighborhood.description}
            </p>
          ) : null}
        </div>

        {/* Balance chip — only shown once member has credit activity */}
        {hasCredits ? (
          <Link
            href={`/neighborhoods/${neighborhoodSlug}/credits`}
            className="flex items-center gap-1.5 rounded border border-[color:var(--color-rule)] px-3 py-1.5 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
          >
            <span className="tabular text-(length:--text-small) font-[var(--font-mono)] font-medium text-[color:var(--color-ink)]">
              {balance.toFixed(1)}
            </span>
            <span className="text-(length:--text-caption) text-[color:var(--color-muted)]">
              {Math.abs(balance) === 1 ? 'hr' : 'hrs'}
            </span>
          </Link>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/resources`}
          label="Resources"
          count={resources.length}
          description="Tools, spaces, and skills to borrow or share"
        />
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers`}
          label="Needs"
          count={needs.length}
          description="Active requests from neighbors"
        />
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers?tab=offers`}
          label="Offers"
          count={offers.length}
          description="Things neighbors are offering"
        />
      </div>
    </main>
  );
}

function SummaryCard({
  href,
  label,
  count,
  description,
}: {
  href: string;
  label: string;
  count: number;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded border border-[color:var(--color-rule)] p-4 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
    >
      <div className="tabular text-[28px] leading-none font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
        {count}
      </div>
      <div className="mt-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
        {label}
      </div>
      <p className="mt-1 text-(length:--text-caption) text-[color:var(--color-muted)]">
        {description}
      </p>
    </Link>
  );
}
