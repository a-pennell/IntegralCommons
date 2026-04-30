import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Note } from '@/components/ui/note';
import { PageHeader } from '@/components/ui/page-header';
import { requestMagicLinkAction } from './action';

type SearchParams = { sent?: string; error?: string; next?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const sentTo = params.sent;
  const errorKind = params.error;
  const nextPath = params.next;

  return (
    <main className="mx-auto w-full max-w-(--container-form) px-6 py-20">
      <PageHeader
        eyebrow="Sign in"
        title="Welcome back"
        lede="No passwords. We send a single-use sign-in link to your email."
      />

      {sentTo ? (
        <div className="mb-8">
          <Note>
            A sign-in link has been sent to <strong className="font-medium">{sentTo}</strong>. It
            expires in 15 minutes and can be used once.{' '}
            <a
              className="underline decoration-[color:var(--color-accent)] underline-offset-4"
              href={'/login' satisfies Route}
            >
              Send another
            </a>
            .
          </Note>
        </div>
      ) : null}

      {errorKind ? (
        <div className="mb-8">
          <Note tone="error">{renderErrorMessage(errorKind)}</Note>
        </div>
      ) : null}

      <form action={requestMagicLinkAction} className="flex flex-col gap-8">
        <Field
          id="email"
          name="email"
          label="Email address"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
        />
        {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
        <div className="pt-2">
          <Button type="submit">Send sign-in link</Button>
        </div>
      </form>

      <footer className="mt-16 border-t border-[color:var(--color-rule)] pt-8">
        <p className="text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-muted)] italic">
          CommonGround uses magic-link sign-in. Every link is single-use and expires after fifteen
          minutes.
        </p>
        <p className="mt-4 text-(length:--text-small) leading-(--text-small--line-height)">
          <a
            href="/framework"
            className="text-[color:var(--color-ink-soft)] underline underline-offset-4 hover:text-[color:var(--color-accent)]"
          >
            Read the Governance Framework
          </a>
        </p>
      </footer>
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
    case 'invalid_token':
      return 'That sign-in link is no longer valid. Magic links are single-use and expire fifteen minutes after they are sent.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
