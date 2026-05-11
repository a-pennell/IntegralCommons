import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { writeEntryAction } from './action';

type RouteParams = { neighborhoodSlug: string };
type SearchParams = { error?: string };

const ENTRY_TYPES = [
  { value: 'action_taken', label: 'Action taken', description: 'Something you did for the neighborhood' },
  { value: 'member_care', label: 'Care check', description: 'Checking in with a member' },
  { value: 'resource_noted', label: 'Resource noted', description: 'An observation about a shared resource' },
  { value: 'charter_note', label: 'Charter note', description: 'Relating to the neighborhood\'s governing agreements' },
  { value: 'handover', label: 'Steward handover', description: 'Transitioning steward responsibilities' },
] as const;

export default async function NewStewardshipEntryPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug } = await params;
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/stewardship/new`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect('/');
  if (result.membership.role !== 'steward') {
    redirect(`/neighborhoods/${neighborhoodSlug}/stewardship`);
  }

  const back = `/neighborhoods/${neighborhoodSlug}/stewardship` as Route;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-form) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <a
          href={back}
          className="mb-4 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          ← Stewardship Record
        </a>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Add Entry
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          Append-only. Record what happened — not whether it was done well.
        </p>
      </header>

      {error ? (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          {error === 'not_steward'
            ? 'Only stewards can add entries.'
            : 'Something went wrong. Please try again.'}
        </div>
      ) : null}

      <form action={writeEntryAction} className="flex flex-col gap-5">
        <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />

        <fieldset>
          <legend className="mb-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
            Entry type
          </legend>
          <div className="flex flex-col gap-2">
            {ENTRY_TYPES.map((t) => (
              <label
                key={t.value}
                className="flex cursor-pointer items-start gap-3 rounded border border-[color:var(--color-rule)] px-4 py-3 has-[:checked]:border-[color:var(--color-accent)] has-[:checked]:bg-[color:var(--color-accent-soft)]"
              >
                <input
                  type="radio"
                  name="entryType"
                  value={t.value}
                  defaultChecked={t.value === 'action_taken'}
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

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="notes"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Notes <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            maxLength={2000}
            placeholder="What happened? Keep it factual and non-evaluative."
            className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 border-t border-[color:var(--color-rule)] pt-5">
          <button
            type="submit"
            className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Add entry
          </button>
          <a
            href={back}
            className="text-(length:--text-small) text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            Cancel
          </a>
        </div>
      </form>
    </main>
  );
}
