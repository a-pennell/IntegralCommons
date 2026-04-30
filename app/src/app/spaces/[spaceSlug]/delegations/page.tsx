import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { listDelegationsForSpace } from '@/server/delegations';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
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
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Delegations</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          The roll
        </h1>
      </header>

      <p className="mb-12 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
        Active capabilities held by members on specific issues or space-wide. Every delegation is
        revocable. To grant a new one, open an issue and drive it to a Decision Record.
      </p>

      <section>
        <SectionHeader label="Active" count={activeDelegations.length} />

        {activeDelegations.length === 0 ? (
          <p className="border-t border-[color:var(--color-rule)] py-6 font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
            No active delegations. During Bootstrap, the founder implicitly holds facilitation for
            the Bootstrap Issue — once that Issue is decided, subsequent delegations must be granted
            via a Decision Record.
          </p>
        ) : (
          <ul className="border-t border-[color:var(--color-rule)]">
            {activeDelegations.map((d) => (
              <li
                key={d.id}
                className="flex items-baseline justify-between gap-6 border-b border-[color:var(--color-rule)] py-4"
              >
                <div className="flex flex-1 items-baseline gap-6">
                  <span className="metadata tabular text-[color:var(--color-ink)]">
                    DEL-{d.id.slice(-5).toUpperCase()}
                  </span>
                  <div className="flex-1">
                    <div className="font-[var(--font-body)] text-(length:--text-body) leading-tight text-[color:var(--color-ink)]">
                      <strong className="font-medium">
                        {d.granteeDisplayName ?? '[removed member]'}
                      </strong>
                      <span className="metadata ml-3 tabular text-[color:var(--color-accent)]">
                        {d.capability.toUpperCase()}
                      </span>
                    </div>
                    <div className="metadata mt-1 tabular">
                      {d.issueId ? 'per-issue' : 'space-wide'} · granted via{' '}
                      <span className="text-[color:var(--color-ink-soft)]">
                        {d.grantedByType.replace(/_/g, ' ')}
                      </span>
                      {d.expiresAt ? (
                        <>
                          {' · expires '}
                          <span className="text-[color:var(--color-stuart)]">
                            {formatShortDate(d.expiresAt)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
                <form action={revokeDelegationAction}>
                  <input type="hidden" name="delegationId" value={d.id} />
                  <input type="hidden" name="spaceSlug" value={space.space.slug} />
                  <Button type="submit" variant="secondary" className="px-4 py-2 text-(length:--text-small)">
                    Revoke
                  </Button>
                </form>
              </li>
            ))}
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
