import Link from 'next/link';
import type { Route } from 'next';
import { listActiveProducers, listActiveDeclarations, listProposals } from '@/server/synapse';

export default async function SynapseOverviewPage() {
  const [producers, declarations, proposals] = await Promise.all([
    listActiveProducers(),
    listActiveDeclarations(),
    listProposals(),
  ]);

  const surpluses = declarations.filter((d) => d.kind === 'surplus');
  const shortages = declarations.filter((d) => d.kind === 'shortage');
  const pendingProposals = proposals.filter((p) => p.status === 'proposed');

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <div className="eyebrow mb-1">Flow Engine</div>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Synapse
        </h1>
        <p className="mt-1 max-w-prose text-(length:--text-small) text-[color:var(--color-muted)]">
          Regional surplus and shortage visibility for food producers. Not a marketplace —
          a coordination layer.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard
          href="/synapse/producers"
          label="Producers"
          count={producers.length}
          description="Registered farms and cooperatives"
        />
        <SummaryCard
          href="/synapse/declarations?kind=surplus"
          label="Surpluses"
          count={surpluses.length}
          description="Active surplus declarations"
        />
        <SummaryCard
          href="/synapse/declarations?kind=shortage"
          label="Shortages"
          count={shortages.length}
          description="Active shortage declarations"
        />
        <SummaryCard
          href="/synapse/allocations"
          label="Proposals"
          count={pendingProposals.length}
          description="Allocations awaiting consent"
        />
      </div>

      <div className="mt-8 rounded border border-[color:var(--color-rule)] px-5 py-4">
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          Synapse surfaces what's available and what's needed across the region.
          Producers declare their surpluses and shortages. Anyone can propose an allocation —
          a routing of surplus to need. No allocation becomes a commitment without the
          explicit consent of all parties involved.
        </p>
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
      href={href as Route}
      className="block rounded border border-[color:var(--color-rule)] p-4 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
    >
      <div className="tabular font-[var(--font-display)] text-[28px] font-semibold leading-none text-[color:var(--color-ink)]">
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
