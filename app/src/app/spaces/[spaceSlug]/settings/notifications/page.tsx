import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { setCadenceAction } from './action';

type RouteParams = { spaceSlug: string };
type SearchParams = { saved?: string; error?: string };

/**
 * Digest cadence settings. This is NOT a notifications page in the "alerts
 * you can subscribe to" sense — that vocabulary is deliberately absent
 * (NFR-001). Every Space produces at most one digest per cadence bucket,
 * and the cadence is the only knob.
 */

const CADENCES = ['daily', 'weekly', 'monthly', 'off'] as const;

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
    <main className="mx-auto max-w-xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.name}
      </div>
      <h1 className="mb-2 text-3xl font-[var(--font-display)]">Digest cadence</h1>
      <p className="mb-8 text-sm text-[color:var(--color-muted)]">
        How often this Space sends you a single email summarizing what happened. This is the only
        push channel — no badges, no counters, no urgency cues (NFR-001). You may lower the cadence
        below the Space default, or turn it off entirely; you cannot raise it above the Space
        default.
      </p>

      <p className="mb-4 text-sm">
        Space default: <strong>{space.digestCadenceDefault}</strong>
      </p>

      {saved ? (
        <p className="mb-4 border-l-2 border-[color:var(--color-accent)] pl-4 text-sm">
          Cadence saved: {saved}.
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
      ) : null}

      <form action={setCadenceAction} className="flex flex-col gap-3">
        <input type="hidden" name="spaceSlug" value={space.slug} />
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">Your cadence</legend>
          {CADENCES.map((c) => (
            <label key={c} className="flex items-center gap-2 text-sm">
              <input type="radio" name="cadence" value={c} defaultChecked={c === effective} />
              {c}
            </label>
          ))}
        </fieldset>
        <button
          type="submit"
          className="mt-2 self-start bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
        >
          Save
        </button>
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
