import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { inArray } from 'drizzle-orm';
import { db } from '@/db';
import { members } from '@/db/schema';
import type { TimelineEventWithIssue } from '@/server/civic-memory';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { listTimelineEventsForSpace } from '@/server/civic-memory';
import type { Route } from 'next';

type RouteParams = { spaceSlug: string };

export default async function SpaceTimelinePage({ params }: { params: Promise<RouteParams> }) {
  const { spaceSlug } = await params;
  const session = await requireSession();
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/timeline`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const events = await listTimelineEventsForSpace(space.space.id);

  const actorIds = [...new Set(events.map((e) => e.actorMemberId).filter((v): v is string => !!v))];
  const actorRows = actorIds.length
    ? await db
        .select({ id: members.id, displayName: members.displayName })
        .from(members)
        .where(inArray(members.id, actorIds))
    : [];
  const actorMap = new Map(actorRows.map((r) => [r.id, r.displayName ?? '[removed]']));

  const byMonth = new Map<string, TimelineEventWithIssue[]>();
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
        <div className="eyebrow">Civic Memory</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          The record
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          Every event written across all issues in this space, in the order it happened. The record
          is append-only — entries are never deleted or rewritten.
        </p>
      </header>

      {events.length === 0 ? (
        <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
          No events yet. They appear as issues are discussed, decided, and revisited.
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
                        <div className="font-[var(--font-body)] text-(length:--text-body) leading-tight text-[color:var(--color-ink)]">
                          {humanReadableEventType(event.eventType)}
                        </div>
                        <div className="metadata mt-1 tabular">
                          {event.actorMemberId ? (
                            <>
                              {'by '}
                              <span className="text-[color:var(--color-ink)]">
                                {actorMap.get(event.actorMemberId) ?? '[removed]'}
                              </span>
                              {' · '}
                            </>
                          ) : (
                            <span className="italic">{'system · '}</span>
                          )}
                          <Link
                            href={`/spaces/${spaceSlug}/issues/${event.issueSlug}` as Route}
                            className="text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-accent)]"
                          >
                            {event.issueTitle}
                          </Link>
                        </div>
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

function humanReadableEventType(t: string): string {
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
  const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(d);
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  return `${day}  ${time}`;
}
