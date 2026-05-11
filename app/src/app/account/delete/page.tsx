import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { Note } from '@/components/ui/note';
import { deleteAccountAction } from './action';

type SearchParams = { error?: string };

export default async function DeleteAccountPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/account/delete');

  return (
    <main className="mx-auto w-full max-w-(--container-form) px-6 py-20">
      <header className="mb-8 border-b-2 border-[color:var(--color-oxblood)] pb-4">
        <div className="eyebrow text-[color:var(--color-oxblood)]">Account · Delete</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Delete your account
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          This cannot be undone.
        </p>
      </header>

      {error === 'failed' ? (
        <div className="mb-6">
          <Note tone="error">Something went wrong. Please try again or contact support.</Note>
        </div>
      ) : null}

      <div className="mb-8 space-y-4 text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
        <p>
          Deleting your account removes your email address and display name from our servers. Your
          sessions are revoked immediately.
        </p>
        <p>
          Your contributions — governance perspectives, resource listings, stewardship entries, and
          Civic Memory events — remain in place. They are attributed to a <em>removed member</em>{' '}
          marker rather than your name. This is required to preserve the integrity of decision
          records that other members relied on.
        </p>
        <p>
          Neighborhood memberships are left in place. If you want to leave a neighborhood before
          deleting, do that first.
        </p>
      </div>

      <form action={deleteAccountAction}>
        <button
          type="submit"
          className="rounded bg-[color:var(--color-oxblood)] px-5 py-2.5 text-(length:--text-small) font-[var(--font-display)] font-semibold text-white hover:opacity-90"
        >
          Delete my account permanently
        </button>
      </form>

      <div className="mt-6">
        <a
          href={'/account' satisfies Route}
          className="text-(length:--text-small) text-[color:var(--color-muted)] underline underline-offset-4 hover:text-[color:var(--color-ink)]"
        >
          ← Back to account
        </a>
      </div>
    </main>
  );
}
