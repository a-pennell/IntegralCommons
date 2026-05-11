import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { db } from '@/db';
import { members } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signOutAction } from './action';

export default async function AccountPage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/account');

  const memberRow = await db
    .select({ email: members.email, displayName: members.displayName })
    .from(members)
    .where(eq(members.id, session.value.memberId))
    .limit(1);

  const member = memberRow[0];
  if (!member) redirect('/login');

  return (
    <main className="mx-auto w-full max-w-(--container-form) px-6 py-20">
      <header className="mb-8 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Account</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          {member.displayName ?? 'Your account'}
        </h1>
        {member.email ? (
          <p className="mt-2 text-(length:--text-small) font-[var(--font-mono)] text-[color:var(--color-muted)]">
            {member.email}
          </p>
        ) : null}
      </header>

      <section className="mb-10 space-y-3">
        <a
          href={'/neighborhoods' satisfies Route}
          className="block rounded border border-[color:var(--color-rule)] px-4 py-3 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
        >
          My neighborhoods →
        </a>
        <a
          href={'/spaces' satisfies Route}
          className="block rounded border border-[color:var(--color-rule)] px-4 py-3 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
        >
          My governance spaces →
        </a>
      </section>

      <section className="border-t border-[color:var(--color-rule)] pt-6">
        <form action={signOutAction} className="mb-3">
          <button
            type="submit"
            className="rounded border border-[color:var(--color-rule)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
          >
            Sign out
          </button>
        </form>

        <a
          href={'/account/delete' satisfies Route}
          className="text-(length:--text-caption) text-[color:var(--color-muted)] underline underline-offset-4 hover:text-[color:var(--color-oxblood)]"
        >
          Delete account
        </a>
      </section>
    </main>
  );
}
