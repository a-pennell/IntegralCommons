import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { listDelegationsForSpace } from '@/server/delegations';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';
import { initiateReferendumAction } from './action';

type RouteParams = { spaceSlug: string };
type SearchParams = { error?: string };

export default async function NewReferendumPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/referenda/new`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();
  const { error } = await searchParams;

  const active = await listDelegationsForSpace({
    spaceId: space.space.id,
    includeRevoked: false,
  });

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Referendum · New</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Initiate a referendum
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          Phase 1 supports referenda against active delegations. Revoking a delegation by
          referendum is the canonical expression of the Bounded Referendum Right.
        </p>
      </header>

      {error ? (
        <div className="mb-6">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      {active.length === 0 ? (
        <Note tone="info">
          There are no active delegations to target. A referendum may only be initiated against an
          active capability transfer.
        </Note>
      ) : (
        <form action={initiateReferendumAction} className="space-y-10">
          <input type="hidden" name="spaceId" value={space.space.id} />

          <fieldset>
            <legend className="eyebrow mb-3">Target delegation</legend>
            <ul className="border-t border-[color:var(--color-rule)]">
              {active.map((d) => (
                <li
                  key={d.id}
                  className="border-b border-[color:var(--color-rule)]"
                >
                  <label className="flex items-baseline gap-4 py-4 hover:bg-[color:var(--color-paper-soft)]">
                    <input
                      type="radio"
                      name="delegationId"
                      value={d.id}
                      required
                      className="mt-1 h-4 w-4 accent-[color:var(--color-accent)]"
                    />
                    <span className="flex flex-1 items-baseline justify-between gap-4">
                      <span className="font-[var(--font-body)] text-(length:--text-body) text-[color:var(--color-ink)]">
                        <strong className="font-medium">
                          {d.granteeDisplayName ?? '[removed member]'}
                        </strong>
                        <span className="ml-3 metadata tabular text-[color:var(--color-muted)]">
                          {d.capability.toUpperCase()}
                        </span>
                      </span>
                      <span className="metadata tabular">
                        {d.issueId ? 'per-issue' : 'space-wide'}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="pt-2">
            <Button type="submit">Initiate</Button>
          </div>
        </form>
      )}
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'rate_limited':
      return 'You have already initiated a referendum within the last 7 days.';
    case 'stability':
      return 'This delegation is inside its stability period — a referendum against it is temporarily blocked.';
    case 'conflict':
      return 'That delegation cannot be targeted right now.';
    case 'validation':
      return 'Something was off with the submission.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
