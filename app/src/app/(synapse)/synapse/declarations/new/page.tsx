import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getProducerByMember } from '@/server/synapse';
import { createDeclarationAction } from './action';

type SearchParams = { error?: string };

const RESOURCE_TYPES = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'grains', label: 'Grains' },
  { value: 'legumes', label: 'Legumes' },
  { value: 'herbs', label: 'Herbs' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'meat', label: 'Meat' },
  { value: 'honey', label: 'Honey' },
  { value: 'seeds', label: 'Seeds' },
  { value: 'other', label: 'Other' },
] as const;

const EXCHANGE_TERMS = [
  { value: 'free', label: 'Free', description: 'No expectation of return' },
  { value: 'exchange', label: 'Exchange', description: 'Goods, labour, or skills in return' },
  { value: 'cost_recovery', label: 'Cost recovery', description: 'Cover direct costs only' },
] as const;

export default async function NewDeclarationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse/declarations/new');

  const producer = await getProducerByMember(session.value.memberId);
  if (!producer) redirect('/synapse/producers/new');

  const today = new Date().toISOString().split('T')[0]!;

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
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          New declaration
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          Declaring as <span className="font-medium text-[color:var(--color-ink)]">{producer.orgName}</span>.
          Declarations are visible to everyone in Synapse.
        </p>
      </header>

      {error ? (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          Please fill in all required fields correctly.
        </div>
      ) : null}

      <form action={createDeclarationAction} className="flex flex-col gap-5">
        {/* Kind */}
        <fieldset>
          <legend className="mb-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
            Declaration type
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {(['surplus', 'shortage'] as const).map((k) => (
              <label
                key={k}
                className="flex cursor-pointer items-center gap-3 rounded border border-[color:var(--color-rule)] px-4 py-3 has-[:checked]:border-[color:var(--color-accent)] has-[:checked]:bg-[color:var(--color-accent-soft)]"
              >
                <input
                  type="radio"
                  name="kind"
                  value={k}
                  defaultChecked={k === 'surplus'}
                  className="accent-[color:var(--color-accent)]"
                />
                <span className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] capitalize">
                  {k}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Resource type */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="resourceType"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Resource type
          </label>
          <select
            id="resourceType"
            name="resourceType"
            required
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
          >
            {RESOURCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Resource detail */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="resourceDetail"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Specific variety or detail{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <input
            id="resourceDetail"
            name="resourceDetail"
            type="text"
            maxLength={200}
            placeholder="e.g. Cox apples, heritage wheat, raw whole milk"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Quantity + unit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="quantity"
              className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
            >
              Quantity{' '}
              <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 50"
              className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="unit"
              className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
            >
              Unit{' '}
              <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
            </label>
            <input
              id="unit"
              name="unit"
              type="text"
              maxLength={30}
              placeholder="e.g. kg, tonnes, crates"
              className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Availability window */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="availableFrom"
              className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
            >
              Available from
            </label>
            <input
              id="availableFrom"
              name="availableFrom"
              type="date"
              required
              defaultValue={today}
              className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="availableUntil"
              className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
            >
              Until{' '}
              <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
            </label>
            <input
              id="availableUntil"
              name="availableUntil"
              type="date"
              className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
            />
          </div>
        </div>

        {/* Exchange terms */}
        <fieldset>
          <legend className="mb-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
            Exchange terms
          </legend>
          <div className="flex flex-col gap-2">
            {EXCHANGE_TERMS.map((t) => (
              <label
                key={t.value}
                className="flex cursor-pointer items-start gap-3 rounded border border-[color:var(--color-rule)] px-4 py-3 has-[:checked]:border-[color:var(--color-accent)] has-[:checked]:bg-[color:var(--color-accent-soft)]"
              >
                <input
                  type="radio"
                  name="exchangeTerms"
                  value={t.value}
                  defaultChecked={t.value === 'free'}
                  className="mt-0.5 accent-[color:var(--color-accent)]"
                />
                <div>
                  <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                    {t.label}
                  </div>
                  <div className="text-(length:--text-caption) text-[color:var(--color-muted)]">
                    {t.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Conditions */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="conditions"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Conditions or notes{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="conditions"
            name="conditions"
            rows={3}
            maxLength={1000}
            placeholder="Any collection requirements, handling notes, or context…"
            className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-[color:var(--color-rule)] pt-5">
          <button
            type="submit"
            className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Publish declaration
          </button>
          <a
            href="/synapse/declarations"
            className="text-(length:--text-small) text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
