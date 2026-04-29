import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { listDelegationsForSpace } from '@/server/delegations';
import { getSpaceBySlugForMember } from '@/server/spaces';
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
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name}
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">Initiate a Referendum</h1>

      {error ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
      ) : null}

      <p className="mb-4 text-sm text-[color:var(--color-muted)]">
        Phase 1 supports referenda against active delegations. Revoking a delegation by referendum
        is the canonical CR-005 expression. Additional targets (Decision Records, governance-profile
        changes) land in M4/M5.
      </p>

      {active.length === 0 ? (
        <p className="text-[color:var(--color-muted)]">
          There are no active delegations to target.
        </p>
      ) : (
        <form action={initiateReferendumAction} className="flex flex-col gap-4">
          <input type="hidden" name="spaceId" value={space.space.id} />

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm">Target delegation</legend>
            {active.map((d) => (
              <label key={d.id} className="flex items-start gap-2 text-sm">
                <input type="radio" name="delegationId" value={d.id} required />
                <span>
                  <strong>{d.granteeDisplayName ?? '[removed member]'}</strong>{' '}
                  <span className="font-mono text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
                    {d.capability}
                  </span>{' '}
                  {d.issueId ? '(per-Issue)' : '(space-wide)'}
                </span>
              </label>
            ))}
          </fieldset>

          <button
            type="submit"
            className="mt-2 self-start bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
          >
            Initiate
          </button>
        </form>
      )}
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'rate_limited':
      return 'You have already initiated a referendum within the last 7 days (CR-009).';
    case 'stability':
      return 'This delegation is inside its stability period — a referendum against it is temporarily blocked (CR-008).';
    case 'conflict':
      return 'That delegation cannot be targeted right now.';
    case 'validation':
      return 'Something was off with the submission.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
