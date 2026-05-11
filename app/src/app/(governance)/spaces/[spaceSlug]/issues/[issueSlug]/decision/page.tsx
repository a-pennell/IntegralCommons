import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import {
  getDecisionRecord,
  getSupersessionChain,
  listDecisionRecordsForIssue,
} from '@/server/decisions';
import { getIssueBySlugForMember } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { renderMarkdown } from '@/lib/markdown';
import { Folio } from '@/components/ui/folio';
import { StatusStamp } from '@/components/ui/status-stamp';

type RouteParams = { spaceSlug: string; issueSlug: string };

export default async function DecisionPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug, issueSlug } = await params;
  if (!session.ok) {
    redirect(
      `/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/issues/${issueSlug}/decision`)}`,
    );
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();
  const issue = await getIssueBySlugForMember({
    spaceId: space.space.id,
    slug: issueSlug,
    viewerMemberId: session.value.memberId,
  });
  if (!issue) notFound();

  const current = issue.currentDecisionRecordId
    ? await getDecisionRecord(issue.currentDecisionRecordId)
    : null;
  const allDrafts = await listDecisionRecordsForIssue(issue.id);
  const chain = issue.currentDecisionRecordId
    ? await getSupersessionChain(issue.currentDecisionRecordId)
    : [];

  // Pre-render markdown
  const [whatHtml, rationaleHtml, objectionsHtml] = current
    ? await Promise.all([
        renderMarkdown(current.whatText),
        renderMarkdown(current.rationaleText),
        current.unresolvedObjectionsText.trim().length
          ? renderMarkdown(current.unresolvedObjectionsText)
          : Promise.resolve(''),
      ])
    : ['', '', ''];

  const isFinalized = !!current?.finalizedAt;

  return (
    <main
      data-density="editorial"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-10 sm:px-10 sm:py-14"
    >
      {!current || !isFinalized ? (
        <>
          <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
            <div className="eyebrow">
              Decision record
              {' · '}
              <span className="tracking-normal text-[color:var(--color-ink-soft)] normal-case italic">
                {issue.title}
              </span>
            </div>
            <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
              No record on file
            </h1>
          </header>
          <p className="text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
            No Decision Record has been finalized for this issue yet.{' '}
            <a
              href={`/spaces/${space.space.slug}/issues/${issue.slug}/decision/draft` as Route}
              className="not-italic underline underline-offset-4 hover:text-[color:var(--color-accent)]"
            >
              Draft one ▸
            </a>
          </p>
        </>
      ) : (
        <Folio
          marginWidth="240px"
          className=""
          margin={
            <>
              <div className="eyebrow text-[color:var(--color-ink)]">Decision Record</div>
              <div className="metadata tabular mt-1 text-[color:var(--color-ink)]">
                DR-{current.id.slice(-5).toUpperCase()}
              </div>

              <div className="mt-5">
                <StatusStamp status="decided" />
              </div>

              <div className="mt-6">
                <div className="eyebrow">Method</div>
                <div className="metadata tabular mt-1">{current.howMethod}</div>
              </div>

              <div className="mt-6">
                <div className="eyebrow">Finalized</div>
                <div className="metadata tabular mt-1">
                  {current.finalizedAt ? formatLongDate(current.finalizedAt) : '—'}
                </div>
              </div>

              <div className="mt-6">
                <div className="eyebrow">Review on</div>
                <div className="metadata tabular mt-1 text-[color:var(--color-stuart)]">
                  {current.reviewDate}
                </div>
              </div>

              {chain.length > 1 ? (
                <div className="mt-6">
                  <div className="eyebrow">Supersession</div>
                  <div className="metadata tabular mt-1">{chain.length}-record chain</div>
                </div>
              ) : null}

              <div className="mt-6">
                <div className="eyebrow">See also</div>
                <div className="metadata mt-1">
                  <a
                    href={`/spaces/${space.space.slug}/issues/${issue.slug}` as Route}
                    className="underline underline-offset-4 hover:text-[color:var(--color-accent)]"
                  >
                    Issue
                  </a>
                  {' · '}
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
          <header className="mb-12">
            <div className="eyebrow">
              Decision record
              {' · '}
              <span className="tracking-normal text-[color:var(--color-ink-soft)] normal-case italic">
                {issue.title}
              </span>
            </div>
            <h1 className="mt-3 text-(length:--text-display) leading-(--text-display--line-height) font-[var(--font-display)] font-extrabold tracking-(--text-display--letter-spacing) text-[color:var(--color-ink)]">
              The record
            </h1>
          </header>

          <article className="space-y-12">
            <DrSection title="What was decided" html={whatHtml} />
            <DrSection title="Rationale" html={rationaleHtml} />
            <DrSection
              title="Unresolved objections & stand-asides"
              html={objectionsHtml}
              empty="None recorded."
            />
          </article>

          {chain.length > 1 ? (
            <section className="mt-20 border-t-2 border-[color:var(--color-ink)] pt-8">
              <header className="mb-5">
                <div className="eyebrow">Supersession chain</div>
                <h2 className="mt-2 text-(length:--text-heading) leading-(--text-heading--line-height) font-[var(--font-display)] font-bold tracking-(--text-heading--letter-spacing) text-[color:var(--color-ink)]">
                  Predecessors
                </h2>
              </header>
              <ol className="space-y-3">
                {chain.map((dr, i) => (
                  <li
                    key={dr.id}
                    className="grid grid-cols-[80px_1fr] items-baseline gap-x-6 border-b border-[color:var(--color-rule)] pb-3"
                  >
                    <span className="metadata tabular text-[color:var(--color-ink)]">
                      {i === 0 ? 'current' : `v${chain.length - i}`}
                    </span>
                    <span className="text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
                      {dr.whatText.slice(0, 120)}
                      {dr.whatText.length > 120 ? '…' : ''}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section className="mt-16 border-t border-[color:var(--color-rule)] pt-6">
            <div className="eyebrow mb-3">All drafts on this issue</div>
            <ul className="space-y-1">
              {allDrafts.map((d) => (
                <li key={d.id} className="metadata tabular">
                  {d.id.slice(-8).toUpperCase()} · drafted {formatShortDate(d.createdAt)}
                  {d.finalizedAt ? (
                    <>
                      {' · finalized '}
                      <span className="text-[color:var(--color-oxblood)]">
                        {formatShortDate(d.finalizedAt)}
                      </span>
                    </>
                  ) : (
                    ' · draft'
                  )}
                </li>
              ))}
            </ul>
          </section>
        </Folio>
      )}
    </main>
  );
}

function DrSection({ title, html, empty }: { title: string; html: string; empty?: string }) {
  return (
    <section>
      <h2 className="eyebrow mb-3 text-[color:var(--color-ink)]">{title}</h2>
      {html ? (
        <div
          className="prose prose-sm max-w-prose text-(length:--text-body) font-[var(--font-body)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          {empty ?? '—'}
        </p>
      )}
    </section>
  );
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
