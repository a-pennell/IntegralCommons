import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { resolveGovernanceProfile } from '@/server/governance-config';
import { getIssueBySlugForMember } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
import { submitPerspectiveAction } from './action';

type RouteParams = { spaceSlug: string; issueSlug: string };
type SearchParams = { replyTo?: string; error?: string };

export default async function NewPerspectivePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug, issueSlug } = await params;
  if (!session.ok) {
    redirect(
      `/login?next=${encodeURIComponent(
        `/spaces/${spaceSlug}/issues/${issueSlug}/perspectives/new`,
      )}`,
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

  const profile = resolveGovernanceProfile(space.space.governanceProfile);
  const { replyTo, error } = await searchParams;
  const isReply = Boolean(replyTo);

  return (
    <main
      data-density="editorial"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">
          {isReply ? 'Perspective · Reply' : 'Perspective · New'}
          {' · '}
          <span className="tracking-normal text-[color:var(--color-ink-soft)] normal-case italic">
            {issue.title}
          </span>
        </div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          {isReply ? 'Respond to a perspective' : 'Add a perspective'}
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          A perspective is a first-class contribution, not a comment. It carries one taxonomy and
          may speak from direct experience.
        </p>
      </header>

      {error ? (
        <div className="mb-6">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form action={submitPerspectiveAction} className="space-y-10">
        <input type="hidden" name="issueId" value={issue.id} />
        {replyTo ? <input type="hidden" name="parentPerspectiveId" value={replyTo} /> : null}

        <fieldset>
          <legend className="eyebrow mb-2">Taxonomy</legend>
          <p className="mb-4 max-w-prose text-(length:--text-caption) leading-(--text-caption--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
            Each perspective carries one taxonomy. Pick the one that best matches the angle you're
            bringing.
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {profile.taxonomyVocabulary.map((t, i) => (
              <label
                key={t}
                className="flex items-center gap-2 text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-ink)]"
              >
                <input
                  type="radio"
                  name="taxonomyType"
                  value={t}
                  required
                  defaultChecked={i === 0}
                  className="h-4 w-4 accent-[color:var(--color-accent)]"
                />
                <span className="capitalize">{t}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Textarea
          id="bodyMarkdown"
          name="bodyMarkdown"
          label="Your perspective"
          required
          minLength={1}
          maxLength={10_000}
          rows={10}
          hint="Markdown accepted. Generous typography is part of the point — write what's worth saying."
        />

        <label className="flex items-start gap-3 text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)]">
          <input
            type="checkbox"
            name="fromDirectExperience"
            value="on"
            className="mt-[5px] h-4 w-4 accent-[color:var(--color-accent)]"
          />
          <span className="text-[color:var(--color-ink)]">
            <strong className="font-medium">I'm speaking from direct experience</strong> with the
            matter at hand.{' '}
            <span className="text-[color:var(--color-muted)] italic">
              This flag helps the group weigh perspectives — it does not confer veto rights.
            </span>
          </span>
        </label>

        <div className="pt-2">
          <Button type="submit">Post perspective</Button>
        </div>
      </form>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'validation':
      return 'Something was off with the submission. Check the body and taxonomy.';
    case 'nesting':
      return 'Replies are one level deep. You can respond to the parent perspective, not a reply.';
    case 'archived':
      return 'This issue is decided or archived — reopen it to add a perspective.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
