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

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name} / {issue.title}
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">Decision Record</h1>

      {current && current.finalizedAt ? (
        <article className="space-y-4">
          <DrField label="What was decided">
            <Markdown md={current.whatText} />
          </DrField>
          <DrField label="How (method)">
            <p className="font-mono text-sm">{current.howMethod}</p>
          </DrField>
          <DrField label="Rationale">
            <Markdown md={current.rationaleText} />
          </DrField>
          <DrField label="Unresolved objections / stand-asides">
            {current.unresolvedObjectionsText.trim().length === 0 ? (
              <p className="text-sm text-[color:var(--color-muted)]">(none)</p>
            ) : (
              <Markdown md={current.unresolvedObjectionsText} />
            )}
          </DrField>
          <DrField label="Review date">
            <p className="font-mono text-sm">{current.reviewDate}</p>
          </DrField>
          <DrField label="Finalized">
            <p className="font-mono text-sm">{current.finalizedAt.toISOString().slice(0, 10)}</p>
          </DrField>
        </article>
      ) : (
        <p className="mb-4 text-[color:var(--color-muted)]">
          No Decision Record has been finalized for this Issue yet.{' '}
          <a
            href={`/spaces/${space.space.slug}/issues/${issue.slug}/decision/draft` as Route}
            className="underline"
          >
            Draft one →
          </a>
        </p>
      )}

      {chain.length > 1 ? (
        <section className="mt-10 border-t border-[color:var(--color-rule)] pt-6">
          <h2 className="mb-3 text-xl font-[var(--font-display)]">Supersession chain</h2>
          <ol className="space-y-2 text-sm">
            {chain.map((dr, i) => (
              <li key={dr.id}>
                <span className="font-mono text-xs text-[color:var(--color-muted)]">
                  {i === 0 ? 'current' : `v${chain.length - i}`}
                </span>{' '}
                — {dr.whatText.slice(0, 80)}
                {dr.whatText.length > 80 ? '…' : ''}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="mt-10 border-t border-[color:var(--color-rule)] pt-6">
        <h2 className="mb-3 text-xl font-[var(--font-display)]">All drafts on this Issue</h2>
        <ul className="space-y-1 text-sm">
          {allDrafts.map((d) => (
            <li key={d.id} className="font-mono text-xs text-[color:var(--color-muted)]">
              {d.id.slice(-8)} · drafted {d.createdAt.toISOString().slice(0, 10)}
              {d.finalizedAt
                ? ` · finalized ${d.finalizedAt.toISOString().slice(0, 10)}`
                : ' · draft'}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function DrField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-1 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {label}
      </h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}

async function Markdown({ md }: { md: string }) {
  const html = await renderMarkdown(md);
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}
