import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getIssueBySlugForMember } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { memberHoldsCapability } from '@/server/delegations';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
import { updateIssueAction } from './action';

type RouteParams = { spaceSlug: string; issueSlug: string };
type SearchParams = { error?: string };

export default async function EditIssuePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug, issueSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=/spaces/${spaceSlug}/issues/${issueSlug}/edit`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const issue = await getIssueBySlugForMember({
    spaceId: space.space.id,
    slug: issueSlug,
    viewerMemberId: session.value.memberId,
  });
  if (!issue) notFound();

  if (issue.status === 'decided' || issue.status === 'archived') {
    redirect(`/spaces/${spaceSlug}/issues/${issueSlug}`);
  }

  const hasFacilitation = await memberHoldsCapability({
    spaceId: space.space.id,
    issueId: issue.id,
    memberId: session.value.memberId,
    capability: 'facilitation',
  });

  const { error } = await searchParams;

  if (!hasFacilitation) {
    return (
      <main
        data-density="standard"
        className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
      >
        <header className="mb-8 border-b-2 border-[color:var(--color-ink)] pb-4">
          <div className="eyebrow">Issue · Edit · Restricted</div>
          <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
            {issue.title}
          </h1>
        </header>
        <Note tone="info">Only the delegated facilitator may edit an issue&rsquo;s framing.</Note>
      </main>
    );
  }

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Issue · Edit</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Refine the framing
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          Editing writes an <code className="metadata not-italic">issue_edited</code> event to the
          Civic Memory timeline. Prior framings are not erased — they live in the record.
        </p>
      </header>

      {error ? (
        <div className="mb-8">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form action={updateIssueAction} className="space-y-10">
        <input type="hidden" name="issueId" value={issue.id} />
        <input type="hidden" name="spaceId" value={space.space.id} />
        <input type="hidden" name="spaceSlug" value={space.space.slug} />
        <input type="hidden" name="issueSlug" value={issue.slug} />

        <Field
          id="title"
          name="title"
          label="Title"
          type="text"
          required
          minLength={1}
          maxLength={200}
          defaultValue={issue.title}
        />

        <Textarea
          id="scope"
          name="scope"
          label="Scope"
          required
          minLength={1}
          maxLength={500}
          rows={3}
          defaultValue={issue.scope}
          hint="What is included in this issue, and what is explicitly out of scope?"
        />

        <div className="pt-2">
          <Button type="submit">Save framing</Button>
        </div>
      </form>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'not_facilitator':
      return 'Only the delegated facilitator may edit an issue.';
    case 'validation':
      return 'One or more fields were invalid. Please check and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
