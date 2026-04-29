import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { createSpaceAction } from './action';

type SearchParams = { error?: string };

export default async function NewSpacePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  if (!session.ok) {
    redirect('/login?next=/spaces/new');
  }

  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">Create a Space</h1>

      {error ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
      ) : null}

      <form action={createSpaceAction} className="flex flex-col gap-4">
        <label htmlFor="name" className="flex flex-col gap-1">
          <span className="text-sm">Name</span>
          <input
            id="name"
            name="name"
            required
            minLength={1}
            maxLength={100}
            className="border border-[color:var(--color-rule)] bg-white p-2"
          />
        </label>

        <label htmlFor="description" className="flex flex-col gap-1">
          <span className="text-sm">
            Description <span className="text-[color:var(--color-muted)]">(optional)</span>
          </span>
          <textarea
            id="description"
            name="description"
            maxLength={1000}
            rows={4}
            className="border border-[color:var(--color-rule)] bg-white p-2"
          />
        </label>

        <button
          type="submit"
          className="mt-2 bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
        >
          Create
        </button>
      </form>

      <p className="mt-8 text-sm text-[color:var(--color-muted)]">
        You become the Space&rsquo;s first Member. Your next step will be to complete the Bootstrap
        decision — the Issue &ldquo;How should we make decisions?&rdquo;
      </p>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'invalid_name':
      return 'Space names must be 1–100 characters.';
    case 'conflict':
      return 'A Space with that name already exists. Please choose another.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
