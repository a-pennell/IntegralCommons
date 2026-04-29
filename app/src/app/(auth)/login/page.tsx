import { requestMagicLinkAction } from './action';
import type { Route } from 'next';

type SearchParams = { sent?: string; error?: string; next?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sentTo = params.sent;
  const errorKind = params.error;
  const nextPath = params.next;

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">Sign in</h1>

      {sentTo ? (
        <div className="mb-6 border-l-2 border-[color:var(--color-accent)] pl-4">
          <p>
            A sign-in link has been sent to <strong>{sentTo}</strong>. It expires in 15 minutes and
            can be used once.
          </p>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">
            Not seeing it? Check your spam folder, or{' '}
            <a className="underline" href={'/login' satisfies Route}>
              request another link
            </a>
            .
          </p>
        </div>
      ) : null}

      {errorKind ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">
          {renderErrorMessage(errorKind)}
        </p>
      ) : null}

      <form action={requestMagicLinkAction} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="border border-[color:var(--color-rule)] bg-white p-2"
        />
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
        <button
          type="submit"
          className="mt-2 bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
        >
          Send sign-in link
        </button>
      </form>

      <p className="mt-8 text-sm text-[color:var(--color-muted)]">
        CommonGround uses magic-link sign-in — no passwords. Every link is single-use and expires
        after 15 minutes.
      </p>
    </main>
  );
}

function renderErrorMessage(kind: string): string {
  switch (kind) {
    case 'rate_limited':
      return 'Too many sign-in attempts for this email in the last hour. Please try again later.';
    case 'dispatch_failed':
      return 'The email could not be sent right now. Please try again in a moment.';
    case 'invalid_email':
      return 'That email address does not look valid.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
