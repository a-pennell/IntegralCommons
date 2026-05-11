import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listTransactionsForMember, computeBalance } from '@/server/time-credits';

type RouteParams = { neighborhoodSlug: string };

const TYPE_LABEL: Record<string, string> = {
  earned: 'Earned',
  spent: 'Spent',
  adjustment: 'Adjustment',
  demurrage_applied: 'Demurrage',
};

function formatAmount(tx: { transactionType: string; amountText: string }): string {
  const n = parseFloat(tx.amountText);
  const isDebit = tx.transactionType === 'spent' || tx.transactionType === 'demurrage_applied';
  const sign = isDebit ? '−' : '+';
  return `${sign}${Math.abs(n).toFixed(1)} hr${Math.abs(n) !== 1 ? 's' : ''}`;
}

function amountColor(transactionType: string): string {
  if (transactionType === 'spent' || transactionType === 'demurrage_applied') {
    return 'text-[color:var(--color-muted)]';
  }
  return 'text-[color:var(--color-accent)]';
}

export default async function CreditsPage({ params }: { params: Promise<RouteParams> }) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/credits`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const transactions = await listTransactionsForMember(
    result.neighborhood.id,
    session.value.memberId,
  );
  const balance = computeBalance(transactions);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <div className="eyebrow mb-1">Time Credits</div>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Your Credits
        </h1>
      </header>

      {/* Balance card */}
      <div className="mb-8 flex items-center gap-6 rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] px-6 py-5">
        <div>
          <div className="eyebrow mb-1">Balance</div>
          <div className="tabular text-[32px] leading-none font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            {balance.toFixed(1)}
            <span className="ml-1.5 text-(length:--text-small) font-normal text-[color:var(--color-muted)]">
              {Math.abs(balance) === 1 ? 'hr' : 'hrs'}
            </span>
          </div>
        </div>
        <div className="h-10 w-px bg-[color:var(--color-rule)]" />
        <p className="max-w-xs text-(length:--text-small) text-[color:var(--color-muted)]">
          1 hour of contribution = 1 credit. Credits are local to {result.neighborhood.name} and are
          opt-in.
        </p>
      </div>

      {/* Transaction history */}
      <section>
        <h2 className="mb-4 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          History
        </h2>

        {transactions.length === 0 ? (
          <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
            No transactions yet. Credits are recorded when exchanges are completed.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-rule)]">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 text-[10px] font-[var(--font-mono)] tracking-wider text-[color:var(--color-muted)] uppercase">
                      {TYPE_LABEL[tx.transactionType] ?? tx.transactionType}
                    </span>
                    {tx.memo ? (
                      <span className="truncate text-(length:--text-small) text-[color:var(--color-ink-soft)]">
                        {tx.memo}
                      </span>
                    ) : null}
                  </div>
                  <div className="metadata tabular mt-1 text-[color:var(--color-muted)]">
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                      tx.occurredAt,
                    )}
                  </div>
                </div>
                <span
                  className={`tabular text-(length:--text-small) font-[var(--font-mono)] font-medium ${amountColor(tx.transactionType)}`}
                >
                  {formatAmount(tx)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
