import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { getCharterSections } from '@/server/commons-charter';
import { ratifySectionAction } from './[sectionId]/ratify/action';

type RouteParams = { neighborhoodSlug: string };

export default async function CharterPage({ params }: { params: Promise<RouteParams> }) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/charter`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const sections = await getCharterSections(result.neighborhood.id);
  const isSteward = result.membership.role === 'steward';

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-center justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Agreements</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Commons Charter
          </h1>
        </div>
        {isSteward ? (
          <a
            href={`/neighborhoods/${neighborhoodSlug}/charter/new`}
            className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
          >
            + Draft section
          </a>
        ) : null}
      </header>

      {sections.length === 0 ? (
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          No charter sections yet.
          {isSteward
            ? ' Use "Draft section" to add the first one.'
            : ' A steward can draft the first one.'}
        </p>
      ) : (
        <div className="divide-y divide-[color:var(--color-rule)]">
          {sections.map((s) => (
            <section key={s.id} className="py-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
                      {s.title}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-(length:--text-caption) font-medium ${
                        s.status === 'ratified'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {s.status === 'ratified' ? 'Ratified' : 'Draft'} · v{s.version}
                    </span>
                  </div>
                </div>
                {isSteward && s.status === 'draft' ? (
                  <form action={ratifySectionAction} className="shrink-0">
                    <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                    <input type="hidden" name="sectionId" value={s.id} />
                    <button
                      type="submit"
                      className="rounded border border-green-200 bg-green-50 px-3 py-1 text-(length:--text-caption) font-[var(--font-display)] font-medium text-green-700 transition-colors hover:bg-green-100"
                    >
                      Ratify
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
                {s.body}
              </p>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
