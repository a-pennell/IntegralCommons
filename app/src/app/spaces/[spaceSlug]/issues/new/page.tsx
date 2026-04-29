import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { resolveGovernanceProfile } from '@/server/governance-config';
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
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.name}
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">New Issue</h1>

      {preBootstrap ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">
          Bootstrap is incomplete. Until the Bootstrap Decision Record is finalized, only the
          Bootstrap Issue can be opened (CR-004).
        </p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
      ) : null}

      {isGovernance && (
        <div className="mb-4 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] p-3 text-sm">
          <strong>Governance change Issue</strong> — when a Decision Record on this Issue is
          finalized, the proposed governance profile will be applied to this Space (US9, CR-008,
          CR-009).
        </div>
      )}

      <form
        action={isGovernance ? createGovernanceIssueAction : createIssueAction}
        className="flex flex-col gap-4"
      >
        <input type="hidden" name="spaceId" value={space.id} />

        <label htmlFor="title" className="flex flex-col gap-1">
          <span className="text-sm">Title</span>
          <input
            id="title"
            name="title"
            required
            minLength={1}
            maxLength={200}
            className="border border-[color:var(--color-rule)] bg-white p-2"
          />
        </label>

        <label htmlFor="scope" className="flex flex-col gap-1">
          <span className="text-sm">
            Scope{' '}
            <span className="text-[color:var(--color-muted)]">(what this Issue is about)</span>
          </span>
          <textarea
            id="scope"
            name="scope"
            required
            minLength={1}
            maxLength={500}
            rows={3}
            className="border border-[color:var(--color-rule)] bg-white p-2"
          />
        </label>

        {isGovernance && (
          <label htmlFor="proposedProfile" className="flex flex-col gap-1">
            <span className="text-sm">
              Proposed governance profile{' '}
              <span className="text-[color:var(--color-muted)]">(JSON)</span>
            </span>
            <textarea
              id="proposedProfile"
              name="proposedProfile"
              required
              rows={12}
              placeholder={JSON.stringify(profile, null, 2)}
              className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-xs"
            />
            <span className="text-xs text-[color:var(--color-muted)]">
              Paste the full proposed profile JSON. Constitutional floors (CR-008, CR-009) are
              enforced at finalization.
            </span>
          </label>
        )}

        {profile.scopeTagVocabulary.length > 0 ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm">
              Scope tags
              <span className="block text-xs text-[color:var(--color-muted)]">
                Select the tags that match — members tagged with any of these will be auto-included
                if this Issue becomes a referendum (CR-007).
              </span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {profile.scopeTagVocabulary.map((tag) => (
                <label key={tag} className="flex items-center gap-1 text-sm">
                  <input type="checkbox" name="scopeTags" value={tag} />
                  {tag}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <button
          type="submit"
          className="mt-2 bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
        >
          {isGovernance ? 'Open governance Issue' : 'Open Issue'}
        </button>
      </form>

      {!isGovernance && (
        <p className="mt-4 text-xs text-[color:var(--color-muted)]">
          Want to change how this Space governs itself?{' '}
          <a href={`?type=governance`} className="underline">
            Open a governance change Issue
          </a>
          .
        </p>
      )}

      <p className="mt-8 text-sm text-[color:var(--color-muted)]">
        The first event written to this Issue&rsquo;s Civic Memory is <code>issue_created</code>.
        The timeline is append-only — the record never disappears, even if the Issue is later
        archived.
      </p>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'rate_limited':
      return 'You have reached the daily limit for creating Issues. Try again tomorrow (CR-009).';
    case 'bootstrap_required':
      return 'This Space is still in Bootstrap — only the Bootstrap Issue can be opened right now (CR-004).';
    case 'invalid_tag':
      return 'One or more scope tags do not match this Space’s configured vocabulary (CR-007).';
    case 'validation':
      return 'One of the fields was invalid. Please check and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
