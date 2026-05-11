import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getProposalById, getDeclarationById } from '@/server/synapse';
import { respondToConsentAction } from './action';

type RouteParams = { proposalId: string };

const STATUS_LABEL: Record<string, string> = {
  proposed: 'Awaiting consent',
  consented: 'Consented',
  rejected: 'Rejected',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const RESOURCE_LABEL: Record<string, string> = {
  vegetables: 'Vegetables', fruit: 'Fruit', grains: 'Grains', legumes: 'Legumes',
  herbs: 'Herbs', dairy: 'Dairy', eggs: 'Eggs', meat: 'Meat', honey: 'Honey',
  seeds: 'Seeds', other: 'Other',
};

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { proposalId } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/synapse/allocations/${proposalId}`);

  const proposal = await getProposalById(proposalId);
  if (!proposal) notFound();

  const surplusDecl = await getDeclarationById(proposal.surplusDeclarationId);

  const myConsent = proposal.consents.find(
    (c) => c.consentingMemberId === session.value.memberId,
  );

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-form) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <a
          href="/synapse/allocations"
          className="mb-4 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          ← Allocations
        </a>
        <div className="mb-2 flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-(length:--text-caption) font-medium ${
              proposal.status === 'consented' ? 'bg-green-50 text-green-700'
              : proposal.status === 'rejected' ? 'bg-red-50 text-red-700'
              : 'bg-amber-50 text-amber-700'
            }`}
          >
            {STATUS_LABEL[proposal.status] ?? proposal.status}
          </span>
        </div>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Allocation proposal
        </h1>
      </header>

      {/* Summary */}
      <div className="mb-8 space-y-3">
        <div>
          <div className="metadata text-[color:var(--color-muted)]">Surplus</div>
          <div className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
            {RESOURCE_LABEL[proposal.surplusResourceType] ?? proposal.surplusResourceType}
            {' from '}
            <Link
              href={`/synapse/producers/${surplusDecl?.producerId}` as Route}
              className="text-[color:var(--color-accent)] hover:underline"
            >
              {proposal.surplusProducerName}
            </Link>
          </div>
        </div>

        {proposal.quantity ? (
          <div>
            <div className="metadata text-[color:var(--color-muted)]">Proposed quantity</div>
            <div className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
              {proposal.quantity}
            </div>
          </div>
        ) : null}

        <div>
          <div className="metadata text-[color:var(--color-muted)]">Proposed by</div>
          <div className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
            {proposal.proposerDisplayName ?? 'Unknown'}
          </div>
        </div>

        {proposal.notes ? (
          <div>
            <div className="metadata text-[color:var(--color-muted)]">Notes</div>
            <div className="mt-0.5 text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
              {proposal.notes}
            </div>
          </div>
        ) : null}
      </div>

      {/* Consent status */}
      <section className="mb-8">
        <h2 className="mb-3 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Consent
        </h2>
        <ul className="space-y-2">
          {proposal.consents.map((c, i) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded border border-[color:var(--color-rule)] px-4 py-3"
            >
              <div>
                <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                  Party {i + 1}
                  {c.consentingMemberId === session.value.memberId ? (
                    <span className="ml-2 font-normal text-[color:var(--color-muted)]">you</span>
                  ) : null}
                </div>
              </div>
              <span
                className={`text-(length:--text-caption) font-medium ${
                  c.status === 'consented' ? 'text-green-600'
                  : c.status === 'rejected' ? 'text-red-600'
                  : 'text-amber-600'
                }`}
              >
                {c.status === 'consented' ? 'Consented' : c.status === 'rejected' ? 'Rejected' : 'Pending'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Consent form — shown if this member has a pending consent */}
      {myConsent && myConsent.status === 'pending' && proposal.status === 'proposed' ? (
        <section className="rounded border border-[color:var(--color-rule)] px-5 py-5">
          <h2 className="mb-1 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Your response
          </h2>
          <p className="mb-4 text-(length:--text-caption) text-[color:var(--color-muted)]">
            Consenting means you agree this allocation can proceed. Rejecting ends the proposal.
          </p>
          <form action={respondToConsentAction} className="flex flex-col gap-4">
            <input type="hidden" name="proposalId" value={proposalId} />
            <input type="hidden" name="consentId" value={myConsent.id} />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="consent-notes"
                className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
              >
                Notes{' '}
                <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
              </label>
              <textarea
                id="consent-notes"
                name="notes"
                rows={2}
                maxLength={500}
                placeholder="Any conditions or context for your response…"
                className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                name="status"
                value="consented"
                className="rounded bg-green-600 px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-green-700"
              >
                Consent
              </button>
              <button
                type="submit"
                name="status"
                value="rejected"
                className="rounded border border-red-200 px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </main>
  );
}
