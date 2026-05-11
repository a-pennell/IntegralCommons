import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember, listMembersForNeighborhood } from '@/server/neighborhoods';
import { updateRoleAction } from './action';

type RouteParams = { neighborhoodSlug: string };

const ROLE_LABEL: Record<string, string> = {
  steward: 'Steward',
  member: 'Member',
  anonymous: 'Anonymous',
};

export default async function StewardshipMembersPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/stewardship/members`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) redirect('/');
  if (result.membership.role !== 'steward') {
    redirect(`/neighborhoods/${neighborhoodSlug}/stewardship`);
  }

  const neighborhoodMembers = await listMembersForNeighborhood(result.neighborhood.id);
  const back = `/neighborhoods/${neighborhoodSlug}/stewardship` as Route;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 border-b border-[color:var(--color-rule)] pb-5">
        <a
          href={back}
          className="mb-4 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          ← Stewardship Record
        </a>
        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Manage Members
        </h1>
        <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
          Promote members to steward or return stewards to member status.
        </p>
      </header>

      <div className="divide-y divide-[color:var(--color-rule)]">
        {neighborhoodMembers.map(({ member, membership }) => {
          const isMe = member.id === session.value.memberId;
          const canChange = !isMe && membership.role !== 'anonymous';

          return (
            <div key={membership.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                  {member.displayName ?? '(unnamed)'}
                  {isMe ? (
                    <span className="ml-2 text-(length:--text-caption) font-normal text-[color:var(--color-muted)]">
                      you
                    </span>
                  ) : null}
                </div>
                <div className="metadata mt-0.5 text-[color:var(--color-muted)]">
                  {ROLE_LABEL[membership.role] ?? membership.role}
                </div>
              </div>

              {canChange ? (
                <form action={updateRoleAction}>
                  <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                  <input type="hidden" name="membershipId" value={membership.id} />
                  <input
                    type="hidden"
                    name="role"
                    value={membership.role === 'steward' ? 'member' : 'steward'}
                  />
                  <button
                    type="submit"
                    className={`rounded border px-3 py-1 text-(length:--text-caption) font-[var(--font-display)] font-medium transition-colors ${
                      membership.role === 'steward'
                        ? 'border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)]'
                        : 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)] hover:bg-blue-100'
                    }`}
                  >
                    {membership.role === 'steward' ? 'Remove steward' : 'Make steward'}
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>
    </main>
  );
}
