import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Note } from '@/components/ui/note';
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
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-form) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Invitation · New</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Invite a member
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          The invitee will receive a link. When they click it they become an active member of this
          Space. There are no tiered roles — any member can invite others.
        </p>
      </header>

      {sent ? (
        <div className="mb-8">
          <Note tone="info">
            Invitation sent to <strong className="font-medium not-italic">{sent}</strong>. It
            expires in fourteen days.
          </Note>
        </div>
      ) : null}

      {error ? (
        <div className="mb-8">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form action={inviteMemberAction} className="space-y-8">
        <input type="hidden" name="spaceId" value={space.id} />
        <Field
          id="email"
          name="email"
          label="Email address"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          placeholder="them@example.com"
        />
        <div className="pt-2">
          <Button type="submit">Send invitation</Button>
        </div>
      </form>
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
