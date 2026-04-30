import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { memberHoldsCapability } from '@/server/delegations';
import { getIssueBySlugForMember } from '@/server/issues';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';
import { Textarea } from '@/components/ui/textarea';
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
    <main
      data-density="editorial"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">
          Decision record · Draft
          {' · '}
          <span className="text-[color:var(--color-ink-soft)] normal-case tracking-normal italic">
            {issue.title}
          </span>
        </div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Draft a decision record
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          A decision record is the official artifact of a decided issue. It captures the outcome,
          the reasons, and what remains unresolved — so the group remembers not just what was
          decided, but why.
        </p>
      </header>

      {!canDraft ? (
        <Note tone="info">
          Only the delegated facilitator may draft a decision record for this issue. See the
          Delegations page to find out who currently holds facilitation.
        </Note>
      ) : (
        <>
          {error ? (
            <div className="mb-6">
              <Note tone="error">{describeError(error)}</Note>
            </div>
          ) : null}

          <form action={draftDecisionRecordAction} className="space-y-10">
            <input type="hidden" name="issueId" value={issue.id} />

            <Textarea
              id="whatText"
              name="whatText"
              label="What was decided"
              required
              minLength={10}
              maxLength={20_000}
              rows={5}
              hint="A crisp description of the outcome — what will (or will not) happen."
            />

            <Textarea
              id="rationaleText"
              name="rationaleText"
              label="Rationale"
              required
              minLength={10}
              maxLength={20_000}
              rows={6}
              hint="The key reasons captured at the time — so future members can understand what mattered then."
            />

            <Textarea
              id="unresolvedObjectionsText"
              name="unresolvedObjectionsText"
              label="Unresolved objections & stand-asides"
              maxLength={20_000}
              rows={4}
              defaultValue="none"
              hint={
                <>
                  Write &ldquo;none&rdquo; if there are no objections. Stand-asides belong here too.
                  Use the literal keyword{' '}
                  <code className="metadata not-italic">BLOCKED</code> to pause finalization.
                </>
              }
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="reviewDate" className="eyebrow">
                Review date
              </label>
              <input
                id="reviewDate"
                type="date"
                name="reviewDate"
                required
                className="border-0 border-b border-[color:var(--color-rule-strong)] bg-transparent px-0 py-3 font-[var(--font-mono)] text-(length:--text-body) leading-(--text-body--line-height) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
              />
              <p className="font-[var(--font-body)] text-(length:--text-caption) leading-(--text-caption--line-height) text-[color:var(--color-muted)] italic">
                Must be in the future. The decision will resurface for review on this date.
              </p>
            </div>

            <div className="pt-2">
              <Button type="submit">Save draft</Button>
            </div>
          </form>

          <section className="mt-20 border-t-2 border-[color:var(--color-ink)] pt-8">
            <header className="mb-6">
              <div className="eyebrow">Finalize</div>
              <h2 className="mt-2 text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
                Finalize an existing draft
              </h2>
              <p className="mt-2 max-w-prose font-[var(--font-body)] text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-muted)] italic">
                Paste the Decision Record ID to finalize. Finalization transitions the issue to{' '}
                <code className="metadata not-italic">decided</code> and writes the record to Civic
                Memory. <strong className="font-medium not-italic">Irreversible.</strong>
              </p>
            </header>
            <form
              action={finalizeAction}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="spaceSlug" value={space.space.slug} />
              <input type="hidden" name="issueSlug" value={issue.slug} />
              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="decisionRecordId" className="eyebrow">
                  Decision Record ID
                </label>
                <input
                  id="decisionRecordId"
                  name="decisionRecordId"
                  required
                  minLength={26}
                  maxLength={26}
                  className="border-0 border-b border-[color:var(--color-rule-strong)] bg-transparent px-0 py-3 font-[var(--font-mono)] text-(length:--text-small) leading-(--text-body--line-height) text-[color:var(--color-ink)] focus:border-[color:var(--color-accent)] focus:outline-none"
                />
              </div>
              <Button type="submit" variant="secondary">
                Finalize
              </Button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'not_facilitator':
      return 'Only the delegated facilitator may draft or finalize a decision record.';
    case 'validation':
      return 'One or more required fields are missing or too short.';
    case 'blocked':
      return 'Finalization is paused because the draft is marked BLOCKED.';
    case 'awareness':
      return 'Awareness quorum is not met — the issue cannot be decided yet.';
    case 'not_found':
      return 'The Decision Record ID was not found.';
    case 'already_finalized':
      return 'That decision record is already finalized.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
