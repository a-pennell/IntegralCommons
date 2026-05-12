import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlug, getMembershipForNeighborhood } from '@/server/neighborhoods';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
import { importResourcesAction, importNeedsAction } from './action';

type RouteParams = { neighborhoodSlug: string };
type SearchParams = { tab?: string; imported?: string; skipped?: string; error?: string };

export default async function ImportPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug } = await params;
  const { tab, imported, skipped, error } = await searchParams;

  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/import`);

  const neighborhood = await getNeighborhoodBySlug(neighborhoodSlug);
  if (!neighborhood) notFound();

  const membership = await getMembershipForNeighborhood(neighborhood.id, session.value.memberId);
  const isSteward = membership && !membership.leftAt && membership.role === 'steward';

  const activeTab = tab === 'needs' ? 'needs' : 'resources';

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-8 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Stewardship · Import</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Import from CSV
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          Migrate data from a shared spreadsheet, WhatsApp group, or Airtable without manual
          re-entry.
        </p>
      </header>

      {!isSteward ? (
        <Note tone="warning">Only stewards can import data.</Note>
      ) : (
        <>
          {error === 'not_steward' ? (
            <Note tone="warning">You need to be a steward to import data.</Note>
          ) : null}

          {imported !== undefined ? (
            <Note tone="info">
              Import complete: {imported} {activeTab === 'needs' ? 'needs' : 'resources'} imported
              {skipped && Number(skipped) > 0 ? `, ${skipped} rows skipped (missing title)` : ''}.
            </Note>
          ) : null}

          {/* Tab switcher */}
          <div className="mb-6 flex gap-4 border-b border-[color:var(--color-rule)]">
            {['resources', 'needs'].map((t) => (
              <a
                key={t}
                href={`?tab=${t}`}
                className={`pb-2 text-(length:--text-small) font-[var(--font-display)] font-medium capitalize transition-colors ${
                  activeTab === t
                    ? 'border-b-2 border-[color:var(--color-ink)] text-[color:var(--color-ink)]'
                    : 'text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]'
                }`}
              >
                {t}
              </a>
            ))}
          </div>

          {activeTab === 'resources' ? (
            <ResourceImportForm neighborhoodSlug={neighborhoodSlug} />
          ) : (
            <NeedImportForm neighborhoodSlug={neighborhoodSlug} />
          )}
        </>
      )}
    </main>
  );
}

function ResourceImportForm({ neighborhoodSlug }: { neighborhoodSlug: string }) {
  return (
    <section>
      <div className="mb-4 rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-deep)] p-4 text-(length:--text-caption) font-[var(--font-mono)] text-[color:var(--color-muted)]">
        <div className="mb-1 font-semibold text-[color:var(--color-ink-soft)]">
          Expected columns (header row required):
        </div>
        type, title, description, steward, availability
        <div className="mt-2 text-[color:var(--color-muted)]">
          type: tool | space | skill | material | other (defaults to &quot;other&quot; if blank or
          unrecognised)
        </div>
      </div>

      <div className="mb-4 rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-deep)] p-4 text-(length:--text-caption) font-[var(--font-mono)] text-[color:var(--color-muted)]">
        <div className="mb-1 font-semibold text-[color:var(--color-ink-soft)]">Example:</div>
        type,title,description,steward,availability
        <br />
        tool,Circular saw,Makita 7-¼ inch,Jordan,Weekends
        <br />
        skill,Piano lessons,Grade 1–5 teaching,Alex,By arrangement
      </div>

      <form action={importResourcesAction} className="space-y-6">
        <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
        <Textarea
          id="csv"
          name="csv"
          label="Paste CSV here"
          rows={12}
          mono
          placeholder={'type,title,description,steward,availability\ntool,Circular saw,...'}
          required
        />
        <Button type="submit">Import resources</Button>
      </form>
    </section>
  );
}

function NeedImportForm({ neighborhoodSlug }: { neighborhoodSlug: string }) {
  return (
    <section>
      <div className="mb-4 rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-deep)] p-4 text-(length:--text-caption) font-[var(--font-mono)] text-[color:var(--color-muted)]">
        <div className="mb-1 font-semibold text-[color:var(--color-ink-soft)]">
          Expected columns (header row required):
        </div>
        title, body, urgent, deadline
        <div className="mt-2 text-[color:var(--color-muted)]">
          urgent: true | yes | 1 (anything else = not urgent). deadline: ISO date or MM/DD/YYYY.
          Past deadlines are ignored.
        </div>
      </div>

      <div className="mb-4 rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-deep)] p-4 text-(length:--text-caption) font-[var(--font-mono)] text-[color:var(--color-muted)]">
        <div className="mb-1 font-semibold text-[color:var(--color-ink-soft)]">Example:</div>
        title,body,urgent,deadline
        <br />
        Wheelchair ramp repair,North entrance needs repair before winter,yes,2026-11-01
        <br />
        Bread flour,50kg for the community bake,,
      </div>

      <form action={importNeedsAction} className="space-y-6">
        <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
        <Textarea
          id="csv"
          name="csv"
          label="Paste CSV here"
          rows={12}
          mono
          placeholder={'title,body,urgent,deadline\nWheelchair ramp repair,...'}
          required
        />
        <Button type="submit">Import needs</Button>
      </form>
    </section>
  );
}
