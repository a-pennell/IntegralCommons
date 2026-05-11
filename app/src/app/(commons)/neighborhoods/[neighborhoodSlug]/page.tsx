import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listResourcesForNeighborhood } from '@/server/resources';
import { listActiveNeedsOffers } from '@/server/needs-offers';
import { listTransactionsForMember, computeBalance } from '@/server/time-credits';

type RouteParams = { neighborhoodSlug: string };
type SearchParams = { onboarding?: string; joined?: string };

export default async function NeighborhoodPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug } = await params;
  const { onboarding, joined } = await searchParams;
  const isOnboarding = onboarding === 'true';
  const isNewJoin = joined === 'true' || joined === 'anonymous';
  const isAnonymousJoin = joined === 'anonymous';
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const [resources, needs, offers, transactions] = await Promise.all([
    listResourcesForNeighborhood(result.neighborhood.id),
    listActiveNeedsOffers(result.neighborhood.id, 'need'),
    listActiveNeedsOffers(result.neighborhood.id, 'offer'),
    listTransactionsForMember(result.neighborhood.id, session.value.memberId, 50),
  ]);

  const balance = computeBalance(transactions);
  const hasCredits = transactions.length > 0;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-start justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Local Commons</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            {result.neighborhood.name}
          </h1>
          {result.neighborhood.description ? (
            <p className="mt-1 text-(length:--text-small) text-[color:var(--color-muted)]">
              {result.neighborhood.description}
            </p>
          ) : null}
          {result.neighborhood.boundaryDescription ? (
            <p className="mt-2 flex items-baseline gap-1.5 text-(length:--text-caption) text-[color:var(--color-muted)]">
              <span className="shrink-0 font-medium text-[color:var(--color-ink-soft)]">
                Boundary:
              </span>
              {result.neighborhood.boundaryDescription}
            </p>
          ) : null}
        </div>

        {/* Balance chip — only shown once member has credit activity */}
        {hasCredits ? (
          <Link
            href={`/neighborhoods/${neighborhoodSlug}/credits`}
            className="flex items-center gap-1.5 rounded border border-[color:var(--color-rule)] px-3 py-1.5 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
          >
            <span className="tabular text-(length:--text-small) font-[var(--font-mono)] font-medium text-[color:var(--color-ink)]">
              {balance.toFixed(1)}
            </span>
            <span className="text-(length:--text-caption) text-[color:var(--color-muted)]">
              {Math.abs(balance) === 1 ? 'hr' : 'hrs'}
            </span>
          </Link>
        ) : null}
      </header>

      {/* New-member welcome banner */}
      {isNewJoin ? (
        <div className="mb-6 rounded border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] px-5 py-4">
          <p className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
            Welcome to {result.neighborhood.name}!{' '}
            {isAnonymousJoin
              ? 'You joined anonymously — your name is not shared with the platform. Browse the Registry and post Needs at any time.'
              : 'Add a resource to introduce yourself to the neighborhood, or browse what your neighbors have to share.'}
          </p>
        </div>
      ) : null}

      {/* Pre-seed onboarding checklist — shown once right after creation */}
      {isOnboarding && result.membership.role === 'steward' ? (
        <div className="mb-8 rounded border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] p-5">
          <div className="eyebrow mb-1 text-[color:var(--color-accent)]">Launch checklist</div>
          <h2 className="mb-3 text-(length:--text-body) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Seed your neighborhood before you invite anyone
          </h2>
          <p className="mb-4 text-(length:--text-small) text-[color:var(--color-ink-soft)]">
            An empty Registry signals abandonment. A seeded one signals possibility. Aim for 10–15
            resources before your first invite goes out.
          </p>
          <ol className="mb-5 space-y-3 text-(length:--text-small) text-[color:var(--color-ink)]">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-accent)] text-(length:--text-caption) font-bold text-[color:var(--color-accent)]">
                1
              </span>
              <span>
                <Link
                  href={`/neighborhoods/${neighborhoodSlug}/resources/new`}
                  className="font-medium text-[color:var(--color-accent)] hover:underline"
                >
                  Add your first resources
                </Link>{' '}
                — tools, skills, spaces, and materials you can share. Common starting points: drill,
                ladder, sewing machine, meeting space, a skill you enjoy teaching.
                {resources.length > 0 ? (
                  <span className="ml-2 text-[color:var(--color-muted)]">
                    ({resources.length} added so far)
                  </span>
                ) : null}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-accent)] text-(length:--text-caption) font-bold text-[color:var(--color-accent)]">
                2
              </span>
              <span>
                <strong>Share the join link</strong> with close neighbors first — people you&apos;ve
                already confirmed resources with.{' '}
                <span className="text-(length:--text-caption) font-[var(--font-mono)] text-[color:var(--color-muted)]">
                  /neighborhoods/{neighborhoodSlug}/join
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--color-accent)] text-(length:--text-caption) font-bold text-[color:var(--color-accent)]">
                3
              </span>
              <span>
                <Link
                  href={`/neighborhoods/${neighborhoodSlug}/charter`}
                  className="font-medium text-[color:var(--color-accent)] hover:underline"
                >
                  Review the template charter
                </Link>{' '}
                — it was pre-seeded for you. Edit sections to match your neighborhood&apos;s
                agreements, then ratify together at your launch event.
              </span>
            </li>
          </ol>
          <div className="flex gap-3">
            <Link
              href={`/neighborhoods/${neighborhoodSlug}/resources/new`}
              className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white hover:bg-[color:var(--color-oxblood)]"
            >
              Add first resource →
            </Link>
            <Link
              href={`/neighborhoods/${neighborhoodSlug}`}
              className="rounded border border-[color:var(--color-rule)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)]"
            >
              Dismiss
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/resources`}
          label="Resources"
          count={resources.length}
          description="Tools, spaces, and skills to borrow or share"
        />
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers`}
          label="Needs"
          count={needs.length}
          description="Active requests from neighbors"
        />
        <SummaryCard
          href={`/neighborhoods/${neighborhoodSlug}/needs-offers?tab=offers`}
          label="Offers"
          count={offers.length}
          description="Things neighbors are offering"
        />
      </div>
    </main>
  );
}

function SummaryCard({
  href,
  label,
  count,
  description,
}: {
  href: string;
  label: string;
  count: number;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded border border-[color:var(--color-rule)] p-4 transition-colors hover:border-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]"
    >
      <div className="tabular text-[28px] leading-none font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
        {count}
      </div>
      <div className="mt-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
        {label}
      </div>
      <p className="mt-1 text-(length:--text-caption) text-[color:var(--color-muted)]">
        {description}
      </p>
    </Link>
  );
}
