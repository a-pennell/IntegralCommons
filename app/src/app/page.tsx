import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { spaces, memberships, neighborhoods, neighborhoodMemberships } from '@/db/schema';
import { requireSession } from '@/server/auth';
import type { Route } from 'next';

export default async function HubPage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const memberId = session.value.memberId;

  // Load all spaces and neighborhoods the member belongs to, in parallel.
  const [mySpaces, myNeighborhoods] = await Promise.all([
    db
      .select({
        slug: spaces.slug,
        name: spaces.name,
        bootstrapCompletedAt: spaces.bootstrapCompletedAt,
      })
      .from(spaces)
      .innerJoin(
        memberships,
        and(eq(memberships.spaceId, spaces.id), eq(memberships.memberId, memberId)),
      )
      .orderBy(spaces.name),
    db
      .select({
        slug: neighborhoods.slug,
        name: neighborhoods.name,
      })
      .from(neighborhoods)
      .innerJoin(
        neighborhoodMemberships,
        and(
          eq(neighborhoodMemberships.neighborhoodId, neighborhoods.id),
          eq(neighborhoodMemberships.memberId, memberId),
          isNull(neighborhoodMemberships.leftAt),
        ),
      )
      .where(eq(neighborhoods.status, 'active'))
      .orderBy(neighborhoods.name),
  ]);

  // If the member has exactly one space and no neighborhoods, go straight in.
  if (mySpaces.length === 1 && myNeighborhoods.length === 0) {
    redirect(`/spaces/${mySpaces[0]!.slug}` as Route);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:px-10 sm:py-20">
      <header className="mb-12">
        <h1 className="text-(length:--text-title) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          ICOS
        </h1>
        <p className="mt-2 text-(length:--text-lede) text-[color:var(--color-ink-soft)] italic">
          Your neighborhood operating system.
        </p>
      </header>

      {mySpaces.length > 0 ? (
        <section className="mb-12">
          <div className="eyebrow mb-4">CommonGround · Governance</div>
          <ul className="divide-y divide-[color:var(--color-rule)] border-y border-[color:var(--color-rule)]">
            {mySpaces.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/spaces/${s.slug}` as Route}
                  className="flex items-baseline justify-between px-1 py-4 transition-colors hover:bg-[color:var(--color-paper-deep)]"
                >
                  <span className="font-[var(--font-display)] font-semibold text-(length:--text-body) text-[color:var(--color-ink)]">
                    {s.name}
                  </span>
                  <span className="metadata text-[color:var(--color-muted)]">
                    {s.bootstrapCompletedAt ? 'In session' : 'In recess'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Link
              href={'/spaces/new' as Route}
              className="text-(length:--text-small) text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-accent)]"
            >
              + New space
            </Link>
          </div>
        </section>
      ) : (
        <section className="mb-12">
          <div className="eyebrow mb-4">CommonGround · Governance</div>
          <p className="mb-3 text-(length:--text-body) text-[color:var(--color-ink-soft)]">
            You&rsquo;re not a member of any deliberation space yet.
          </p>
          <Link
            href={'/spaces/new' as Route}
            className="text-(length:--text-body) font-[var(--font-display)] font-semibold text-[color:var(--color-accent)] hover:underline"
          >
            Create a space
          </Link>
        </section>
      )}

      <section>
        <div className="eyebrow mb-4">Local Commons · Neighborhoods</div>
        {myNeighborhoods.length > 0 ? (
          <>
            <ul className="divide-y divide-[color:var(--color-rule)] border-y border-[color:var(--color-rule)]">
              {myNeighborhoods.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/neighborhoods/${n.slug}` as Route}
                    className="block px-1 py-4 font-[var(--font-display)] font-semibold text-(length:--text-body) text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
                  >
                    {n.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <Link
                href={'/neighborhoods/new' as Route}
                className="text-(length:--text-small) text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-accent)]"
              >
                + New neighborhood
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 text-(length:--text-body) text-[color:var(--color-ink-soft)]">
              You&rsquo;re not part of any neighborhood yet.
            </p>
            <Link
              href={'/neighborhoods/new' as Route}
              className="text-(length:--text-body) font-[var(--font-display)] font-semibold text-[color:var(--color-accent)] hover:underline"
            >
              Start a neighborhood
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
