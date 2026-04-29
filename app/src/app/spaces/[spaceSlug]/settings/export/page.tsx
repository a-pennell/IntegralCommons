'use server';

import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { buildOwnDataBundle, writeBundle } from '@/server/export';

type Props = { params: Promise<{ spaceSlug: string }> };

export default async function ExportPage({ params }: Props) {
  const { spaceSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) redirect('/spaces');

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-[var(--font-display)]">Export data</h1>

      <section className="mb-8 border border-[color:var(--color-rule)] p-6">
        <h2 className="mb-2 text-lg font-[var(--font-display)]">Your contributions</h2>
        <p className="mb-4 text-sm text-[color:var(--color-muted)]">
          Download everything you have authored in this Space — Perspectives, Decision Records you
          drafted, delegations you were party to, and your Civic Memory events. No approval
          required.
        </p>
        <form action={ownDataAction.bind(null, space.space.id, session.value.memberId)}>
          <button
            type="submit"
            className="border border-[color:var(--color-ink)] px-4 py-2 text-sm hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)] transition-colors"
          >
            Download my data (JSON)
          </button>
        </form>
      </section>

      <section className="border border-[color:var(--color-rule)] p-6">
        <h2 className="mb-2 text-lg font-[var(--font-display)]">Full Space export</h2>
        <p className="mb-4 text-sm text-[color:var(--color-muted)]">
          A complete export of all Space data requires a Decision Record that authorizes the
          export. Open a governance Issue and include export authorization in the Decision Record,
          then return here with the Decision Record ID.
        </p>
        <p className="text-xs text-[color:var(--color-muted)]">
          Space-wide exports are governed actions — they appear in Civic Memory and require explicit
          group authorization per CR-003 (Forkability).
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
