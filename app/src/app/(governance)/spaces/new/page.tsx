import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
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
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-form) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">CommonGround · Charter</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Charter a new Space
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          A Space is a small republic — a group that governs something shared. You become its first
          member. Your next step will be to complete the Bootstrap Issue: how this Space decides.
        </p>
      </header>

      {error ? (
        <div className="mb-8">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form action={createSpaceAction} className="space-y-10">
        <Field
          id="name"
          name="name"
          label="Name"
          type="text"
          required
          minLength={1}
          maxLength={100}
        />

        <Textarea
          id="description"
          name="description"
          label="Description"
          maxLength={1000}
          rows={4}
          hint="Optional. What does this Space steward, and on whose behalf?"
        />

        <div className="pt-2">
          <Button type="submit">Charter</Button>
        </div>
      </form>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'invalid_name':
      return 'Names must be between 1 and 100 characters.';
    case 'conflict':
      return 'A Space with that name already exists. Please choose another.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
