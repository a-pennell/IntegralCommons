import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { listDelegationsForSpace } from '@/server/delegations';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { revokeDelegationAction } from './action';

type RouteParams = { spaceSlug: string };

export default async function DelegationsPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/delegations`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const activeDelegations = await listDelegationsForSpace({
    spaceId: space.space.id,
    includeRevoked: false,
  });

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name}
      </div>
      <h1 className="mb-2 text-3xl font-[var(--font-display)]">Delegations</h1>
      <p className="mb-8 text-sm text-[color:var(--color-muted)]">
        Active delegations — each capability a Member holds on a specific Issue or space-wide. Every
        delegation is revocable (CR-005). To grant a new delegation, open an Issue and drive it to a
        Decision Record.
      </p>

      {activeDelegations.length === 0 ? (
        <p className="text-[color:var(--color-muted)]">
          No active delegations. During Bootstrap, the founder implicitly holds facilitation for the
          Bootstrap Issue — once that Issue is decided, subsequent delegations must be granted via a
          Decision Record.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)]">
          {activeDelegations.map((d) => (
            <li key={d.id} className="flex items-start justify-between gap-3 py-4">
              <div>
                <div className="text-lg font-[var(--font-display)]">
                  {d.granteeDisplayName ?? '[removed member]'}
                </div>
                <div className="text-sm text-[color:var(--color-muted)]">
                  <span className="font-mono text-xs tracking-[0.15em] uppercase">
                    {d.capability}
                  </span>
                  {' · '}
                  {d.issueId ? 'per-Issue' : 'space-wide'}
                  {' · granted via '}
                  <span className="font-mono">{d.grantedByType.replace(/_/g, ' ')}</span>
                  {d.expiresAt ? (
                    <>
                      {' · expires '}
                      {d.expiresAt.toISOString().slice(0, 10)}
                    </>
                  ) : null}
                </div>
              </div>
              <form action={revokeDelegationAction}>
                <input type="hidden" name="delegationId" value={d.id} />
                <input type="hidden" name="spaceSlug" value={space.space.slug} />
                <button
                  type="submit"
                  className="border border-[color:var(--color-ink)] px-3 py-1 text-xs"
                >
                  Revoke
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
