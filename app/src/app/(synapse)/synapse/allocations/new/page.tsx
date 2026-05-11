import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getDeclarationById, listActiveDeclarations } from '@/server/synapse';
import { createProposalAction } from './action';

type SearchParams = { surplusId?: string; error?: string };

const RESOURCE_LABEL: Record<string, string> = {
  vegetables: 'Vegetables', fruit: 'Fruit', grains: 'Grains', legumes: 'Legumes',
  herbs: 'Herbs', dairy: 'Dairy', eggs: 'Eggs', meat: 'Meat', honey: 'Honey',
  seeds: 'Seeds', other: 'Other',
};

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { surplusId, error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse/allocations/new');

  const [surplusDecl, shortageDeclarations] = await Promise.all([
    surplusId ? getDeclarationById(surplusId) : Promise.resolve(null),
    listActiveDeclarations().then((all) => all.filter((d) => d.kind === 'shortage')),
  ]);

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
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Propose allocation
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          A proposal is not a commitment. The surplus producer and your community must both
          consent before anything is confirmed.
        </p>
      </header>

      {error ? (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          Please fill in all required fields correctly.
        </div>
      ) : null}

      <form action={createProposalAction} className="flex flex-col gap-5">
        <input
          type="hidden"
          name="surplusDeclarationId"
          value={surplusDecl?.id ?? surplusId ?? ''}
        />

        {/* Surplus */}
        <div className="rounded border border-[color:var(--color-rule)] px-4 py-3">
          <div className="metadata mb-1 text-[color:var(--color-muted)]">Surplus</div>
          {surplusDecl ? (
            <div>
              <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                {surplusDecl.resourceDetail ?? RESOURCE_LABEL[surplusDecl.resourceType]} · {surplusDecl.producer.orgName}
              </div>
              <div className="metadata mt-0.5 text-[color:var(--color-muted)]">
                {surplusDecl.producer.locationDescription}
              </div>
            </div>
          ) : (
            <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
              No surplus selected. Go to a{' '}
              <a href="/synapse/declarations" className="text-[color:var(--color-accent)] hover:underline">
                declaration
              </a>{' '}
              and click "Propose allocation".
            </p>
          )}
        </div>

        {/* Link to a shortage declaration (optional) */}
        {shortageDeclarations.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="shortageDeclarationId"
              className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
            >
              Match to shortage{' '}
              <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
            </label>
            <select
              id="shortageDeclarationId"
              name="shortageDeclarationId"
              className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
            >
              <option value="">— None selected —</option>
              {shortageDeclarations.map((d) => (
                <option key={d.id} value={d.id}>
                  {RESOURCE_LABEL[d.resourceType]} shortage · {d.producer.orgName}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Quantity */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="quantity"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Proposed quantity{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min="0"
            step="0.01"
            placeholder="Leave blank to propose the full declared amount"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notes"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Notes{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={1000}
            placeholder="Context for why this allocation makes sense…"
            className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-[color:var(--color-rule)] pt-5">
          <button
            type="submit"
            disabled={!surplusDecl}
            className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)] disabled:opacity-40"
          >
            Submit proposal
          </button>
          <a
            href="/synapse/allocations"
            className="text-(length:--text-small) text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
