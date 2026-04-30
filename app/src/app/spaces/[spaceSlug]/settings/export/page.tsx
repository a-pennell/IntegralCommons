'use server';

import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { buildOwnDataBundle, writeBundle } from '@/server/export';
import { Button } from '@/components/ui/button';

type Props = { params: Promise<{ spaceSlug: string }> };

export default async function ExportPage({ params }: Props) {
  const { spaceSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) redirect('/spaces');

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-prose) px-10 py-14"
    >
      <header className="mb-12 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Settings · Export</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) tracking-(--text-title--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Take your record
        </h1>
        <p className="mt-3 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
          Your contributions belong to you. Full Space export is a governed action and requires a
          Decision Record — a constitutional check on Forkability.
        </p>
      </header>

      <section className="mb-12 border-t border-[color:var(--color-rule-strong)] pt-8">
        <div className="mb-2 eyebrow text-[color:var(--color-ink)]">Your contributions</div>
        <h2 className="mb-3 text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Download what you have authored
        </h2>
        <p className="mb-5 max-w-prose font-[var(--font-body)] text-(length:--text-body) leading-(--text-body--line-height) text-[color:var(--color-ink)]">
          Everything you have written in this Space — perspectives, drafted decision records,
          delegations you were party to, and your Civic Memory events.{' '}
          <span className="text-[color:var(--color-muted)] italic">No approval required.</span>
        </p>
        <form action={ownDataAction.bind(null, space.space.id, session.value.memberId)}>
          <Button type="submit">Download my data (JSON)</Button>
        </form>
      </section>

      <section className="border-t border-[color:var(--color-rule-strong)] pt-8">
        <div className="mb-2 eyebrow text-[color:var(--color-ink)]">Full Space export</div>
        <h2 className="mb-3 text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          Governed action
        </h2>
        <p className="mb-3 max-w-prose font-[var(--font-body)] text-(length:--text-body) leading-(--text-body--line-height) text-[color:var(--color-ink)]">
          A complete export of all Space data requires a Decision Record that authorises the
          export. Open a governance issue, drive it to a Decision Record that includes the
          authorisation, then return here with the Decision Record ID.
        </p>
        <p className="max-w-prose font-[var(--font-body)] text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-muted)] italic">
          Space-wide exports appear in Civic Memory and require explicit group authorisation. This
          is the constitutional expression of Forkability — the right to leave is real, but it is a
          group decision, not a private one.
        </p>
      </section>
    </main>
  );
}

async function ownDataAction(spaceId: string, memberId: string) {
  'use server';
  const bundleResult = await buildOwnDataBundle({ memberId, spaceId });
  if (!bundleResult.ok) return;

  const { downloadUrl } = await writeBundle(bundleResult.value, `exports/own/${memberId}`);
  redirect(downloadUrl);
}
