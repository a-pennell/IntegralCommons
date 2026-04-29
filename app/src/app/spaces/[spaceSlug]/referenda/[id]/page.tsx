import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getReferendum, listSupporters, listVotes } from '@/server/referenda';
import { getSpaceBySlugForMember } from '@/server/spaces';
import {
  castVoteAction,
  closeReferendumAction,
  startVotingAction,
  supportReferendumAction,
} from './action';

type RouteParams = { spaceSlug: string; id: string };

export default async function ReferendumDetailPage({ params }: { params: Promise<RouteParams> }) {
  const session = await requireSession();
  const { spaceSlug, id } = await params;
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}/referenda/${id}`)}`);
  }

  const space = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!space) notFound();

  const referendum = await getReferendum(id);
  if (!referendum || referendum.spaceId !== space.space.id) notFound();

  const supporters = await listSupporters(id);
  const votes = await listVotes(id);

  const tally: Record<'support' | 'oppose' | 'stand_aside', number> = {
    support: 0,
    oppose: 0,
    stand_aside: 0,
  };
  for (const v of votes) tally[v.choice] += 1;

  const alreadySupported = supporters.some((s) => s.supporterMemberId === session.value.memberId);
  const alreadyVoted = votes.some((v) => v.voterMemberId === session.value.memberId);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="mb-2 flex items-center justify-between text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
        <span>{space.space.name} / Referendum</span>
        <span className="font-mono">{referendum.status}</span>
      </div>
      <h1 className="mb-6 text-3xl font-[var(--font-display)]">
        Referendum on{' '}
        {referendum.targetType === 'delegation'
          ? 'a delegation'
          : referendum.targetType === 'decision_record'
            ? 'a Decision Record'
            : 'a governance profile change'}
      </h1>

      <section className="mb-6">
        <h2 className="mb-2 text-xs tracking-[0.15em] text-[color:var(--color-muted)] uppercase">
          Phase
        </h2>
        <p className="text-sm">
          {renderPhaseBlurb(referendum.status)}
          {referendum.status === 'initiating' ? (
            <>
              {' '}
              Threshold: <strong>{supporters.length}</strong> /{' '}
              {referendum.minimumThresholdRequired} supporters.
            </>
          ) : null}
        </p>
      </section>

      {referendum.status === 'initiating' && !alreadySupported ? (
        <form action={supportReferendumAction} className="mb-6">
          <input type="hidden" name="referendumId" value={referendum.id} />
          <input type="hidden" name="spaceSlug" value={space.space.slug} />
          <button
            type="submit"
            className="bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
          >
            Co-sign this referendum
          </button>
        </form>
      ) : null}

      {referendum.status === 'deliberating' ? (
        <form action={startVotingAction} className="mb-6">
          <input type="hidden" name="referendumId" value={referendum.id} />
          <input type="hidden" name="spaceSlug" value={space.space.slug} />
          <button type="submit" className="border border-[color:var(--color-ink)] px-4 py-2">
            Start voting (deliberation minimum must have elapsed — CR-010)
          </button>
        </form>
      ) : null}

      {referendum.status === 'voting' && !alreadyVoted ? (
        <form action={castVoteAction} className="mb-6 flex flex-col gap-3">
          <input type="hidden" name="referendumId" value={referendum.id} />
          <input type="hidden" name="spaceSlug" value={space.space.slug} />
          <fieldset className="flex gap-3">
            <legend className="text-sm">Your vote</legend>
            <label className="flex items-center gap-1">
              <input type="radio" name="choice" value="support" required /> support
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="choice" value="oppose" /> oppose
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="choice" value="stand_aside" /> stand aside
            </label>
          </fieldset>
          <button
            type="submit"
            className="self-start bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)]"
          >
            Cast vote
          </button>
        </form>
      ) : null}

      {referendum.status === 'voting' ? (
        <form action={closeReferendumAction} className="mb-6">
          <input type="hidden" name="referendumId" value={referendum.id} />
          <input type="hidden" name="spaceSlug" value={space.space.slug} />
          <button type="submit" className="border border-[color:var(--color-ink)] px-4 py-2">
            Close voting and tally
          </button>
        </form>
      ) : null}

      <section className="mt-8 border-t border-[color:var(--color-rule)] pt-6">
        <h2 className="mb-2 text-xl font-[var(--font-display)]">Tally</h2>
        <ul className="space-y-1 text-sm">
          <li>support: {tally.support}</li>
          <li>oppose: {tally.oppose}</li>
          <li>stand aside: {tally.stand_aside}</li>
          <li>supporters (initiation): {supporters.length}</li>
        </ul>
        {referendum.outcome ? (
          <p className="mt-3 font-mono text-sm">outcome: {referendum.outcome}</p>
        ) : null}
      </section>
    </main>
  );
}

function renderPhaseBlurb(status: string): string {
  switch (status) {
    case 'initiating':
      return 'Gathering the minimum threshold of co-signers (CR-006). Once reached, deliberation begins.';
    case 'deliberating':
      return 'Deliberation phase — no votes yet. The system enforces a minimum deliberation floor (CR-010).';
    case 'voting':
      return 'Voting is open. Each active member may cast one vote.';
    case 'closed':
      return 'Closed. The outcome is recorded in Civic Memory.';
    default:
      return status;
  }
}
