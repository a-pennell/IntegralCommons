import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { inviteMemberAction } from './action';

type RouteParams = { spaceSlug: string };
type SearchParams = { error?: string; sent?: string };

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/invite`)}`);
  }

  const result = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!result) notFound();
  const { space } = result;
  const { error, sent } = await searchParams;

  return (
    <main className="mx-auto max-w-xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.name}
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">Invite a member</h1>

      {sent ? (
        <p className="mb-4 border-l-2 border-[color:var(--color-accent)] pl-4 text-sm">
          Invitation sent to <strong>{sent}</strong>. It expires in 14 days.
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
      ) : null}

      <form action={inviteMemberAction} className="flex flex-col gap-3">
        <input type="hidden" name="spaceId" value={space.id} />
        <label htmlFor="email" className="flex flex-col gap-1">
          <span className="text-sm">Email address</span>
          <input
            id="email"
            name="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            className="border border-[color:var(--color-rule)] bg-white p-2"
          />
        </label>
        <button
          type="submit"
          className="mt-2 bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
        >
          Send invitation
        </button>
      </form>

      <p className="mt-8 text-sm text-[color:var(--color-muted)]">
        The invitee will receive a link. When they click it they become an active member of this
        Space. There are no tiered roles — any member can invite others.
      </p>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'conflict':
      return 'That email is already a member, or has a pending invitation.';
    case 'not_authorized':
      return 'You must be an active member of this Space to invite others.';
    case 'invalid':
      return 'That email address does not look valid.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
