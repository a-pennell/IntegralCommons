'use server';

import { redirect, notFound } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { getIssueBySlugForMember } from '@/server/issues';
import { publishSummary } from '@/server/civic-memory';
import { memberHoldsCapability } from '@/server/delegations';

type Props = { params: Promise<{ spaceSlug: string; issueSlug: string }> };

export default async function NewSummaryPage({ params }: Props) {
  const { spaceSlug, issueSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/spaces/${spaceSlug}/issues/${issueSlug}/summary/new`);

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const issue = await getIssueBySlugForMember({
    spaceId: space.space.id,
    slug: issueSlug,
    viewerMemberId: session.value.memberId,
  });
  if (!issue) notFound();

  const hasFacilitation = await memberHoldsCapability({
    spaceId: space.space.id,
    issueId: issue.id,
    memberId: session.value.memberId,
    capability: 'facilitation',
  });

  if (!hasFacilitation) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-4 text-2xl font-[var(--font-display)]">Publish a summary</h1>
        <p className="text-[color:var(--color-muted)]">
          Only the delegated facilitator for this Issue may publish an Official Summary.
        </p>
      </main>
    );
  }

  const action = publishSummaryAction.bind(
    null,
    issue.id,
    space.space.id,
    session.value.memberId,
    spaceSlug,
    issueSlug,
  );

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name} / {issue.title}
      </div>
      <h1 className="mb-6 text-2xl font-[var(--font-display)]">Publish an official summary</h1>
      <p className="mb-6 text-sm text-[color:var(--color-muted)]">
        Summaries are versioned and immutable once published. Revisions create a new version;
        prior versions remain in Civic Memory.
      </p>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="body" className="mb-1 block text-sm font-medium">
            Summary (Markdown)
          </label>
          <textarea
            id="body"
            name="body"
            rows={16}
            required
            maxLength={20_000}
            placeholder="Summarise the deliberation, key Perspectives, areas of agreement, and unresolved questions…"
            className="w-full border border-[color:var(--color-rule)] p-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[color:var(--color-ink)]"
          />
        </div>
        <button
          type="submit"
          className="border border-[color:var(--color-ink)] px-6 py-2 text-sm hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)] transition-colors"
        >
          Publish summary
        </button>
      </form>
    </main>
  );
}

async function publishSummaryAction(
  issueId: string,
  spaceId: string,
  authorMemberId: string,
  spaceSlug: string,
  issueSlug: string,
  formData: FormData,
) {
  'use server';
  const body = String(formData.get('body') ?? '');
  await publishSummary({ issueId, spaceId, authorMemberId, bodyMarkdown: body });
  redirect(`/spaces/${spaceSlug}/issues/${issueSlug}`);
}
