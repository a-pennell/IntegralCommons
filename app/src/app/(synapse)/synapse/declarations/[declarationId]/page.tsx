import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getDeclarationById } from '@/server/synapse';
import { withdrawDeclarationAction } from './action';

type RouteParams = { declarationId: string };

const RESOURCE_LABEL: Record<string, string> = {
  vegetables: 'Vegetables', fruit: 'Fruit', grains: 'Grains', legumes: 'Legumes',
  herbs: 'Herbs', dairy: 'Dairy', eggs: 'Eggs', meat: 'Meat', honey: 'Honey',
  seeds: 'Seeds', other: 'Other',
};

const TERMS_LABEL: Record<string, string> = {
  free: 'Free', exchange: 'Exchange', cost_recovery: 'Cost recovery',
};

export default async function DeclarationDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { declarationId } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/synapse/declarations/${declarationId}`);

  const declaration = await getDeclarationById(declarationId);
  if (!declaration) notFound();

  const isOwner = declaration.producer.managedByMemberId === session.value.memberId;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-form) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <a
          href="/synapse/declarations"
          className="mb-4 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          ← Declarations
        </a>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-(length:--text-caption) font-medium ${
                  declaration.kind === 'surplus'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {declaration.kind === 'surplus' ? 'Surplus' : 'Shortage'}
              </span>
              <span className="text-(length:--text-caption) text-[color:var(--color-muted)]">
                {RESOURCE_LABEL[declaration.resourceType]}
              </span>
            </div>
            <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
              {declaration.resourceDetail ?? RESOURCE_LABEL[declaration.resourceType]}
            </h1>
            <Link
              href={`/synapse/producers/${declaration.producerId}` as Route}
              className="mt-1 block text-(length:--text-small) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
            >
              {declaration.producer.orgName} · {declaration.producer.locationDescription}
            </Link>
          </div>
          {isOwner && declaration.status === 'active' ? (
            <form action={withdrawDeclarationAction}>
              <input type="hidden" name="declarationId" value={declarationId} />
              <button
                type="submit"
                className="shrink-0 rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-caption) font-[var(--font-display)] font-medium text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
              >
                Withdraw
              </button>
            </form>
          ) : null}
        </div>
      </header>

      <dl className="space-y-4">
        {declaration.quantity && declaration.unit ? (
          <div>
            <dt className="metadata text-[color:var(--color-muted)]">Quantity</dt>
            <dd className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
              {declaration.quantity} {declaration.unit}
            </dd>
          </div>
        ) : null}

        <div>
          <dt className="metadata text-[color:var(--color-muted)]">Exchange terms</dt>
          <dd className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
            {TERMS_LABEL[declaration.exchangeTerms] ?? declaration.exchangeTerms}
          </dd>
        </div>

        <div>
          <dt className="metadata text-[color:var(--color-muted)]">Availability</dt>
          <dd className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
            From {declaration.availableFrom}
            {declaration.availableUntil ? ` · Until ${declaration.availableUntil}` : ' · No end date'}
          </dd>
        </div>

        {declaration.locationDescription ? (
          <div>
            <dt className="metadata text-[color:var(--color-muted)]">Collection / delivery</dt>
            <dd className="mt-0.5 text-(length:--text-small) text-[color:var(--color-ink)]">
              {declaration.locationDescription}
            </dd>
          </div>
        ) : null}

        {declaration.conditions ? (
          <div>
            <dt className="metadata text-[color:var(--color-muted)]">Conditions</dt>
            <dd className="mt-0.5 text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
              {declaration.conditions}
            </dd>
          </div>
        ) : null}
      </dl>

      {declaration.status === 'active' && !isOwner ? (
        <div className="mt-8 border-t border-[color:var(--color-rule)] pt-6">
          <Link
            href={`/synapse/allocations/new?surplusId=${declarationId}` as Route}
            className="inline-block rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Propose allocation
          </Link>
          <p className="mt-2 text-(length:--text-caption) text-[color:var(--color-muted)]">
            A proposal is not a commitment. All parties must consent before anything is confirmed.
          </p>
        </div>
      ) : null}
    </main>
  );
}
