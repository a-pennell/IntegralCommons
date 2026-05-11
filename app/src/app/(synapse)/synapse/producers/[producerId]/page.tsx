import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getProducerById, listDeclarationsForProducer } from '@/server/synapse';

type RouteParams = { producerId: string };

const RESOURCE_LABEL: Record<string, string> = {
  vegetables: 'Vegetables',
  fruit: 'Fruit',
  grains: 'Grains',
  legumes: 'Legumes',
  herbs: 'Herbs',
  dairy: 'Dairy',
  eggs: 'Eggs',
  meat: 'Meat',
  honey: 'Honey',
  seeds: 'Seeds',
  other: 'Other',
};

const TERMS_LABEL: Record<string, string> = {
  free: 'Free',
  exchange: 'Exchange',
  cost_recovery: 'Cost recovery',
};

export default async function ProducerProfilePage({ params }: { params: Promise<RouteParams> }) {
  const { producerId } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/synapse/producers/${producerId}`);

  const [producer, declarations] = await Promise.all([
    getProducerById(producerId),
    listDeclarationsForProducer(producerId),
  ]);
  if (!producer) notFound();

  const isOwner = producer.managedByMemberId === session.value.memberId;
  const surpluses = declarations.filter((d) => d.kind === 'surplus');
  const shortages = declarations.filter((d) => d.kind === 'shortage');

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <a
          href="/synapse/producers"
          className="mb-4 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          ← Producers
        </a>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow mb-1">Producer</div>
            <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
              {producer.orgName}
            </h1>
            <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
              {producer.locationDescription}
            </p>
          </div>
          {isOwner ? (
            <Link
              href={'/synapse/declarations/new' as Route}
              className="shrink-0 rounded bg-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
            >
              + Declaration
            </Link>
          ) : null}
        </div>
      </header>

      {producer.bio ? (
        <p className="mb-8 max-w-prose text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
          {producer.bio}
        </p>
      ) : null}

      <div className="grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Surpluses
            <span className="ml-2 font-normal text-[color:var(--color-muted)]">
              ({surpluses.length})
            </span>
          </h2>
          {surpluses.length === 0 ? (
            <p className="text-(length:--text-caption) text-[color:var(--color-muted)]">
              No active surpluses.
            </p>
          ) : (
            <ul className="space-y-2">
              {surpluses.map((d) => (
                <li
                  key={d.id}
                  className="rounded border border-[color:var(--color-rule)] px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                      {RESOURCE_LABEL[d.resourceType] ?? d.resourceType}
                      {d.resourceDetail ? ` — ${d.resourceDetail}` : ''}
                    </span>
                    <span className="text-(length:--text-caption) text-[color:var(--color-muted)]">
                      {TERMS_LABEL[d.exchangeTerms] ?? d.exchangeTerms}
                    </span>
                  </div>
                  {d.quantity && d.unit ? (
                    <div className="metadata tabular mt-1">
                      {d.quantity} {d.unit}
                    </div>
                  ) : null}
                  <div className="metadata tabular mt-1 text-[color:var(--color-muted)]">
                    From {d.availableFrom}
                    {d.availableUntil ? ` · Until ${d.availableUntil}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Shortages
            <span className="ml-2 font-normal text-[color:var(--color-muted)]">
              ({shortages.length})
            </span>
          </h2>
          {shortages.length === 0 ? (
            <p className="text-(length:--text-caption) text-[color:var(--color-muted)]">
              No active shortages.
            </p>
          ) : (
            <ul className="space-y-2">
              {shortages.map((d) => (
                <li
                  key={d.id}
                  className="rounded border border-[color:var(--color-rule)] px-4 py-3"
                >
                  <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                    {RESOURCE_LABEL[d.resourceType] ?? d.resourceType}
                    {d.resourceDetail ? ` — ${d.resourceDetail}` : ''}
                  </div>
                  {d.quantity && d.unit ? (
                    <div className="metadata tabular mt-1">
                      {d.quantity} {d.unit} needed
                    </div>
                  ) : null}
                  <div className="metadata tabular mt-1 text-[color:var(--color-muted)]">
                    From {d.availableFrom}
                    {d.availableUntil ? ` · Until ${d.availableUntil}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
