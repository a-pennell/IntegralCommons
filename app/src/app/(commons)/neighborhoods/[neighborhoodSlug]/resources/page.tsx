import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listResourcesForNeighborhood } from '@/server/resources';
import { ResourcesView } from '@/components/local-commons/resources-view';

type RouteParams = { neighborhoodSlug: string };

export default async function ResourcesPage({ params }: { params: Promise<RouteParams> }) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/resources`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const resources = await listResourcesForNeighborhood(result.neighborhood.id);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-center justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Registry</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Resources
          </h1>
        </div>
        <a
          href={`/neighborhoods/${neighborhoodSlug}/resources/new`}
          className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
        >
          + Add
        </a>
      </header>

      <ResourcesView resources={resources} neighborhoodSlug={neighborhoodSlug} />
    </main>
  );
}
