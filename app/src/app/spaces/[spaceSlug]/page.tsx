import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { ensureBootstrapIssue, getSpaceBySlugForMember } from '@/server/spaces';

type RouteParams = { spaceSlug: string };

export default async function SpaceHomePage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  if (!session.ok) {
    const { spaceSlug } = await params;
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}`)}`);
  }

  const { spaceSlug } = await params;
  const result = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!result) notFound();
  const { space } = result;

  const isPreBootstrap = space.bootstrapCompletedAt === null;

  // Idempotently ensure the Bootstrap Issue exists when the founder first
  // lands on a pre-bootstrap Space. `ensureBootstrapIssue` is a no-op when
  // the Issue already exists.
  let bootstrapIssueSlug: string | null = null;
  if (isPreBootstrap) {
    const res = await ensureBootstrapIssue({
      spaceId: space.id,
      founderMemberId: session.value.memberId,
    });
    if (res.ok) bootstrapIssueSlug = res.value.slug;
  }

  return (
    <main className="mx-auto max-w-3xl p-8">
      <header className="mb-6">
        <div className="text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
          Space
        </div>
        <h1 className="text-3xl font-[var(--font-display)]">{space.name}</h1>
        {space.description ? (
          <p className="mt-2 text-[color:var(--color-muted)]">{space.description}</p>
        ) : null}
      </header>

      {isPreBootstrap ? (
        <section className="mb-8 border-l-2 border-[color:var(--color-accent)] pl-4">
          <h2 className="mb-2 text-xl font-[var(--font-display)]">Bootstrap required</h2>
          <p className="mb-3 text-sm">
            Before this Space can decide other questions, it must first decide{' '}
            <em>how decisions get made</em>. That is itself an Issue — the Bootstrap Issue — and it
            is closed via the hardcoded consent meta-method (CR-004).
          </p>
          {bootstrapIssueSlug ? (
            <a
              href={`/spaces/${space.slug}/issues/${bootstrapIssueSlug}` as Route}
              className="inline-block text-sm underline"
            >
              Open the Bootstrap Issue →
            </a>
          ) : null}
        </section>
      ) : null}

      <nav aria-label="Space sections" className="grid gap-3 sm:grid-cols-2">
        <SectionLink
          href={`/spaces/${space.slug}/issues` as Route}
          title="Issues"
          blurb="Decisions in progress and on record."
        />
        <SectionLink
          href={`/spaces/${space.slug}/invite` as Route}
          title="Invite a member"
          blurb="Send a sign-in link to someone new."
        />
        <SectionLink
          href={`/spaces/${space.slug}/settings` as Route}
          title="Governance"
          blurb="Read the active rules for this Space."
        />
      </nav>
    </main>
  );
}

function SectionLink({ href, title, blurb }: { href: Route; title: string; blurb: string }) {
  return (
    <a
      href={href}
      className="block border border-[color:var(--color-rule)] bg-white/50 p-4 hover:bg-white"
    >
      <div className="text-lg font-[var(--font-display)]">{title}</div>
      <div className="text-sm text-[color:var(--color-muted)]">{blurb}</div>
    </a>
  );
}
