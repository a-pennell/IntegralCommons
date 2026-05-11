import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { addResourceAction } from './action';

type RouteParams = { neighborhoodSlug: string };
type SearchParams = { error?: string };

const KINDS = [
  { value: 'tool', label: 'Tool' },
  { value: 'space', label: 'Space' },
  { value: 'skill', label: 'Skill' },
  { value: 'material', label: 'Material' },
  { value: 'other', label: 'Other' },
] as const;

export default async function AddResourcePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug } = await params;
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/resources/new`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect('/');

  const back = `/neighborhoods/${neighborhoodSlug}/resources` as Route;

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
          ← Resources
        </a>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Add a Resource
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          List something the neighborhood can borrow, use, or access.
        </p>
      </header>

      {error ? (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          Something went wrong. Please try again.
        </div>
      ) : null}

      <form action={addResourceAction} className="flex flex-col gap-5">
        <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />

        {/* Kind */}
        <fieldset>
          <legend className="mb-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
            Kind
          </legend>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <label
                key={k.value}
                className="flex cursor-pointer items-center gap-2 rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] has-[:checked]:border-[color:var(--color-accent)] has-[:checked]:bg-[color:var(--color-accent-soft)] has-[:checked]:text-[color:var(--color-accent)]"
              >
                <input
                  type="radio"
                  name="kind"
                  value={k.value}
                  defaultChecked={k.value === 'tool'}
                  className="sr-only"
                />
                {k.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Name <span className="text-[color:var(--color-accent)]">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            placeholder="e.g. 6-foot ladder, Back garden for events, Spanish tutoring"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Description{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={2000}
            placeholder="Condition, availability, any special instructions…"
            className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Location hint */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="locationHint"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Location hint{' '}
            <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <input
            id="locationHint"
            name="locationHint"
            type="text"
            maxLength={200}
            placeholder="e.g. Corner of Oak & 3rd, Unit 4B, contact me to arrange"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tags"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Tags{' '}
            <span className="font-normal text-[color:var(--color-muted)]">
              (optional, comma-separated)
            </span>
          </label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="e.g. weekend, garden, kids"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-[color:var(--color-rule)] pt-5">
          <button
            type="submit"
            className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Add resource
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
