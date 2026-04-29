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

  // Resolve actor display names for rendering. Redacted ("[removed member]")
  // when the row has been RTBF'd.
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

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name} / Civic Memory
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">{issue[0].title}</h1>

      {events.length === 0 ? (
        <p className="text-[color:var(--color-muted)]">
          This Issue has no Civic Memory entries yet. Entries appear as the Issue is discussed,
          decided, and revisited.
        </p>
      ) : (
        <ol className="divide-y divide-[color:var(--color-rule)]">
          {events.map((event) => (
            <li key={event.id} className="py-3">
              <TimelineRow
                event={event}
                actorName={
                  event.actorMemberId
                    ? (actorMap.get(event.actorMemberId) ?? '[removed member]')
                    : null
                }
              />
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function TimelineRow({ event, actorName }: { event: TimelineEvent; actorName: string | null }) {
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-4">
      <time className="font-mono text-xs text-[color:var(--color-muted)]">
        {event.occurredAt.toISOString().slice(0, 19).replace('T', ' ')}
      </time>
      <div>
        <div className="text-xs tracking-[0.1em] text-[color:var(--color-muted)] uppercase">
          {humanReadableEventType(event.eventType)}
        </div>
        {actorName ? <div className="text-sm">by {actorName}</div> : null}
      </div>
    </div>
  );
}

function humanReadableEventType(t: TimelineEvent['eventType']): string {
  return t.replace(/_/g, ' ');
}
