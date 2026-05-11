import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { postNeedOfferAction } from './action';

type RouteParams = { neighborhoodSlug: string };
type SearchParams = { error?: string };

export default async function PostNeedOfferPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug } = await params;
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/needs-offers/new`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect('/');

  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers` as Route;

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
          ← Needs &amp; Offers
        </a>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Post a Need or Offer
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          Ask for what you need. Offer what you can share.
        </p>
      </header>

      {error ? (
        <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          Something went wrong. Please try again.
        </div>
      ) : null}

      <form action={postNeedOfferAction} className="flex flex-col gap-5">
        <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />

        {/* Type selector */}
        <fieldset>
          <legend className="mb-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
            Type
          </legend>
          <div className="flex gap-3">
            {(['need', 'offer'] as const).map((t) => (
              <label
                key={t}
                className="flex cursor-pointer items-center gap-2 rounded border border-[color:var(--color-rule)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] has-[:checked]:border-[color:var(--color-accent)] has-[:checked]:bg-[color:var(--color-accent-soft)] has-[:checked]:text-[color:var(--color-accent)]"
              >
                <input
                  type="radio"
                  name="type"
                  value={t}
                  defaultChecked={t === 'need'}
                  className="sr-only"
                />
                {t.charAt(0).toUpperCase() + t.slice(1)}
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
            Title <span className="text-[color:var(--color-accent)]">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={200}
            placeholder="e.g. Ladder borrow for weekend, Spanish tutoring, Garden space to share"
            className="rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="body"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Details <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <textarea
            id="body"
            name="body"
            rows={4}
            maxLength={2000}
            placeholder="More context about what you need or can offer, availability, any conditions…"
            className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Expires at */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="expiresAt"
            className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
          >
            Expires <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
          </label>
          <input
            id="expiresAt"
            name="expiresAt"
            type="date"
            className="w-48 rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
          />
        </div>

        {/* Urgency */}
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="isUrgent"
            className="h-4 w-4 rounded border-[color:var(--color-rule)] accent-[color:var(--color-accent)]"
          />
          <span className="text-(length:--text-small) font-[var(--font-display)] text-[color:var(--color-ink)]">
            Mark as urgent
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center gap-3 border-t border-[color:var(--color-rule)] pt-5">
          <button
            type="submit"
            className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Post
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
