import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { createNeighborhoodAction } from './action';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';

export default async function NewNeighborhoodPage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/neighborhoods/new');

  return (
    <main className="mx-auto max-w-xl px-6 py-16 sm:px-10 sm:py-20">
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Start a neighborhood
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          You become the first steward. A template charter is seeded automatically.
        </p>
      </header>

      <form action={createNeighborhoodAction} className="space-y-8">
        <Field
          id="name"
          name="name"
          label="Neighborhood name"
          type="text"
          required
          minLength={1}
          maxLength={200}
          placeholder="Eastside Commons"
        />
        <Field
          id="slug"
          name="slug"
          label="URL slug"
          type="text"
          required
          minLength={1}
          maxLength={80}
          placeholder="eastside-commons"
          hint="Lowercase letters, numbers, and hyphens. Cannot be changed later."
        />
        <Field
          id="description"
          name="description"
          label="Description"
          type="text"
          maxLength={300}
          placeholder="A mutual aid network for the Eastside neighborhood"
        />
        <div className="pt-2">
          <Button type="submit">Create neighborhood</Button>
        </div>
      </form>
    </main>
  );
}
