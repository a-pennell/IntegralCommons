import { redirect } from 'next/navigation';
import { acceptInvitation } from '@/server/spaces';
import { getSession, requireSession } from '@/server/auth';

/**
 * Invitation accept landing page.
 *
 * Flow:
 *   1. If not signed in, stash the current URL and redirect to /login?next=…
 *      After verify, the user lands back here with a session.
 *   2. Call acceptInvitation — creates Member (if needed) + Membership.
 *   3. Redirect to the Space home.
 */

type RouteParams = { token: string };

export default async function AcceptInvitationPage({ params }: { params: Promise<RouteParams> }) {
  const { token } = await params;

  const existing = await getSession();
  if (!existing) {
    // Kick to login; the post-verify page will redirect back here once signed in.
    redirect(`/login?next=${encodeURIComponent(`/accept/${token}`)}`);
  }

  // The caller is signed in but we still require session for the downstream
  // logging (and future CR enforcement).
  const session = await requireSession();
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/accept/${token}`)}`);
  }

  const result = await acceptInvitation({ plaintextToken: token });

  if (!result.ok) {
    return (
      <main className="mx-auto max-w-md p-8">
        <h1 className="mb-4 text-2xl font-[var(--font-display)]">Invitation cannot be accepted</h1>
        <p className="mb-4">{describeError(result.error.kind)}</p>
        <a href="/spaces" className="underline">
          Go to your Spaces
        </a>
      </main>
    );
  }

  redirect(`/spaces/${result.value.spaceSlug}`);
}

function describeError(kind: string): string {
  switch (kind) {
    case 'NotFound':
      return 'This invitation has expired, was already accepted, or never existed.';
    case 'Conflict':
      return 'You are already a member of this Space.';
    default:
      return 'Something went wrong. Please ask whoever invited you to send a new link.';
  }
}
