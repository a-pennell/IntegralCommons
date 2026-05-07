import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { quorumStates } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { getIssueBySlugForMember, recordIssueView } from '@/server/issues';
import { listPerspectivesForIssue, type PerspectiveWithAuthor } from '@/server/perspectives';
import { renderMarkdown } from '@/lib/markdown';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { listSummariesForIssue, type SummaryWithAuthor } from '@/server/civic-memory';
import { findActiveDelegations, memberHoldsCapability } from '@/server/delegations';
import { Button } from '@/components/ui/button';
import { Folio } from '@/components/ui/folio';
import { StatusStamp, type Status } from '@/components/ui/status-stamp';
import { transitionStatusAction, volunteerFacilitatorAction } from './action';

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

  void recordIssueView({ issueId: issue.id, memberId: session.value.memberId });

  const [perspectives, quorumRow, summaries, hasFacilitation, activeFacilitators] =
    await Promise.all([
      listPerspectivesForIssue(issue.id),
      db.select().from(quorumStates).where(eq(quorumStates.issueId, issue.id)).limit(1),
      listSummariesForIssue(issue.id),
      memberHoldsCapability({
        spaceId: space.space.id,
        issueId: issue.id,
        memberId: session.value.memberId,
        capability: 'facilitation',
      }),
      findActiveDelegations({
        spaceId: space.space.id,
        issueId: issue.id,
        capability: 'facilitation',
      }),
    ]);
  const quorum = quorumRow[0] ?? null;
  const sections = parseSections(issue.structuredSections);

  const renderedBodies = new Map<string, string>();
  await Promise.all(
    perspectives.map(async (p) => {
      renderedBodies.set(p.id, await renderMarkdown(p.bodyMarkdown));
    }),
  );

  const summaryHtml = summaries[0]
    ? await renderMarkdown(summaries[0].bodyMarkdown)
    : null;

  const canContribute = issue.status !== 'decided' && issue.status !== 'archived';

  return (
    <main
      data-density="editorial"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      <Folio
        marginWidth="240px"
        className=""
        margin={
          <>
            {/* Citation block */}
            <div className="eyebrow text-[color:var(--color-ink)]">Issue</div>
            <div className="metadata mt-1 tabular text-[color:var(--color-ink)]">
              ISS-{shortId(issue.id)}
            </div>

            {/* Status stamp */}
            <div className="mt-5">
              <StatusStamp status={issue.status as Status} />
            </div>

            {/* Provenance */}
            <div className="mt-6">
              <div className="eyebrow">Opened</div>
              <div className="metadata mt-1 tabular">
                {formatLongDate(issue.createdAt)}
              </div>
            </div>

            {/* Quorum */}
            {quorum ? (
              <div className="mt-6">
                <div className="eyebrow">Quorum</div>
                <div className="metadata mt-1 tabular">
                  Awareness {quorum.awarenessCount} of {quorum.awarenessRequired}
                </div>
                <div className="metadata tabular">
                  Participation {quorum.participationCount} of {quorum.participationRequired}
                </div>
                {quorum.deliberationPeriodEndsAt ? (
                  <div className="metadata mt-2 tabular text-[color:var(--color-stuart)]">
                    Period ends {formatShortDate(quorum.deliberationPeriodEndsAt)}
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Volunteer to facilitate — visible when no facilitator yet */}
            {!hasFacilitation &&
            activeFacilitators.length === 0 &&
            (issue.status === 'open' || issue.status === 'exploring') ? (
              <div className="mt-6 border-t border-[color:var(--color-rule)] pt-4">
                <div className="eyebrow text-[color:var(--color-ink)]">Facilitation</div>
                <p className="mt-2 metadata text-[color:var(--color-muted)] italic">
                  No facilitator yet.
                </p>
                <form action={volunteerFacilitatorAction} className="mt-3">
                  <input type="hidden" name="issueId" value={issue.id} />
                  <input type="hidden" name="spaceId" value={space.space.id} />
                  <input type="hidden" name="spaceSlug" value={space.space.slug} />
                  <input type="hidden" name="issueSlug" value={issue.slug} />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full text-left text-(length:--text-small)"
                  >
                    Volunteer to facilitate
                  </Button>
                </form>
              </div>
            ) : null}

            {/* Facilitator controls */}
            {hasFacilitation && (issue.status === 'open' || issue.status === 'exploring') ? (
              <div className="mt-6 border-t border-[color:var(--color-rule)] pt-4">
                <div className="eyebrow text-[color:var(--color-ink)]">Facilitator</div>
                {issue.status === 'open' ? (
                  <>
                    <form action={transitionStatusAction} className="mt-3">
                      <input type="hidden" name="issueId" value={issue.id} />
                      <input type="hidden" name="spaceId" value={space.space.id} />
                      <input type="hidden" name="toStatus" value="exploring" />
                      <input type="hidden" name="spaceSlug" value={space.space.slug} />
                      <input type="hidden" name="issueSlug" value={issue.slug} />
                      <Button
                        type="submit"
                        variant="secondary"
                        className="w-full text-left text-(length:--text-small)"
                      >
                        Begin deliberation →
                      </Button>
                      <p className="mt-2 metadata text-[color:var(--color-muted)] italic">
                        Moves to Exploring. Members may add perspectives.
                      </p>
                    </form>
                    <div className="mt-3">
                      <a
                        href={`/spaces/${space.space.slug}/issues/${issue.slug}/edit` as Route}
                        className="font-[var(--font-display)] text-(length:--text-small) font-semibold text-[color:var(--color-ink)] underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                      >
                        Edit framing →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <form action={transitionStatusAction} className="mt-3">
                      <input type="hidden" name="issueId" value={issue.id} />
                      <input type="hidden" name="spaceId" value={space.space.id} />
                      <input type="hidden" name="toStatus" value="open" />
                      <input type="hidden" name="spaceSlug" value={space.space.slug} />
                      <input type="hidden" name="issueSlug" value={issue.slug} />
                      <Button
                        type="submit"
                        variant="secondary"
                        className="w-full text-left text-(length:--text-small)"
                      >
                        ← Return to Open
                      </Button>
                    </form>
                    <div className="mt-3 flex flex-col gap-2">
                      <a
                        href={
                          `/spaces/${space.space.slug}/issues/${issue.slug}/decision/draft` as Route
                        }
                        className="font-[var(--font-display)] text-(length:--text-small) font-semibold text-[color:var(--color-ink)] underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                      >
                        Draft Decision Record →
                      </a>
                      <a
                        href={
                          `/spaces/${space.space.slug}/issues/${issue.slug}/summary/new` as Route
                        }
                        className="font-[var(--font-display)] text-(length:--text-small) font-semibold text-[color:var(--color-ink)] underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                      >
                        Publish summary →
                      </a>
                      <a
                        href={
                          `/spaces/${space.space.slug}/issues/${issue.slug}/edit` as Route
                        }
                        className="font-[var(--font-display)] text-(length:--text-small) font-semibold text-[color:var(--color-ink)] underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                      >
                        Edit framing →
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* Tags */}
            {issue.scopeTags.length > 0 ? (
              <div className="mt-6">
                <div className="eyebrow">Tags</div>
                <div className="metadata mt-1 tabular">{issue.scopeTags.join(', ')}</div>
              </div>
            ) : null}

            {/* See also */}
            <div className="mt-6">
              <div className="eyebrow">See also</div>
              <div className="metadata mt-1">
                <a
                  href={`/spaces/${space.space.slug}/issues/${issue.slug}/timeline` as Route}
                  className="underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                >
                  Civic Memory
                </a>
              </div>
            </div>
          </>
        }
      >
        {/* Title block */}
        <header className="mb-10">
          <h1 className="text-(length:--text-display) leading-(--text-display--line-height) tracking-(--text-display--letter-spacing) font-[var(--font-display)] font-extrabold text-[color:var(--color-ink)]">
            {issue.title}
          </h1>
          <p className="mt-5 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
            {issue.scope}
          </p>
        </header>

        {issue.status === 'stalled' && quorum ? (
          <aside className="mb-10 border-l-2 border-[color:var(--color-oxblood)] bg-[color:var(--color-paper-soft)] py-3 pl-5">
            <div className="eyebrow text-[color:var(--color-oxblood)]">
              Stalled — insufficient awareness
            </div>
            <p className="mt-2 max-w-prose font-[var(--font-body)] text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-ink-soft)]">
              This issue cannot proceed to a decision until more members have viewed it. Current
              awareness: {quorum.awarenessCount} of {quorum.awarenessRequired} required (
              {Math.round((quorum.awarenessCount / Math.max(quorum.awarenessRequired, 1)) * 100)}
              %). Share this issue with other members of the Space.
            </p>
          </aside>
        ) : null}

        {/* Structured sections */}
        <StructuredSection title="Problem framings" items={sections.problemFramings} />
        <StructuredSection title="Constraints" items={sections.constraints} />
        <StructuredSection title="Stakeholders" items={sections.stakeholders} />
        <StructuredSection title="Known facts" items={sections.knownFacts} />
        <StructuredSection title="Open questions" items={sections.openQuestions} />

        {/* Official summary */}
        {summaries.length > 0 || hasFacilitation ? (
          <section className="mt-14 border-t-2 border-b-2 border-[color:var(--color-ink)] py-8">
            <header className="mb-5 flex items-baseline justify-between">
              <div>
                <div className="eyebrow text-[color:var(--color-ink)]">Official summary</div>
                {summaries[0] ? (
                  <div className="metadata mt-1 tabular">
                    v{summaries[0].version} · {summaries[0].authorDisplayName ?? '[removed]'} ·{' '}
                    {formatShortDate(summaries[0].publishedAt)}
                  </div>
                ) : null}
              </div>
              {hasFacilitation ? (
                <a
                  href={`/spaces/${space.space.slug}/issues/${issue.slug}/summary/new` as Route}
                  className="font-[var(--font-display)] text-(length:--text-small) font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)]"
                >
                  {summaries.length > 0 ? 'Publish revision' : 'Publish first summary'}
                </a>
              ) : null}
            </header>
            {summaryHtml ? (
              <div
                className="prose prose-sm max-w-prose font-[var(--font-body)] text-(length:--text-body)"
                dangerouslySetInnerHTML={{ __html: summaryHtml }}
              />
            ) : (
              <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
                No summary published yet.
              </p>
            )}
            {summaries.length > 1 ? (
              <details className="mt-4 metadata tabular">
                <summary className="cursor-pointer">
                  {summaries.length - 1} prior version{summaries.length > 2 ? 's' : ''}
                </summary>
                <ul className="mt-2 space-y-1">
                  {summaries.slice(1).map((s: SummaryWithAuthor) => (
                    <li key={s.id}>
                      v{s.version} · {s.authorDisplayName ?? '[removed]'} ·{' '}
                      {formatShortDate(s.publishedAt)}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>
        ) : null}

        {/* Perspectives */}
        <section className="mt-14">
          <header className="mb-8 flex items-baseline justify-between border-b border-[color:var(--color-rule)] pb-3">
            <div className="flex items-baseline gap-3">
              <span className="eyebrow text-[color:var(--color-ink)]">Perspectives</span>
              <span className="metadata tabular">· {perspectives.length}</span>
            </div>
            {canContribute ? (
              <a
                href={
                  `/spaces/${space.space.slug}/issues/${issue.slug}/perspectives/new` as Route
                }
                className="font-[var(--font-display)] text-(length:--text-small) font-semibold text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)]"
              >
                + Add a perspective
              </a>
            ) : null}
          </header>

          {perspectives.length === 0 ? (
            <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
              No perspectives yet. Each perspective is a first-class contribution, not a comment.
            </p>
          ) : (
            <ol className="space-y-12">
              {perspectives.map((p) => (
                <PerspectiveBlock
                  key={p.id}
                  perspective={p}
                  bodyHtml={renderedBodies.get(p.id) ?? ''}
                  canReply={canContribute && p.parentPerspectiveId === null}
                  spaceSlug={space.space.slug}
                  issueSlug={issue.slug}
                />
              ))}
            </ol>
          )}
        </section>
      </Folio>
    </main>
  );
}

function PerspectiveBlock({
  perspective: p,
  bodyHtml,
  canReply,
  spaceSlug,
  issueSlug,
}: {
  perspective: PerspectiveWithAuthor;
  bodyHtml: string;
  canReply: boolean;
  spaceSlug: string;
  issueSlug: string;
}) {
  const isReply = p.parentPerspectiveId !== null;
  return (
    <li
      className={
        isReply
          ? 'ml-8 border-l border-[color:var(--color-rule)] pl-6'
          : 'border-l-2 border-[color:var(--color-ink)] pl-6'
      }
    >
      <header className="mb-3 flex items-baseline justify-between gap-4">
        <div className="font-[var(--font-body)] text-(length:--text-small) italic text-[color:var(--color-ink)]">
          {p.authorDisplayName ?? '[removed member]'}
          <span className="metadata not-italic ml-3 tabular text-[color:var(--color-muted)]">
            {p.taxonomyType.toUpperCase()}
          </span>
          {p.fromDirectExperience ? (
            <span className="metadata not-italic ml-2 tabular text-[color:var(--color-accent)]">
              · direct experience
            </span>
          ) : null}
        </div>
        <time className="metadata tabular text-[color:var(--color-muted)]">
          {p.createdAt.toISOString().slice(0, 10)}
        </time>
      </header>
      <div
        className="prose prose-sm max-w-prose font-[var(--font-body)] text-(length:--text-body)"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />
      {canReply ? (
        <a
          href={
            `/spaces/${spaceSlug}/issues/${issueSlug}/perspectives/new?replyTo=${p.id}` as Route
          }
          className="metadata mt-3 inline-block underline underline-offset-4 hover:text-[color:var(--color-accent)]"
        >
          Reply
        </a>
      ) : null}
    </li>
  );
}

function StructuredSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="eyebrow mb-3 text-[color:var(--color-ink)]">{title}</h2>
      <ul className="space-y-2">
        {items.map((line, i) => (
          <li
            key={i}
            className="font-[var(--font-body)] text-(length:--text-body) leading-(--text-body--line-height) text-[color:var(--color-ink)]"
          >
            <span className="metadata tabular mr-3 text-[color:var(--color-muted)]">
              {String(i + 1).padStart(2, '0')}
            </span>
            {line}
          </li>
        ))}
      </ul>
    </section>
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

function shortId(ulid: string): string {
  return ulid.slice(-5).toUpperCase();
}

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

function formatLongDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}
