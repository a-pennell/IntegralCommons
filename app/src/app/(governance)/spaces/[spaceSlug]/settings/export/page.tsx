'use server';

import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { buildOwnDataBundle, buildSpaceWideBundle, writeBundle } from '@/server/export';
import { Button } from '@/components/ui/button';
import { Note } from '@/components/ui/note';

type Props = {
  params: Promise<{ spaceSlug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function ExportPage({ params, searchParams }: Props) {
  const { spaceSlug } = await params;
  const { error } = await searchParams;
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) redirect('/spaces');

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-6 py-10 sm:px-10 sm:py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Settings · Export</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Take your record
        </h1>
        <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
          Your contributions belong to you. Full Space export is a governed action and requires a
          Decision Record — a constitutional check on Forkability.
        </p>
      </header>

      <section className="mb-12 border-t border-[color:var(--color-rule-strong)] pt-8">
        <div className="eyebrow mb-2 text-[color:var(--color-ink)]">Your contributions</div>
        <h2 className="mb-3 text-(length:--text-heading) leading-(--text-heading--line-height) font-[var(--font-display)] font-bold tracking-(--text-heading--letter-spacing) text-[color:var(--color-ink)]">
          Download what you have authored
        </h2>
        <p className="mb-5 max-w-prose text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
          Everything you have written in this Space — perspectives, drafted decision records,
          delegations you were party to, and your Civic Memory events.{' '}
          <span className="text-[color:var(--color-muted)] italic">No approval required.</span>
        </p>
        <form action={ownDataAction.bind(null, space.space.id, session.value.memberId)}>
          <Button type="submit">Download my data (JSON)</Button>
        </form>
      </section>

      <section className="border-t border-[color:var(--color-rule-strong)] pt-8">
        <div className="eyebrow mb-2 text-[color:var(--color-ink)]">Full Space export</div>
        <h2 className="mb-3 text-(length:--text-heading) leading-(--text-heading--line-height) font-[var(--font-display)] font-bold tracking-(--text-heading--letter-spacing) text-[color:var(--color-ink)]">
          Governed action
        </h2>
        <p className="mb-4 max-w-prose text-(length:--text-body) leading-(--text-body--line-height) font-[var(--font-body)] text-[color:var(--color-ink)]">
          A complete export of all Space data requires a Decision Record that authorises the export.
          Open a governance issue, drive it to a finalized Decision Record, then paste the Decision
          Record ID below.
        </p>
        <p className="mb-6 max-w-prose text-(length:--text-small) leading-(--text-small--line-height) font-[var(--font-body)] text-[color:var(--color-muted)] italic">
          Space-wide exports appear in Civic Memory and require explicit group authorisation. This
          is the constitutional expression of Forkability — the right to leave is real, but it is a
          group decision, not a private one.
        </p>

        {error ? (
          <div className="mb-6">
            <Note tone="error">{describeError(error)}</Note>
          </div>
        ) : null}

        <form
          action={spaceWideExportAction.bind(null, space.space.id, session.value.memberId)}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="decisionRecordId"
              className="eyebrow mb-1 block text-[color:var(--color-ink)]"
            >
              Decision Record ID
            </label>
            <input
              id="decisionRecordId"
              name="decisionRecordId"
              type="text"
              required
              placeholder="01ABCDEFGHJKMNPQRSTVWXYZ01"
              className="w-full rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) font-[var(--font-mono)] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
            />
            <p className="mt-1 text-(length:--text-caption) text-[color:var(--color-muted)] italic">
              Find this on the Decision Record page — the 26-character ID shown in the margin.
            </p>
          </div>
          <Button type="submit">Download full Space export (JSON)</Button>
        </form>
      </section>
    </main>
  );
}

function describeError(kind: string): string {
  switch (kind) {
    case 'invalid_id':
      return 'That does not look like a valid Decision Record ID. Copy it directly from the Decision Record page.';
    case 'dr_not_found':
      return 'Decision Record not found. Check the ID and try again.';
    case 'not_authorized':
      return 'That Decision Record has not been finalized, has been superseded, or does not authorize an export. Only a current, finalized DR grants access.';
    case 'export_failed':
      return 'The export could not be generated. Try again, or contact your Space steward.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

async function ownDataAction(spaceId: string, memberId: string) {
  'use server';
  const bundleResult = await buildOwnDataBundle({ memberId, spaceId });
  if (!bundleResult.ok) return;

  const { downloadUrl } = await writeBundle(bundleResult.value, `exports/own/${memberId}`);
  redirect(downloadUrl);
}

async function spaceWideExportAction(spaceId: string, memberId: string, formData: FormData) {
  'use server';
  const decisionRecordId = String(formData.get('decisionRecordId') ?? '').trim();
  if (decisionRecordId.length !== 26) {
    redirect('?error=invalid_id');
  }

  const result = await buildSpaceWideBundle({
    spaceId,
    requestingMemberId: memberId,
    authorizingDecisionRecordId: decisionRecordId,
  });

  if (!result.ok) {
    const code =
      result.error.kind === 'NotFound'
        ? 'dr_not_found'
        : result.error.kind === 'NotAuthorized'
          ? 'not_authorized'
          : 'export_failed';
    redirect(`?error=${code}`);
  }

  const { downloadUrl } = await writeBundle(result.value, `exports/space/${spaceId}`);
  redirect(downloadUrl);
}
