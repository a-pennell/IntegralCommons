import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getReferendum, listSupporters, listVotes } from '@/server/referenda';
import { getSpaceBySlugForMember } from '@/server/spaces';
import type { Referendum } from '@/db/schema';
import { Button } from '@/components/ui/button';
import { Folio } from '@/components/ui/folio';
import { StatusStamp, type Status } from '@/components/ui/status-stamp';
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

  const [supporters, votes] = await Promise.all([listSupporters(id), listVotes(id)]);

  const tally = { support: 0, oppose: 0, stand_aside: 0 };
  for (const v of votes) tally[v.choice] += 1;
  const totalVotes = tally.support + tally.oppose + tally.stand_aside;

  const alreadySupported = supporters.some((s) => s.supporterMemberId === session.value.memberId);
  const alreadyVoted = votes.some((v) => v.voterMemberId === session.value.memberId);

  return (
    <main
      data-density="dense"
      className="mx-auto w-full max-w-(--container-folio) px-10 py-14"
    >
      <Folio
        marginWidth="240px"
        className=""
        margin={
          <>
            <div className="eyebrow text-[color:var(--color-ink)]">Referendum</div>
            <div className="metadata mt-1 tabular text-[color:var(--color-ink)]">
              REF-{referendum.id.slice(-5).toUpperCase()}
            </div>

            <div className="mt-5">
              <StatusStamp status={referendum.status as Status} />
            </div>

            <div className="mt-6">
              <div className="eyebrow">Target</div>
              <div className="metadata mt-1 tabular">{targetLabel(referendum.targetType)}</div>
            </div>

            {referendum.status === 'initiating' ? (
              <div className="mt-6">
                <div className="eyebrow">Threshold</div>
                <div className="metadata mt-1 tabular text-[color:var(--color-ink)]">
                  {supporters.length} of {referendum.minimumThresholdRequired}
                </div>
                <div className="mt-2 h-px bg-[color:var(--color-rule)] relative">
                  <span
                    aria-hidden
                    className="absolute top-0 left-0 h-px bg-[color:var(--color-accent)]"
                    style={{
                      width: `${Math.min(
                        100,
                        (supporters.length / Math.max(referendum.minimumThresholdRequired, 1)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <div className="eyebrow">Initiated</div>
              <div className="metadata mt-1 tabular">
                {formatShortDate(referendum.createdAt)}
              </div>
            </div>

            {referendum.deliberationStartedAt ? (
              <div className="mt-4">
                <div className="eyebrow">Deliberation began</div>
                <div className="metadata mt-1 tabular text-[color:var(--color-stuart)]">
                  {formatShortDate(referendum.deliberationStartedAt)}
                </div>
              </div>
            ) : null}

            {referendum.votingStartedAt ? (
              <div className="mt-4">
                <div className="eyebrow">Voting opened</div>
                <div className="metadata mt-1 tabular text-[color:var(--color-stuart)]">
                  {formatShortDate(referendum.votingStartedAt)}
                </div>
              </div>
            ) : null}

            {referendum.closedAt ? (
              <div className="mt-4">
                <div className="eyebrow">Closed</div>
                <div className="metadata mt-1 tabular text-[color:var(--color-oxblood)]">
                  {formatShortDate(referendum.closedAt)}
                </div>
              </div>
            ) : null}

            {referendum.outcome ? (
              <div className="mt-6">
                <div className="eyebrow">Outcome</div>
                <div
                  className={`metadata mt-1 tabular font-medium ${
                    referendum.outcome === 'affirmed'
                      ? 'text-[color:var(--color-accent)]'
                      : referendum.outcome === 'revoked'
                        ? 'text-[color:var(--color-oxblood)]'
                        : 'text-[color:var(--color-muted)]'
                  }`}
                >
                  {referendum.outcome.replace('_', ' ')}
                </div>
              </div>
            ) : null}
          </>
        }
      >
        <header className="mb-10">
          <div className="eyebrow">Referendum</div>
          <h1 className="mt-3 text-(length:--text-display) leading-(--text-display--line-height) tracking-(--text-display--letter-spacing) font-[var(--font-display)] font-extrabold text-[color:var(--color-ink)]">
            On {targetLabel(referendum.targetType)}
          </h1>
          <p className="mt-4 max-w-prose font-[var(--font-body)] text-(length:--text-lede) leading-(--text-lede--line-height) text-[color:var(--color-ink-soft)] italic">
            {phaseBlurb(referendum.status)}
          </p>
        </header>

        {/* Action panel — phase-dependent */}
        <ActionPanel
          referendum={referendum}
          spaceSlug={space.space.slug}
          alreadySupported={alreadySupported}
          alreadyVoted={alreadyVoted}
        />

        {/* Ballot — three columns when vote tally is meaningful */}
        {referendum.status === 'voting' || referendum.status === 'closed' ? (
          <section className="mt-12 border-t-2 border-[color:var(--color-ink)] pt-8">
            <header className="mb-6">
              <div className="eyebrow">Tally</div>
              <h2 className="mt-2 text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
                {totalVotes} vote{totalVotes === 1 ? '' : 's'} cast
              </h2>
            </header>

            <div className="grid grid-cols-3 divide-x divide-[color:var(--color-rule)]">
              <TallyColumn label="Support" count={tally.support} total={totalVotes} tone="accent" />
              <TallyColumn label="Oppose" count={tally.oppose} total={totalVotes} tone="oxblood" />
              <TallyColumn
                label="Stand aside"
                count={tally.stand_aside}
                total={totalVotes}
                tone="muted"
              />
            </div>
          </section>
        ) : null}

        {/* Co-signers (initiating phase) */}
        {referendum.status === 'initiating' ? (
          <section className="mt-12 border-t border-[color:var(--color-rule)] pt-6">
            <div className="eyebrow mb-3">Co-signers</div>
            {supporters.length === 0 ? (
              <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
                None yet. The referendum needs {referendum.minimumThresholdRequired} co-signers
                before deliberation can begin.
              </p>
            ) : (
              <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-ink)]">
                <span className="metadata tabular text-[color:var(--color-ink)]">
                  {supporters.length} of {referendum.minimumThresholdRequired}
                </span>{' '}
                co-signers gathered.
              </p>
            )}
          </section>
        ) : null}
      </Folio>
    </main>
  );
}

function ActionPanel({
  referendum,
  spaceSlug,
  alreadySupported,
  alreadyVoted,
}: {
  referendum: Referendum;
  spaceSlug: string;
  alreadySupported: boolean;
  alreadyVoted: boolean;
}) {
  if (referendum.status === 'closed') return null;

  return (
    <section className="border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper-soft)] px-6 py-5">
      <div className="eyebrow mb-3">
        Action · {referendum.status.replace('_', ' ')}
      </div>

      {referendum.status === 'initiating' ? (
        alreadySupported ? (
          <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-ink)] italic">
            You have co-signed this referendum.
          </p>
        ) : (
          <form action={supportReferendumAction} className="flex items-center gap-4">
            <input type="hidden" name="referendumId" value={referendum.id} />
            <input type="hidden" name="spaceSlug" value={spaceSlug} />
            <Button type="submit">Co-sign this referendum</Button>
            <span className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
              Co-signing brings it closer to the threshold for deliberation.
            </span>
          </form>
        )
      ) : null}

      {referendum.status === 'deliberating' ? (
        <form action={startVotingAction} className="flex items-baseline gap-4">
          <input type="hidden" name="referendumId" value={referendum.id} />
          <input type="hidden" name="spaceSlug" value={spaceSlug} />
          <Button type="submit" variant="secondary">
            Start voting
          </Button>
          <span className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
            Deliberation minimum must have elapsed.
          </span>
        </form>
      ) : null}

      {referendum.status === 'voting' ? (
        alreadyVoted ? (
          <div className="space-y-4">
            <p className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-ink)] italic">
              You have cast your vote.
            </p>
            <form action={closeReferendumAction}>
              <input type="hidden" name="referendumId" value={referendum.id} />
              <input type="hidden" name="spaceSlug" value={spaceSlug} />
              <Button type="submit" variant="secondary">
                Close voting & tally
              </Button>
            </form>
          </div>
        ) : (
          <form action={castVoteAction} className="space-y-5">
            <input type="hidden" name="referendumId" value={referendum.id} />
            <input type="hidden" name="spaceSlug" value={spaceSlug} />
            <fieldset>
              <legend className="eyebrow mb-3">Your vote</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    { value: 'support', label: 'Support' },
                    { value: 'oppose', label: 'Oppose' },
                    { value: 'stand_aside', label: 'Stand aside' },
                  ] as const
                ).map((c) => (
                  <label
                    key={c.value}
                    className="flex items-center gap-3 border border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-4 py-3 hover:border-[color:var(--color-rule-strong)]"
                  >
                    <input
                      type="radio"
                      name="choice"
                      value={c.value}
                      required
                      className="h-4 w-4 accent-[color:var(--color-accent)]"
                    />
                    <span className="font-[var(--font-display)] text-(length:--text-body) font-semibold text-[color:var(--color-ink)]">
                      {c.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex items-baseline gap-4 pt-2">
              <Button type="submit">Cast vote</Button>
              <span className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
                Votes are recorded and cannot be changed.
              </span>
            </div>
          </form>
        )
      ) : null}
    </section>
  );
}

function TallyColumn({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: 'accent' | 'oxblood' | 'muted';
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorVar =
    tone === 'accent'
      ? 'var(--color-accent)'
      : tone === 'oxblood'
        ? 'var(--color-oxblood)'
        : 'var(--color-muted)';
  return (
    <div className="px-5 first:pl-0 last:pr-0">
      <div className="eyebrow">{label}</div>
      <div className="mt-2 font-[var(--font-display)] text-(length:--text-title) font-bold text-[color:var(--color-ink)] tabular">
        {count}
      </div>
      <div className="metadata mt-1 tabular">{pct}%</div>
      <div className="mt-3 h-[2px] bg-[color:var(--color-rule)] relative">
        <span
          aria-hidden
          className="absolute top-0 left-0 h-[2px]"
          style={{ width: `${pct}%`, background: colorVar }}
        />
      </div>
    </div>
  );
}

function targetLabel(type: Referendum['targetType']): string {
  switch (type) {
    case 'delegation':
      return 'a delegation';
    case 'decision_record':
      return 'a Decision Record';
    case 'governance_profile_change':
      return 'a governance profile change';
  }
}

function phaseBlurb(status: string): string {
  switch (status) {
    case 'initiating':
      return 'Gathering co-signers. Once the threshold is met, deliberation begins. The system enforces a minimum deliberation floor before voting can open.';
    case 'deliberating':
      return 'Deliberation phase. No votes are cast yet. The group considers perspectives before voting opens.';
    case 'voting':
      return 'Voting is open. Each active member may cast one vote — support, oppose, or stand aside.';
    case 'closed':
      return 'The referendum is closed. The outcome is recorded in Civic Memory and cannot be amended.';
    default:
      return status;
  }
}

function formatShortDate(d: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}
