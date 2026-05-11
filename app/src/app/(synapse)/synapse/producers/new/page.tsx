import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getProducerByMember } from '@/server/synapse';
import { registerProducerAction } from './action';

type SearchParams = { error?: string };

export default async function RegisterProducerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse/producers/new');

  const existing = await getProducerByMember(session.value.memberId);
  if (existing) redirect(`/synapse/producers/${existing.id}` as Route);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-form) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <a
          href="/synapse/producers"
          className="mb-4 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          ← Producers
        </a>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Register as a producer
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          Farms, cooperatives, and food-system actors. Your profile is public by default —
          only your declared surpluses and shortages, not personal details.
        </p>
      </header>

      {error ? (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          Please fill in all required fields correctly.
        </div>
      ) : null}

      <form action={registerProducerAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="orgName"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Organisation name
          </label>
          <input
            id="orgName"
            name="orgName"
            type="text"
            required
            maxLength={120}
            placeholder="e.g. Riverside Community Farm"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="locationDescription"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Location
          </label>
          <input
            id="locationDescription"
            name="locationDescription"
            type="text"
            required
            maxLength={300}
            placeholder="e.g. Stroud valley, Gloucestershire"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bio"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            About{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={1000}
            placeholder="What do you grow or produce? What kind of exchanges work for you?"
            className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-[color:var(--color-rule)] pt-5">
          <button
            type="submit"
            className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Register
          </button>
          <a
            href="/synapse/producers"
            className="text-(length:--text-small) text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
