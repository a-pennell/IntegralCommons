import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listAllNeighborhoods } from '@/server/neighborhoods';
import { joinNeighborhoodAction } from './join/action';

export default async function NeighborhoodsPage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/neighborhoods');

  const neighborhoods = await listAllNeighborhoods(session.value.memberId);

  const mine = neighborhoods.filter((n) => n.isMember);
  const available = neighborhoods.filter((n) => !n.isMember);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-2xl px-6 py-10 sm:px-10 sm:py-12"
    >
      <header className="mb-8 flex items-start justify-between">
        <div>
          <div className="eyebrow mb-1">Local Commons</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Neighborhoods
          </h1>
        </div>
        <Link
          href={'/neighborhoods/new' as Route}
          className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
        >
          + New
        </Link>
      </header>

      {mine.length > 0 ? (
        <section className="mb-10">
          <div className="eyebrow mb-3 text-[color:var(--color-muted)]">Yours</div>
          <ul className="divide-y divide-[color:var(--color-rule)] rounded border border-[color:var(--color-rule)]">
            {mine.map((n) => (
              <li key={n.id}>
                <Link
                  href={`/neighborhoods/${n.slug}` as Route}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[color:var(--color-paper-deep)]"
                >
                  <div>
                    <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                      {n.name}
                    </div>
                    {n.description ? (
                      <div className="mt-0.5 text-(length:--text-caption) text-[color:var(--color-muted)]">
                        {n.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="metadata shrink-0 tabular text-[color:var(--color-muted)]">
                    {n.memberCount} {n.memberCount === 1 ? 'member' : 'members'}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {available.length > 0 ? (
        <section>
          <div className="eyebrow mb-3 text-[color:var(--color-muted)]">
            {mine.length > 0 ? 'Others' : 'Available to join'}
          </div>
          <ul className="divide-y divide-[color:var(--color-rule)] rounded border border-[color:var(--color-rule)]">
            {available.map((n) => (
              <li key={n.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                    {n.name}
                  </div>
                  {n.description ? (
                    <div className="mt-0.5 text-(length:--text-caption) text-[color:var(--color-muted)]">
                      {n.description}
                    </div>
                  ) : null}
                  <div className="metadata mt-0.5 tabular text-[color:var(--color-muted)]">
                    {n.memberCount} {n.memberCount === 1 ? 'member' : 'members'}
                  </div>
                </div>
                <form action={joinNeighborhoodAction} className="shrink-0 ml-4">
                  <input type="hidden" name="neighborhoodId" value={n.id} />
                  <input type="hidden" name="neighborhoodSlug" value={n.slug} />
                  <button
                    type="submit"
                    className="rounded bg-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-caption) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
                  >
                    Join
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {neighborhoods.length === 0 ? (
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          No neighborhoods yet.{' '}
          <Link
            href={'/neighborhoods/new' as Route}
            className="text-[color:var(--color-accent)] hover:underline"
          >
            Start the first one.
          </Link>
        </p>
      ) : null}
    </main>
  );
}
