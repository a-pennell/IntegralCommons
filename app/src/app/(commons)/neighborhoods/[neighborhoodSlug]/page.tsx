import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listResourcesForNeighborhood } from '@/server/resources';
import { listActiveNeedsOffers } from '@/server/needs-offers';

type RouteParams = { neighborhoodSlug: string };

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const [resources, needs, offers] = await Promise.all([
    listResourcesForNeighborhood(result.neighborhood.id),
    listActiveNeedsOffers(result.neighborhood.id, 'need'),
    listActiveNeedsOffers(result.neighborhood.id, 'offer'),
  ]);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          {result.neighborhood.name}
        </h1>
        {result.neighborhood.description ? (
          <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
            {result.neighborhood.description}
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/resources`}
          label="Resources"
          count={resources.length}
          description="Tools, spaces, and skills available to borrow or share"
        />
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers`}
          label="Needs"
          count={needs.length}
          description="Active requests from neighbors"
        />
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers`}
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
      className="block border border-[color:var(--color-rule)] p-5 transition-colors hover:border-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)]"
    >
      <div className="text-(length:--text-heading) font-[var(--font-display)] font-bold tabular text-[color:var(--color-ink)]">
        {count}
      </div>
      <div className="mt-1 font-[var(--font-display)] font-semibold text-(length:--text-body) text-[color:var(--color-ink)]">
        {label}
      </div>
      <p className="mt-2 text-(length:--text-small) text-[color:var(--color-ink-soft)]">
        {description}
      </p>
    </Link>
  );
}
