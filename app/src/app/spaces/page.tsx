import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listSpacesForMember } from '@/server/spaces';
import { SectionHeader } from '@/components/ui/section-header';
import { StatusStamp, type Status } from '@/components/ui/status-stamp';

export default async function SpacesLibraryPage() {
  const session = await requireSession();
  if (!session.ok) {
    redirect('/login');
  }

  const spaces = await listSpacesForMember(session.value.memberId);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-10 py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">CommonGround · Library</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)]">
          Your spaces
        </h1>
      </header>

      <section className="mb-14">
        <SectionHeader
          label="Memberships"
          count={spaces.length}
          right={
            <a
              href={'/spaces/new' satisfies Route}
              className="hover:text-[color:var(--color-accent)]"
            >
              + Charter a new space
            </a>
          }
        />

        {spaces.length === 0 ? (
          <p className="border-t border-[color:var(--color-rule)] py-6 text-(length:--text-small) text-[color:var(--color-muted)] italic">
            You are not yet a member of any Space. Charter one, or ask someone to invite you.
          </p>
        ) : (
          <ul className="border-t border-[color:var(--color-rule)]">
            {spaces.map(({ space, membership }) => {
              const convening: Status = space.bootstrapCompletedAt
                ? 'in_session'
                : 'in_recess';
              return (
                <li key={space.id} className="border-b border-[color:var(--color-rule)]">
                  <a
                    href={`/spaces/${space.slug}` as Route}
                    className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 py-5 transition-colors hover:bg-[color:var(--color-paper-soft)]"
                  >
                    <div>
                      <h2 className="text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)]">
                        {space.name}
                      </h2>
                      {space.description ? (
                        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-ink-soft)] italic">
                          {space.description}
                        </p>
                      ) : null}
                      <div className="metadata mt-2 tabular">
                        Member since{' '}
                        {membership.joinedAt
                          ? formatShortDate(membership.joinedAt)
                          : formatShortDate(membership.invitedAt)}
                      </div>
                    </div>
                    <StatusStamp status={convening} />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
