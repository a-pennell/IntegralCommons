import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { setSessionCookie, verifyMagicLink } from '@/server/auth';

type SearchParams = { token?: string; next?: string };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { token, next } = await searchParams;

  if (!token) {
    return renderFailure('missing_token');
  }

  const hdrs = await headers();
  const userAgent = hdrs.get('user-agent') ?? undefined;
  const ipAddress = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim();

  const result = await verifyMagicLink({
    plaintextToken: token,
    ...(userAgent !== undefined && { userAgent }),
    ...(ipAddress !== undefined && { ipAddress }),
  });

  if (!result.ok) {
    return renderFailure('invalid_or_expired');
  }

  await setSessionCookie(result.value.sessionId);
  const target = (next && /^\//.test(next) ? next : '/spaces') as Route;
  redirect(target);
}

function renderFailure(kind: 'missing_token' | 'invalid_or_expired') {
  const message =
    kind === 'missing_token'
      ? 'This sign-in URL is missing its token.'
      : 'That sign-in link is no longer valid. Magic links are single-use and expire 15 minutes after they are sent.';

  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-4 text-2xl font-[var(--font-display)]">Sign-in link could not be used</h1>
      <p className="mb-6">{message}</p>
      <a className="underline" href={'/login' satisfies Route}>
        Request a new sign-in link
      </a>
    </main>
  );
}
