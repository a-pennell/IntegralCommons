import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { getResourceById } from '@/server/resources';
import { updateResourceStatusAction } from './action';

type RouteParams = { neighborhoodSlug: string; resourceId: string };
type SearchParams = { error?: string };

const KIND_LABEL: Record<string, string> = {
  tool: 'Tool',
  space: 'Space',
  skill: 'Skill',
  material: 'Material',
  other: 'Other',
};

export default async function ResourceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug, resourceId } = await params;
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/resources/${resourceId}`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const resource = await getResourceById(resourceId);
  if (!resource || resource.neighborhoodId !== result.neighborhood.id) notFound();

  const isOwner = resource.offeredByMemberId === session.value.memberId;
  const back = `/neighborhoods/${neighborhoodSlug}/resources` as Route;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <a
        href={back}
        className="mb-6 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
      >
        ← Resources
      </a>

      <div className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            {KIND_LABEL[resource.kind] ?? resource.kind}
          </span>
          {resource.status !== 'available' ? (
            <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
              {resource.status}
            </span>
          ) : null}
        </div>

        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          {resource.title}
        </h1>

        {resource.description ? (
          <p className="mt-3 text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
            {resource.description}
          </p>
        ) : null}

        {resource.locationHint ? (
          <p className="metadata mt-4 text-[color:var(--color-muted)]">{resource.locationHint}</p>
        ) : null}

        {resource.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[color:var(--color-rule)] px-2.5 py-0.5 text-(length:--text-caption) text-[color:var(--color-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {error === 'not_yours' ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-(length:--text-small) text-red-700">
            You can only change the status of your own resources.
          </div>
        ) : null}

        {isOwner ? (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-[color:var(--color-rule)] pt-4">
            {resource.status === 'available' ? (
              <form action={updateResourceStatusAction}>
                <input type="hidden" name="resourceId" value={resourceId} />
                <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                <input type="hidden" name="status" value="unavailable" />
                <button
                  type="submit"
                  className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
                >
                  Mark unavailable
                </button>
              </form>
            ) : resource.status === 'unavailable' ? (
              <form action={updateResourceStatusAction}>
                <input type="hidden" name="resourceId" value={resourceId} />
                <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                <input type="hidden" name="status" value="available" />
                <button
                  type="submit"
                  className="rounded border border-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent-soft)]"
                >
                  Mark available
                </button>
              </form>
            ) : null}

            {resource.status !== 'removed' ? (
              <form action={updateResourceStatusAction}>
                <input type="hidden" name="resourceId" value={resourceId} />
                <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                <input type="hidden" name="status" value="removed" />
                <button
                  type="submit"
                  className="text-(length:--text-small) text-[color:var(--color-muted)] underline underline-offset-2 hover:text-[color:var(--color-ink)]"
                >
                  Remove listing
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <p className="mt-5 border-t border-[color:var(--color-rule)] pt-4 text-(length:--text-small) text-[color:var(--color-muted)]">
            Contact a steward to arrange access.
          </p>
        )}
      </div>
    </main>
  );
}
