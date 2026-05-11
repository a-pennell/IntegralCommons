import { notFound, redirect } from 'next/navigation';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { issues, members } from '@/db/schema';
import type { TimelineEvent } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { listTimelineEventsForIssue } from '@/server/civic-memory';

type RouteParams = { spaceSlug: string; issueSlug: string };

export default async function IssueTimelinePage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug, issueSlug } = await params;
  if (!session.ok) {
    redirect(
      `/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/issues/${issueSlug}/timeline`)}`,
    );
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const issue = await db
    .select()
    .from(issues)
    .where(and(eq(issues.spaceId, space.space.id), eq(issues.slug, issueSlug)))
    .limit(1);
  if (!issue[0]) notFound();

  const events = await listTimelineEventsForIssue(issue[0].id);

  // Resolve actor display names. Redacted ("[removed]") for RTBF'd rows.
  const actorIds = [...new Set(events.map((e) => e.actorMemberId).filter((v): v is string => !!v))];
  const actorRows = actorIds.length
    ? await db
        .select({ id: members.id, displayName: members.displayName })
        .from(members)
        .where(inArray(members.id, actorIds))
    : [];
  const actorMap = new Map<string, string>();
  for (const row of actorRows) {
    if (row.displayName) actorMap.set(row.id, row.displayName);
  }

  // Group events by month for chronicle-style date rules.
  const byMonth = new Map<string, TimelineEvent[]>();
  for (const ev of events) {
    const key = monthKey(ev.occurredAt);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(ev);
  }
  const monthsSorted = Array.from(byMonth.keys()).sort().reverse();

  return (
    <main
      data-density="editorial"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">
          Civic Memory
          {' · '}
          <span className="tracking-normal text-[color:var(--color-ink-soft)] normal-case italic">
            {issue[0].title}
          </span>
        </div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          The record
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          Every event written to this issue, in the order it happened. The record is append-only —
          entries are never deleted or rewritten, even when the issue is archived.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          This issue has no Civic Memory entries yet. Entries appear as the issue is discussed,
          decided, and revisited.
        </p>
      ) : (
        <div className="space-y-12">
          {monthsSorted.map((m) => {
            const monthEvents = byMonth.get(m)!;
            return (
              <section key={m}>
                <DateRule label={formatMonth(m)} />
                <ol className="space-y-1">
                  {monthEvents.map((event) => (
                    <li
                      key={event.id}
                      className="grid grid-cols-[120px_1fr] items-baseline gap-x-6 border-b border-[color:var(--color-rule)] py-3"
                    >
                      <time className="metadata tabular text-[color:var(--color-ink)]">
                        {formatDayTime(event.occurredAt)}
                      </time>
                      <div>
                        <div className="text-(length:--text-body) leading-tight font-[var(--font-body)] text-[color:var(--color-ink)]">
                          {humanReadableEventType(event.eventType)}
                        </div>
                        {event.actorMemberId ? (
                          <div className="metadata tabular mt-1">
                            by{' '}
                            <span className="text-[color:var(--color-ink)]">
                              {actorMap.get(event.actorMemberId) ?? '[removed]'}
                            </span>
                          </div>
                        ) : (
                          <div className="metadata tabular mt-1 italic">by the system</div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function DateRule({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-baseline gap-4">
      <span className="eyebrow text-[color:var(--color-ink)]">— {label} —</span>
      <span className="h-px flex-1 bg-[color:var(--color-rule-strong)]" aria-hidden />
    </div>
  );
}

function humanReadableEventType(t: TimelineEvent['eventType']): string {
  return t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(y!, m! - 1, 1)),
  );
}

function formatDayTime(d: Date): string {
  // "14 Apr 14:32" — short for archive density
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d);
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  return `${day}  ${time}`;
}
