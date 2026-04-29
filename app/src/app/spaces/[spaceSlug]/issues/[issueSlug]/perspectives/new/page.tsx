import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { resolveGovernanceProfile } from '@/server/governance-config';
import { getIssueBySlugForMember } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
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

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name} / {issue.title}
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">
        {replyTo ? 'Respond to a Perspective' : 'Add a Perspective'}
      </h1>

      {error ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
      ) : null}

      <form action={submitPerspectiveAction} className="flex flex-col gap-4">
        <input type="hidden" name="issueId" value={issue.id} />
        {replyTo ? <input type="hidden" name="parentPerspectiveId" value={replyTo} /> : null}

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">
            Taxonomy
            <span className="block text-xs text-[color:var(--color-muted)]">
              Each Perspective carries one taxonomy tag. Pick the one that best matches the angle
              you&rsquo;re bringing.
            </span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {profile.taxonomyVocabulary.map((t, i) => (
              <label key={t} className="flex items-center gap-1 text-sm">
                <input
                  type="radio"
                  name="taxonomyType"
                  value={t}
                  required
                  defaultChecked={i === 0}
                />
                {t}
              </label>
            ))}
          </div>
        </fieldset>

        <label htmlFor="bodyMarkdown" className="flex flex-col gap-1">
          <span className="text-sm">
            Your perspective{' '}
            <span className="text-[color:var(--color-muted)]">(Markdown accepted)</span>
          </span>
          <textarea
            id="bodyMarkdown"
            name="bodyMarkdown"
            required
            minLength={1}
            maxLength={10_000}
            rows={8}
            className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-sm"
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="fromDirectExperience" value="on" className="mt-1" />
          <span>
            <strong>I&rsquo;m speaking from direct experience</strong> with the matter at hand
            (FR-020). This flag helps the group weigh perspectives — it does not confer veto rights.
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 self-start bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
        >
          Post Perspective
        </button>
      </form>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'validation':
      return 'Something was off with the submission. Check the body and taxonomy.';
    case 'nesting':
      return 'Replies are one level deep. You can respond to the parent Perspective, not a reply.';
    case 'archived':
      return 'This Issue is decided or archived — reopen it to add a Perspective.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
