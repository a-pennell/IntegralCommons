import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listEntriesForNeighborhood } from '@/server/stewardship';
import { Note } from '@/components/ui/note';

type RouteParams = { neighborhoodSlug: string };

const ENTRY_LABEL: Record<string, string> = {
  action_taken: 'Action taken',
  member_care: 'Care check',
  resource_noted: 'Resource noted',
  charter_note: 'Charter note',
  handover: 'Steward handover',
};

export default async function StewardshipPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/stewardship`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const entries = await listEntriesForNeighborhood(result.neighborhood.id);
  const isSteward = result.membership.role === 'steward';

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons · Stewardship</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Stewardship Record
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          An append-only log of steward activity. Non-evaluative — records what was done, not
          whether it was done well.
        </p>
      </header>

      {!isSteward ? (
        <div className="mb-8">
          <Note tone="info">Only stewards can add entries to this record.</Note>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <p className="text-(length:--text-body) text-[color:var(--color-ink-soft)]">
          No stewardship entries yet.
        </p>
      ) : (
        <ol className="relative border-l border-[color:var(--color-rule)] pl-6 space-y-6">
          {entries.map((e) => (
            <li key={e.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[calc(theme(spacing.6)+1px)] top-[6px] h-2 w-2 rounded-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]"
              />
              <div className="metadata text-[color:var(--color-muted)]">
                {ENTRY_LABEL[e.entryType] ?? e.entryType} ·{' '}
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(e.occurredAt)}
              </div>
              {e.notes ? (
                <p className="mt-1 text-(length:--text-body) text-[color:var(--color-ink-soft)]">
                  {e.notes}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
