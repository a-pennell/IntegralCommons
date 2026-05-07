import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';
import { setCadenceAction } from './action';

type RouteParams = { spaceSlug: string };
type SearchParams = { saved?: string; error?: string };

const CADENCES = [
  { value: 'daily', label: 'Daily', desc: 'Every morning, while there is anything to report.' },
  { value: 'weekly', label: 'Weekly', desc: 'A single email summarising the past seven days.' },
  { value: 'monthly', label: 'Monthly', desc: 'A single email summarising the past month.' },
  { value: 'off', label: 'Off', desc: 'No digest. The system never pushes beyond your choice.' },
] as const;

export default async function DigestCadencePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/settings/notifications`)}`);
  }

  const found = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!found) notFound();
  const { space, membership } = found;
  const { saved, error } = await searchParams;

  const effective = (membership.digestCadence ?? space.digestCadenceDefault) as
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'off';

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Settings · Digest cadence</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          How often we write
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          A single email summarising what happened. The only push channel — no badges, no counters,
          no urgency cues. You may lower the cadence below the Space default or turn it off
          entirely; you cannot raise it above the default.
        </p>
      </header>

      <div className="mb-8">
        <Note tone="info">
          <span className="metadata tabular">Space default · {space.digestCadenceDefault}</span>
        </Note>
      </div>

      {saved ? (
        <div className="mb-6">
          <Note tone="info">
            Cadence saved · <span className="metadata tabular">{saved}</span>
          </Note>
        </div>
      ) : null}
      {error ? (
        <div className="mb-6">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form action={setCadenceAction} className="space-y-10">
        <input type="hidden" name="spaceSlug" value={space.slug} />

        <fieldset>
          <legend className="eyebrow mb-3">Your cadence</legend>
          <ul className="border-t border-[color:var(--color-rule)]">
            {CADENCES.map((c) => (
              <li key={c.value} className="border-b border-[color:var(--color-rule)]">
                <label className="flex items-baseline gap-4 py-4 hover:bg-[color:var(--color-paper-soft)]">
                  <input
                    type="radio"
                    name="cadence"
                    value={c.value}
                    defaultChecked={c.value === effective}
                    className="mt-1 h-4 w-4 accent-[color:var(--color-accent)]"
                  />
                  <span className="flex-1">
                    <span className="font-[var(--font-display)] text-(length:--text-body) font-semibold text-[color:var(--color-ink)]">
                      {c.label}
                    </span>
                    <span className="ml-3 metadata tabular text-[color:var(--color-muted)]">
                      {c.value}
                    </span>
                    <span className="mt-1 block font-[var(--font-body)] text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-ink-soft)] italic">
                      {c.desc}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>

        <div className="pt-2">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'too_frequent':
      return 'You may lower your cadence below the Space default, not raise it above.';
    case 'not_found':
      return 'Could not find this Space.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
