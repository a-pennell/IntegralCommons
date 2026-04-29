import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listSpacesForMember } from '@/server/spaces';

export default async function SpacesPage() {
  const session = await requireSession();
  if (!session.ok) {
    redirect('/login');
  }

  const spaces = await listSpacesForMember(session.value.memberId);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <header className="mb-8 flex items-start justify-between">
        <h1 className="text-3xl font-[var(--font-display)]">Your Spaces</h1>
        <a
          href={'/spaces/new' satisfies Route}
          className="border border-[color:var(--color-ink)] px-3 py-1 text-sm"
        >
          Create a Space
        </a>
      </header>

      {spaces.length === 0 ? (
        <p className="text-[color:var(--color-muted)]">
          You are not yet a member of any Space. Create one, or ask someone to invite you.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {spaces.map(({ space }) => (
            <li key={space.id} className="py-4">
              <a href={`/spaces/${space.slug}` as Route} className="block hover:underline">
                <div className="text-xl font-[var(--font-display)]">{space.name}</div>
                {space.description ? (
                  <div className="text-sm text-[color:var(--color-muted)]">{space.description}</div>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
