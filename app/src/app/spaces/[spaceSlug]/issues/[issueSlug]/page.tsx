import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getIssueBySlugForMember, recordIssueView } from '@/server/issues';
import { listPerspectivesForIssue, type PerspectiveWithAuthor } from '@/server/perspectives';
import { renderMarkdown } from '@/lib/markdown';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { listSummariesForIssue, type SummaryWithAuthor } from '@/server/civic-memory';
import { memberHoldsCapability } from '@/server/delegations';
import { db } from '@/db';
import { eq } from 'drizzle-orm';
import { quorumStates } from '@/db/schema';

type RouteParams = { spaceSlug: string; issueSlug: string };

export default async function IssueDetailPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug, issueSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/issues/${issueSlug}`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const issue = await getIssueBySlugForMember({
    spaceId: space.space.id,
    slug: issueSlug,
    viewerMemberId: session.value.memberId,
  });
  if (!issue) notFound();

  // Record the view (fires-and-forgets — don't block the page render).
  void recordIssueView({ issueId: issue.id, memberId: session.value.memberId });

  const [perspectives, quorumRow, summaries, hasFacilitation] = await Promise.all([
    listPerspectivesForIssue(issue.id),
    db.select().from(quorumStates).where(eq(quorumStates.issueId, issue.id)).limit(1),
    listSummariesForIssue(issue.id),
    memberHoldsCapability({
      spaceId: space.space.id,
      issueId: issue.id,
      memberId: session.value.memberId,
      capability: 'facilitation',
    }),
  ]);
  const quorum = quorumRow[0] ?? null;
  const sections = parseSections(issue.structuredSections);

  // Render every Perspective's Markdown once up front (server-side).
  const renderedBodies = new Map<string, string>();
  await Promise.all(
    perspectives.map(async (p) => {
      renderedBodies.set(p.id, await renderMarkdown(p.bodyMarkdown));
    }),
  );

  const parentAllowsReply = (p: PerspectiveWithAuthor) => p.parentPerspectiveId === null;
  const canContribute = issue.status !== 'decided' && issue.status !== 'archived';

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 flex items-center justify-between text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        <span>{space.space.name}</span>
        <span className="font-mono">{issue.status}</span>
      </div>
      <h1 className="mb-4 text-3xl font-[var(--font-display)]">{issue.title}</h1>

      <p className="mb-6 border-l-2 border-[color:var(--color-rule)] pl-4 text-[color:var(--color-muted)]">
        {issue.scope}
      </p>

      {issue.status === 'stalled' && quorum ? (
        <div className="mb-6 border border-amber-400 bg-amber-50 p-4 text-sm">
          <strong className="block mb-1">Stalled — insufficient awareness quorum</strong>
          <p className="text-[color:var(--color-muted)]">
            This Issue cannot proceed to a Decision until more members view it.
            Current awareness: {quorum.awarenessCount} /{' '}
            {quorum.awarenessRequired} required (
            {Math.round((quorum.awarenessCount / Math.max(quorum.awarenessRequired, 1)) * 100)}%).
            Share this Issue with other members of the Space.
          </p>
        </div>
      ) : null}

      {issue.scopeTags.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {issue.scopeTags.map((t) => (
            <span
              key={t}
              className="border border-[color:var(--color-rule)] bg-white/50 px-2 py-0.5 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <Section
        title="Problem framings"
        items={sections.problemFramings}
        empty="No problem framings captured yet."
      />
      <Section
        title="Constraints"
        items={sections.constraints}
        empty="No constraints captured yet."
      />
      <Section
        title="Stakeholders"
        items={sections.stakeholders}
        empty="No stakeholders listed yet."
      />
      <Section title="Known facts" items={sections.knownFacts} empty="No facts documented yet." />
      <Section
        title="Open questions"
        items={sections.openQuestions}
        empty="No open questions yet."
      />

      {summaries.length > 0 || hasFacilitation ? (
        <section id="summary" className="mt-10 border-t border-[color:var(--color-rule)] pt-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-[var(--font-display)]">Official summary</h2>
            {hasFacilitation ? (
              <a
                href={`/spaces/${space.space.slug}/issues/${issue.slug}/summary/new` as Route}
                className="text-sm underline"
              >
                {summaries.length > 0 ? 'Publish revision' : 'Publish first summary'}
              </a>
            ) : null}
          </div>
          {summaries[0] ? (
            <div className="prose prose-sm max-w-none">
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: await renderMarkdown(summaries[0].bodyMarkdown) }}
              />
              <p className="mt-2 text-xs text-[color:var(--color-muted)]">
                v{summaries[0].version} — {summaries[0].authorDisplayName ?? '[removed member]'} —{' '}
                {summaries[0].publishedAt.toLocaleDateString()}
              </p>
              {summaries.length > 1 ? (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-[color:var(--color-muted)]">
                    {summaries.length - 1} prior version{summaries.length > 2 ? 's' : ''}
                  </summary>
                  <ul className="mt-2 space-y-1 text-[color:var(--color-muted)]">
                    {summaries.slice(1).map((s: SummaryWithAuthor) => (
                      <li key={s.id}>
                        v{s.version} — {s.authorDisplayName ?? '[removed member]'} —{' '}
                        {s.publishedAt.toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-[color:var(--color-muted)]">
              No summary published yet.
            </p>
          )}
        </section>
      ) : null}

      <section id="perspectives" className="mt-10 border-t border-[color:var(--color-rule)] pt-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-2xl font-[var(--font-display)]">Perspectives</h2>
          {canContribute ? (
            <a
              href={`/spaces/${space.space.slug}/issues/${issue.slug}/perspectives/new` as Route}
              className="text-sm underline"
            >
              + Add a Perspective
            </a>
          ) : null}
        </div>

        {perspectives.length === 0 ? (
          <p className="text-[color:var(--color-muted)]">
            No Perspectives yet. Each Perspective is a first-class contribution, not a comment.
          </p>
        ) : (
          <ul className="space-y-4">
            {perspectives.map((p) => {
              const isReply = p.parentPerspectiveId !== null;
              return (
                <li
                  key={p.id}
                  className={
                    isReply
                      ? 'ml-8 border-l border-[color:var(--color-rule)] pl-4'
                      : 'border-l-2 border-[color:var(--color-ink)] pl-4'
                  }
                >
                  <header className="mb-1 flex items-baseline justify-between gap-3">
                    <div className="text-sm">
                      <strong>{p.authorDisplayName ?? '[removed member]'}</strong>
                      <span className="ml-2 font-mono text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
                        {p.taxonomyType}
                      </span>
                      {p.fromDirectExperience ? (
                        <span className="ml-2 text-xs text-[color:var(--color-accent)]">
                          direct experience
                        </span>
                      ) : null}
                    </div>
                    <time className="font-mono text-xs text-[color:var(--color-muted)]">
                      {p.createdAt.toISOString().slice(0, 10)}
                    </time>
                  </header>
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderedBodies.get(p.id) ?? '' }}
                  />
                  {canContribute && parentAllowsReply(p) ? (
                    <a
                      href={
                        `/spaces/${space.space.slug}/issues/${issue.slug}/perspectives/new?replyTo=${p.id}` as Route
                      }
                      className="mt-2 inline-block text-xs underline"
                    >
                      Reply
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <nav className="mt-10 flex gap-3">
        <a
          href={`/spaces/${space.space.slug}/issues/${issue.slug}/timeline` as Route}
          className="text-sm underline"
        >
          View Civic Memory →
        </a>
      </nav>
    </main>
  );
}

function parseSections(raw: unknown): {
  problemFramings: string[];
  constraints: string[];
  stakeholders: string[];
  knownFacts: string[];
  openQuestions: string[];
} {
  const safe = (key: string): string[] => {
    if (!raw || typeof raw !== 'object') return [];
    const v = (raw as Record<string, unknown>)[key];
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  };
  return {
    problemFramings: safe('problemFramings'),
    constraints: safe('constraints'),
    stakeholders: safe('stakeholders'),
    knownFacts: safe('knownFacts'),
    openQuestions: safe('openQuestions'),
  };
}

function Section({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <section className="mb-6 border-t border-[color:var(--color-rule)] pt-4">
      <h2 className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted)]">{empty}</p>
      ) : (
        <ul className="list-inside list-disc space-y-1 text-sm">
          {items.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
