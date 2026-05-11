import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { resolveGovernanceProfile } from '@/server/governance-config';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
import { createIssueAction, createGovernanceIssueAction } from './action';

type RouteParams = { spaceSlug: string };
type SearchParams = { error?: string; type?: string };

export default async function NewIssuePage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireSession();
  const { spaceSlug } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/issues/new`)}`);
  }

  const found = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!found) notFound();
  const { space } = found;
  const profile = resolveGovernanceProfile(space.governanceProfile);
  const { error, type } = await searchParams;
  const isGovernance = type === 'governance';
  const preBootstrap = space.bootstrapCompletedAt === null;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">{isGovernance ? 'Governance change · New' : 'Issue · New'}</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          {isGovernance ? 'Open a governance change' : 'Open an issue'}
        </h1>
      </header>

      {preBootstrap ? (
        <div className="mb-6">
          <Note tone="info">
            Bootstrap is incomplete. Until the Bootstrap Decision Record is finalized, only the
            Bootstrap Issue can be opened.
          </Note>
        </div>
      ) : null}

      {isGovernance ? (
        <div className="mb-6">
          <Note tone="info">
            <strong className="font-medium not-italic">Governance change.</strong> When a Decision
            Record on this Issue is finalized, the proposed governance profile will be applied to
            this Space.
          </Note>
        </div>
      ) : null}

      {error ? (
        <div className="mb-6">
          <Note tone="error">{describeError(error)}</Note>
        </div>
      ) : null}

      <form
        action={isGovernance ? createGovernanceIssueAction : createIssueAction}
        className="space-y-10"
      >
        <input type="hidden" name="spaceId" value={space.id} />

        <Field
          id="title"
          name="title"
          label="Title"
          type="text"
          required
          minLength={1}
          maxLength={200}
        />

        <Textarea
          id="scope"
          name="scope"
          label="Scope"
          required
          minLength={1}
          maxLength={500}
          rows={3}
          hint="What this Issue is about, and what it isn't."
        />

        {isGovernance ? (
          <Textarea
            id="proposedProfile"
            name="proposedProfile"
            label="Proposed governance profile (JSON)"
            mono
            required
            rows={14}
            placeholder={JSON.stringify(profile, null, 2)}
            hint="Paste the full proposed profile JSON. Constitutional floors are enforced at finalization."
          />
        ) : null}

        {profile.scopeTagVocabulary.length > 0 ? (
          <fieldset>
            <legend className="eyebrow mb-2">Scope tags</legend>
            <p className="mb-4 max-w-prose text-(length:--text-caption) leading-(--text-caption--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
              Members tagged with any of these will be auto-included if this Issue becomes a
              referendum.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
              {profile.scopeTagVocabulary.map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-ink)]"
                >
                  <input
                    type="checkbox"
                    name="scopeTags"
                    value={tag}
                    className="h-4 w-4 accent-[color:var(--color-accent)]"
                  />
                  {tag}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {!isGovernance ? (
          <div>
            <label className="flex items-start gap-3 text-(length:--text-small) font-[var(--font-body)] text-[color:var(--color-ink)]">
              <input
                type="checkbox"
                name="hasEcologicalScope"
                className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
              />
              <span>
                <span className="font-medium">This issue has ecological scope</span>
                <span className="mt-0.5 block text-(length:--text-caption) text-[color:var(--color-muted)]">
                  Marks the issue as touching land use, water, species habitat, or other ecological
                  concerns — enabling EIL data attachment when the integration is live.
                </span>
              </span>
            </label>
          </div>
        ) : null}

        <div className="pt-2">
          <Button type="submit">{isGovernance ? 'Open governance Issue' : 'Open Issue'}</Button>
        </div>
      </form>

      {!isGovernance ? (
        <p className="mt-12 text-(length:--text-caption) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          Want to change how this Space governs itself?{' '}
          <a
            href="?type=governance"
            className="not-italic underline underline-offset-4 hover:text-[color:var(--color-accent)]"
          >
            Open a governance change Issue
          </a>
          .
        </p>
      ) : null}

      <footer className="mt-16 border-t border-[color:var(--color-rule)] pt-6">
        <p className="text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          The first event written to this Issue&rsquo;s Civic Memory is{' '}
          <code className="metadata not-italic">issue_created</code>. The timeline is append-only —
          the record never disappears, even if the Issue is later archived.
        </p>
      </footer>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'rate_limited':
      return 'You have reached the daily limit for opening issues. Try again tomorrow.';
    case 'bootstrap_required':
      return 'This Space is still in Bootstrap — only the Bootstrap Issue can be opened right now.';
    case 'invalid_tag':
      return "One or more scope tags do not match this Space's configured vocabulary.";
    case 'validation':
      return 'One of the fields was invalid. Please check and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
