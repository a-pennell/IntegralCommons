import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { memberHoldsCapability } from '@/server/delegations';
import { getIssueBySlugForMember } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { draftDecisionRecordAction, finalizeAction } from './action';

type RouteParams = { spaceSlug: string; issueSlug: string };
type SearchParams = { error?: string };

export default async function DecisionDraftPage({
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
        `/spaces/${spaceSlug}/issues/${issueSlug}/decision/draft`,
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

  const holds = await memberHoldsCapability({
    spaceId: issue.spaceId,
    issueId: issue.id,
    memberId: session.value.memberId,
    capability: 'facilitation',
  });
  const isBootstrap = issue.isBootstrap && space.space.bootstrapCompletedAt === null;
  const canDraft = holds || isBootstrap;

  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        {space.space.name} / {issue.title}
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">Draft a Decision Record</h1>

      {!canDraft ? (
        <p className="text-sm text-[color:var(--color-accent)]">
          Only the delegated facilitator may draft a Decision Record for this Issue. See the
          Delegations page to find out who currently holds facilitation.
        </p>
      ) : (
        <>
          {error ? (
            <p className="mb-4 text-sm text-[color:var(--color-accent)]">{describeError(error)}</p>
          ) : null}

          <form action={draftDecisionRecordAction} className="flex flex-col gap-4">
            <input type="hidden" name="issueId" value={issue.id} />

            <Field
              label="What was decided"
              hint="A crisp description of the outcome — what will (or will not) happen."
            >
              <textarea
                name="whatText"
                required
                minLength={10}
                maxLength={20_000}
                rows={5}
                className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-sm"
              />
            </Field>

            <Field
              label="Rationale"
              hint="The key reasons captured at the time — so future members can understand what mattered then."
            >
              <textarea
                name="rationaleText"
                required
                minLength={10}
                maxLength={20_000}
                rows={6}
                className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-sm"
              />
            </Field>

            <Field
              label="Unresolved objections / stand-asides"
              hint='Write "none" if there are no objections. Stand-asides belong here too. Use the literal keyword "BLOCKED" to pause finalization.'
            >
              <textarea
                name="unresolvedObjectionsText"
                maxLength={20_000}
                rows={4}
                className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-sm"
                defaultValue="none"
              />
            </Field>

            <Field label="Review date" hint="Must be in the future (FR-023).">
              <input
                type="date"
                name="reviewDate"
                required
                className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-sm"
              />
            </Field>

            <button
              type="submit"
              className="mt-2 self-start bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
            >
              Save draft
            </button>
          </form>

          <section className="mt-10 border-t border-[color:var(--color-rule)] pt-6">
            <h2 className="mb-3 text-xl font-[var(--font-display)]">Finalize an existing draft</h2>
            <p className="mb-3 text-sm text-[color:var(--color-muted)]">
              Paste the Decision Record ID to finalize. Finalization transitions the Issue to{' '}
              <code>decided</code> and writes the record to Civic Memory.
            </p>
            <form action={finalizeAction} className="flex items-end gap-2">
              <input type="hidden" name="spaceSlug" value={space.space.slug} />
              <input type="hidden" name="issueSlug" value={issue.slug} />
              <label className="flex flex-1 flex-col gap-1">
                <span className="text-xs">Decision Record ID</span>
                <input
                  name="decisionRecordId"
                  required
                  minLength={26}
                  maxLength={26}
                  className="border border-[color:var(--color-rule)] bg-white p-2 font-mono text-sm"
                />
              </label>
              <button
                type="submit"
                className="bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
              >
                Finalize
              </button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm">{label}</span>
      <span className="text-xs text-[color:var(--color-muted)]">{hint}</span>
      {children}
    </label>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'not_facilitator':
      return 'Only the delegated facilitator may draft or finalize a Decision Record.';
    case 'validation':
      return 'One or more required fields are missing or too short.';
    case 'blocked':
      return 'Finalization is paused because the draft is marked BLOCKED.';
    case 'awareness':
      return 'Awareness quorum is not met — the Issue cannot be decided yet (CR-011).';
    case 'not_found':
      return 'The Decision Record ID was not found.';
    case 'already_finalized':
      return 'That Decision Record is already finalized.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
