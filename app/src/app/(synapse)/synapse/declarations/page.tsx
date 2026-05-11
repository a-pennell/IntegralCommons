import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listActiveDeclarations, getProducerByMember } from '@/server/synapse';

type SearchParams = { kind?: string };

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

const RESOURCE_TYPES = Object.keys(RESOURCE_LABEL);

export default async function DeclarationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { kind } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse/declarations');

  const [allDeclarations, myProducer] = await Promise.all([
    listActiveDeclarations(),
    getProducerByMember(session.value.memberId),
  ]);

  const filtered =
    kind === 'surplus' || kind === 'shortage'
      ? allDeclarations.filter((d) => d.kind === kind)
      : allDeclarations;

  // Group by resource type for the visibility board.
  const byType = new Map<string, typeof filtered>();
  for (const d of filtered) {
    if (!byType.has(d.resourceType)) byType.set(d.resourceType, []);
    byType.get(d.resourceType)!.push(d);
  }
  const typesPresent = RESOURCE_TYPES.filter((t) => byType.has(t));

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-center justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Synapse</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Declarations
          </h1>
        </div>
        {myProducer ? (
          <Link
            href={'/synapse/declarations/new' as Route}
            className="rounded bg-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            + Declare
          </Link>
        ) : null}
      </header>

      {/* Kind filter tabs */}
      <div className="mb-6 flex gap-2">
        {(
          [
            ['', 'All'],
            ['surplus', 'Surpluses'],
            ['shortage', 'Shortages'],
          ] as const
        ).map(([value, label]) => {
          const isActive = (kind ?? '') === value;
          return (
            <Link
              key={value}
              href={
                value
                  ? (`/synapse/declarations?kind=${value}` as Route)
                  : ('/synapse/declarations' as Route)
              }
              className={`rounded border px-3 py-1 text-(length:--text-caption) font-[var(--font-display)] font-medium transition-colors ${
                isActive
                  ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]'
                  : 'border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)]'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          No declarations yet.
          {myProducer
            ? ' Add one using the Declare button above.'
            : ' Register as a producer to add declarations.'}
        </p>
      ) : (
        <div className="space-y-8">
          {typesPresent.map((type) => {
            const items = byType.get(type)!;
            return (
              <section key={type}>
                <h2 className="mb-3 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
                  {RESOURCE_LABEL[type]}
                  <span className="ml-2 font-normal text-[color:var(--color-muted)]">
                    {items.length}
                  </span>
                </h2>
                <ul className="divide-y divide-[color:var(--color-rule)] rounded border border-[color:var(--color-rule)]">
                  {items.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/synapse/declarations/${d.id}` as Route}
                        className="flex items-start justify-between px-4 py-3 transition-colors hover:bg-[color:var(--color-paper-deep)]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-(length:--text-caption) font-medium ${
                                d.kind === 'surplus'
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {d.kind === 'surplus' ? 'Surplus' : 'Shortage'}
                            </span>
                            <span className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                              {d.producer.orgName}
                            </span>
                          </div>
                          {d.resourceDetail ? (
                            <div className="mt-0.5 text-(length:--text-caption) text-[color:var(--color-muted)]">
                              {d.resourceDetail}
                            </div>
                          ) : null}
                          <div className="metadata tabular mt-1 text-[color:var(--color-muted)]">
                            {d.producer.locationDescription}
                            {d.quantity && d.unit ? ` · ${d.quantity} ${d.unit}` : ''}
                          </div>
                        </div>
                        <div className="shrink-0 text-(length:--text-caption) text-[color:var(--color-muted)]">
                          {TERMS_LABEL[d.exchangeTerms] ?? d.exchangeTerms}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
