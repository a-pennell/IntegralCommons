import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listReferendaForSpace } from '@/server/referenda';
import { getSpaceBySlugForMember } from '@/server/spaces';

type RouteParams = { spaceSlug: string };

export default async function ReferendaIndexPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/referenda`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const list = await listReferendaForSpace(space.space.id);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <div className="text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
            {space.space.name}
          </div>
          <h1 className="text-3xl font-[var(--font-display)]">Referenda</h1>
        </div>
        <a
          href={`/spaces/${space.space.slug}/referenda/new` as Route}
          className="border border-[color:var(--color-ink)] px-3 py-1 text-sm"
        >
          Initiate
        </a>
      </header>

      {list.length === 0 ? (
        <p className="text-[color:var(--color-muted)]">
          No referenda yet. Referenda are the instrument for revoking delegations or overturning
          Decision Records — use them sparingly (CR-006).
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {list.map((r) => (
            <li key={r.id} className="py-3">
              <a
                href={`/spaces/${space.space.slug}/referenda/${r.id}` as Route}
                className="block hover:underline"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-sm font-[var(--font-display)]">
                    Referendum on{' '}
                    {r.targetType === 'delegation'
                      ? 'a delegation'
                      : r.targetType === 'decision_record'
                        ? 'a Decision Record'
                        : 'a governance profile change'}
                  </div>
                  <span className="font-mono text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-[color:var(--color-muted)]">
                  initiated {r.createdAt.toISOString().slice(0, 10)}
                  {r.outcome ? ` · outcome: ${r.outcome}` : null}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
