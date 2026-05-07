import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { getCharterSections } from '@/server/commons-charter';
import { Note } from '@/components/ui/note';

type RouteParams = { neighborhoodSlug: string };

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  ratified: 'Ratified',
};

export default async function CharterPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/charter`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const sections = await getCharterSections(result.neighborhood.id);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons · Charter</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Commons Charter
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          The living agreements that shape how {result.neighborhood.name} operates.
        </p>
      </header>

      {sections.length === 0 ? (
        <Note tone="info">No charter sections yet. A steward can draft the first one.</Note>
      ) : (
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id}>
              <div className="mb-3 flex items-baseline gap-3">
                <h2 className="text-(length:--text-heading) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
                  {s.title}
                </h2>
                <span className="metadata text-[color:var(--color-muted)]">
                  {STATUS_LABEL[s.status] ?? s.status} · v{s.version}
                </span>
              </div>
              <p className="text-(length:--text-body) leading-relaxed text-[color:var(--color-ink-soft)]">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
