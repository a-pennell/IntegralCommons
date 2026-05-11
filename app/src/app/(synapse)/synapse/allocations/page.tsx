import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listProposals } from '@/server/synapse';

const STATUS_LABEL: Record<string, string> = {
  proposed: 'Awaiting consent',
  consented: 'Consented',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLOR: Record<string, string> = {
  proposed: 'bg-amber-50 text-amber-700',
  consented: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-[color:var(--color-paper-deep)] text-[color:var(--color-muted)]',
};

const RESOURCE_LABEL: Record<string, string> = {
  vegetables: 'Vegetables', fruit: 'Fruit', grains: 'Grains', legumes: 'Legumes',
  herbs: 'Herbs', dairy: 'Dairy', eggs: 'Eggs', meat: 'Meat', honey: 'Honey',
  seeds: 'Seeds', other: 'Other',
};

export default async function AllocationsPage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse/allocations');

  const proposals = await listProposals();

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <div className="eyebrow mb-1">Synapse</div>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Allocation proposals
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          Proposed routings of surplus to need. No allocation is confirmed without consent from all parties.
        </p>
      </header>

      {proposals.length === 0 ? (
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          No proposals yet. Browse{' '}
          <Link href="/synapse/declarations" className="text-[color:var(--color-accent)] hover:underline">
            declarations
          </Link>{' '}
          and propose an allocation from a surplus detail page.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)] rounded border border-[color:var(--color-rule)]">
          {proposals.map((p) => {
            const pendingConsents = p.consents.filter((c) => c.status === 'pending').length;
            return (
              <li key={p.id}>
                <Link
                  href={`/synapse/allocations/${p.id}` as Route}
                  className="flex items-start justify-between px-4 py-4 transition-colors hover:bg-[color:var(--color-paper-deep)]"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-(length:--text-caption) font-medium ${STATUS_COLOR[p.status] ?? ''}`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      <span className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                        {RESOURCE_LABEL[p.surplusResourceType] ?? p.surplusResourceType}
                        {' from '}
                        {p.surplusProducerName}
                      </span>
                    </div>
                    <div className="metadata mt-1 tabular text-[color:var(--color-muted)]">
                      Proposed by {p.proposerDisplayName ?? 'unknown'}
                      {p.quantity ? ` · ${p.quantity}` : ''}
                    </div>
                  </div>
                  {p.status === 'proposed' && pendingConsents > 0 ? (
                    <span className="shrink-0 text-(length:--text-caption) text-amber-600">
                      {pendingConsents} pending
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
