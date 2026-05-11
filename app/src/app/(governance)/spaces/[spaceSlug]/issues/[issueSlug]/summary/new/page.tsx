'use server';

import { redirect, notFound } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { getIssueBySlugForMember } from '@/server/issues';
import { publishSummary } from '@/server/civic-memory';
import { memberHoldsCapability } from '@/server/delegations';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';

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
      <main
        data-density="standard"
        className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
      >
        <header className="mb-8 border-b-2 border-[color:var(--color-ink)] pb-4">
          <div className="eyebrow">Summary · Restricted</div>
          <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
            Publish a summary
          </h1>
        </header>
        <Note tone="info">
          Only the delegated facilitator for this issue may publish an Official Summary.
        </Note>
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
    <main
      data-density="editorial"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">
          Official summary · New
          {' · '}
          <span className="tracking-normal text-[color:var(--color-ink-soft)] normal-case italic">
            {issue.title}
          </span>
        </div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Publish an official summary
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          Summaries are versioned and immutable once published. Revisions create a new version;
          prior versions remain in Civic Memory.
        </p>
      </header>

      <form action={action} className="space-y-10">
        <Textarea
          id="body"
          name="body"
          label="Summary (Markdown)"
          required
          rows={18}
          maxLength={20_000}
          placeholder="Summarise the deliberation, key perspectives, areas of agreement, and unresolved questions…"
          hint="Lead with what's unresolved. Give equal depth to minority and majority positions."
        />

        <div className="pt-2">
          <Button type="submit">Publish summary</Button>
        </div>
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
