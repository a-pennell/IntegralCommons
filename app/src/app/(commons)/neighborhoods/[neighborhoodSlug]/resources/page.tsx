import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listResourcesForNeighborhood } from '@/server/resources';

type RouteParams = { neighborhoodSlug: string };

const KIND_LABEL: Record<string, string> = {
  tool: 'Tool',
  space: 'Space',
  skill: 'Skill',
  material: 'Material',
  other: 'Other',
};

export default async function ResourcesPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/resources`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const resources = await listResourcesForNeighborhood(result.neighborhood.id);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons · Resources</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Resource Registry
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          Tools, spaces, and skills available in {result.neighborhood.name}.
        </p>
      </header>

      {resources.length === 0 ? (
        <p className="text-(length:--text-body) text-[color:var(--color-ink-soft)]">
          No resources listed yet. Be the first to add one.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {resources.map((r) => (
            <li key={r.id} className="py-5">
              <div className="flex items-baseline gap-3">
                <span className="metadata text-[color:var(--color-muted)]">
                  {KIND_LABEL[r.kind] ?? r.kind}
                </span>
                <span className="font-[var(--font-display)] font-semibold text-(length:--text-body) text-[color:var(--color-ink)]">
                  {r.title}
                </span>
              </div>
              {r.description ? (
                <p className="mt-1 text-(length:--text-body) text-[color:var(--color-ink-soft)]">
                  {r.description}
                </p>
              ) : null}
              {r.locationHint ? (
                <p className="metadata mt-2 text-[color:var(--color-muted)]">{r.locationHint}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
