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
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-center justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Log</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Stewardship Record
          </h1>
        </div>
        {isSteward ? (
          <div className="flex items-center gap-2">
            <a
              href={`/neighborhoods/${neighborhoodSlug}/stewardship/members`}
              className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink-soft)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
            >
              Members
            </a>
            <a
              href={`/neighborhoods/${neighborhoodSlug}/stewardship/new`}
              className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
            >
              + Add entry
            </a>
          </div>
        ) : null}
      </header>

      {!isSteward ? (
        <div className="mb-6">
          <Note tone="info">Only stewards can add entries to this record.</Note>
        </div>
      ) : null}

      {entries.length === 0 ? (
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          No stewardship entries yet.
        </p>
      ) : (
        <ol className="relative space-y-4 border-l border-[color:var(--color-rule)] pl-5">
          {entries.map((e) => (
            <li key={e.id} className="relative">
              <span
                aria-hidden
                className="absolute -left-[calc(1.25rem+0.5px)] top-[5px] h-2 w-2 rounded-full border border-[color:var(--color-rule)] bg-[color:var(--color-paper)]"
              />
              <div className="metadata text-[color:var(--color-muted)]">
                {ENTRY_LABEL[e.entryType] ?? e.entryType} ·{' '}
                {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(e.occurredAt)}
              </div>
              {e.notes ? (
                <p className="mt-1 text-(length:--text-small) text-[color:var(--color-ink-soft)]">
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
