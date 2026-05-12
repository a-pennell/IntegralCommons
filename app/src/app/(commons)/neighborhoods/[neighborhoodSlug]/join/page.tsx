import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlug, getMembershipForNeighborhood } from '@/server/neighborhoods';
import { Button } from '@/components/ui/button';
import { joinNeighborhoodAction } from './action';

type RouteParams = { neighborhoodSlug: string };

export default async function JoinNeighborhoodPage({ params }: { params: Promise<RouteParams> }) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/join`);

  const neighborhood = await getNeighborhoodBySlug(neighborhoodSlug);
  if (!neighborhood) notFound();

  // Already a member — redirect to the hub.
  const membership = await getMembershipForNeighborhood(neighborhood.id, session.value.memberId);
  if (membership && !membership.leftAt) redirect(`/neighborhoods/${neighborhoodSlug}`);

  return (
    <main className="mx-auto max-w-xl px-6 py-16 sm:px-10 sm:py-20">
      <header className="mb-10 border-b-2 border-[color:var(--color-ink)] pb-4">
        <div className="eyebrow">Local Commons</div>
        <h1 className="mt-2 text-(length:--text-title) leading-(--text-title--line-height) font-[var(--font-display)] font-bold tracking-(--text-title--letter-spacing) text-[color:var(--color-ink)]">
          Join {neighborhood.name}
        </h1>
        {neighborhood.description ? (
          <p className="mt-3 max-w-prose text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink-soft)] italic">
            {neighborhood.description}
          </p>
        ) : null}
        {neighborhood.boundaryDescription ? (
          <p className="mt-2 text-(length:--text-small) text-[color:var(--color-muted)]">
            <span className="font-medium text-[color:var(--color-ink-soft)]">Boundary: </span>
            {neighborhood.boundaryDescription}
          </p>
        ) : null}
      </header>

      <section className="space-y-6">
        {/* Full membership */}
        <form action={joinNeighborhoodAction}>
          <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
          <input type="hidden" name="isAnonymous" value="false" />
          <div className="rounded border border-[color:var(--color-rule)] p-5">
            <h2 className="text-(length:--text-body) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
              Full member
            </h2>
            <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
              Your name is visible to neighbors. You can participate in governance decisions, post
              resources and needs, and send exchange requests.
            </p>
            <div className="mt-4">
              <Button type="submit">Join as full member</Button>
            </div>
          </div>
        </form>

        {/* Anonymous membership */}
        <form action={joinNeighborhoodAction}>
          <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
          <input type="hidden" name="isAnonymous" value="true" />
          <div className="rounded border border-[color:var(--color-rule)] p-5">
            <h2 className="text-(length:--text-body) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
              Anonymous member
            </h2>
            <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
              Your name is not shared with the platform. You can browse the Registry, post Needs,
              and contact neighbors in-platform. You cannot participate in governance decisions or
              earn time credits.
            </p>
            <p className="mt-2 text-(length:--text-caption) text-[color:var(--color-muted)] italic">
              Anonymous membership requires a voucher — a current member who confirms your
              connection to the neighborhood. Let them know you&apos;re joining so they can confirm
              your identity with you directly. Local Commons will not hold this information.
            </p>
            <div className="mt-4">
              <button
                type="submit"
                className="rounded border border-[color:var(--color-rule)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
              >
                Join anonymously
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
