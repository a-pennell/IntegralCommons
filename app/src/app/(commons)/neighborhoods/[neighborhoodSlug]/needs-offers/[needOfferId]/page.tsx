import { notFound, redirect } from 'next/navigation';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { getNeedOfferById, listExchangeRequestsForItem } from '@/server/needs-offers';
import { withdrawAction } from './withdraw/action';
import { respondAction } from './respond/action';
import {
  acceptExchangeAction,
  declineExchangeAction,
  completeExchangeAction,
} from './exchange/action';

type RouteParams = { neighborhoodSlug: string; needOfferId: string };
type SearchParams = { error?: string; responded?: string };

const MODE_LABEL: Record<string, string> = { gift: 'Gift', time_credit: 'Time credit' };
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default async function NeedOfferDetailPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<SearchParams>;
}) {
  const { neighborhoodSlug, needOfferId } = await params;
  const { error, responded } = await searchParams;
  const session = await requireSession();
  if (!session.ok)
    redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/needs-offers/${needOfferId}`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const item = await getNeedOfferById(needOfferId);
  if (!item || item.neighborhoodId !== result.neighborhood.id) notFound();

  const isOwner = item.postedByMemberId === session.value.memberId;
  const isActive = item.status === 'active';

  const requests = isOwner ? await listExchangeRequestsForItem(needOfferId) : [];

  const back = `/neighborhoods/${neighborhoodSlug}/needs-offers` as Route;

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <a
        href={back}
        className="mb-6 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
      >
        ← Needs &amp; Offers
      </a>

      {/* Item card */}
      <div className="mb-8 rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)] p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-[color:var(--color-paper-deep)] px-2 py-0.5 text-[10px] font-[var(--font-mono)] tracking-wider text-[color:var(--color-muted)] uppercase">
            {item.type}
          </span>
          {item.isUrgent && isActive ? (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium tracking-wider text-red-600 uppercase">
              Urgent
            </span>
          ) : null}
          {!isActive ? (
            <span className="rounded bg-[color:var(--color-paper-deep)] px-2 py-0.5 text-[10px] font-[var(--font-mono)] tracking-wider text-[color:var(--color-muted)] uppercase">
              {item.status}
            </span>
          ) : null}
        </div>

        <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          {item.title}
        </h1>

        {item.body ? (
          <p className="mt-3 text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
            {item.body}
          </p>
        ) : null}

        {item.expiresAt ? (
          <p className="metadata mt-4 text-[color:var(--color-muted)]">
            Expires{' '}
            {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(item.expiresAt)}
          </p>
        ) : null}

        {isOwner && isActive ? (
          <form
            action={withdrawAction}
            className="mt-5 border-t border-[color:var(--color-rule)] pt-4"
          >
            <input type="hidden" name="needOfferId" value={needOfferId} />
            <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
            <button
              type="submit"
              className="text-(length:--text-small) text-[color:var(--color-muted)] underline underline-offset-2 hover:text-[color:var(--color-ink)]"
            >
              Withdraw this posting
            </button>
          </form>
        ) : null}
      </div>

      {/* Feedback banners */}
      {responded === '1' ? (
        <div className="mb-6 rounded border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] px-4 py-3 text-(length:--text-small) text-[color:var(--color-accent)]">
          Your response was sent. The poster will be in touch.
        </div>
      ) : null}
      {error ? (
        <div className="mb-6 rounded border border-red-200 bg-red-50 px-4 py-3 text-(length:--text-small) text-red-700">
          {error === 'not_yours'
            ? 'You can only manage your own postings.'
            : error === 'rate_limited'
              ? 'You have reached the limit of 20 exchange requests per day. Try again tomorrow.'
              : 'Something went wrong. Please try again.'}
        </div>
      ) : null}

      {/* Respond form — non-owners only, active items only */}
      {!isOwner && isActive ? (
        <section className="mb-8">
          <h2 className="mb-4 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Respond
          </h2>
          <form
            action={respondAction}
            className="flex flex-col gap-4 rounded border border-[color:var(--color-rule)] p-5"
          >
            <input type="hidden" name="needOfferId" value={needOfferId} />
            <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />

            <fieldset>
              <legend className="mb-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                Exchange type
              </legend>
              <div className="flex gap-3">
                {(['gift', 'time_credit'] as const).map((m) => (
                  <label
                    key={m}
                    className="flex cursor-pointer items-center gap-2 rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] has-[:checked]:border-[color:var(--color-accent)] has-[:checked]:bg-[color:var(--color-accent-soft)] has-[:checked]:text-[color:var(--color-accent)]"
                  >
                    <input
                      type="radio"
                      name="mode"
                      value={m}
                      defaultChecked={m === 'gift'}
                      className="sr-only"
                    />
                    {MODE_LABEL[m]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="notes"
                className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]"
              >
                Message{' '}
                <span className="font-normal text-[color:var(--color-muted)]">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={1000}
                placeholder="Introduce yourself, share availability, or ask a question…"
                className="resize-y rounded border border-[color:var(--color-rule)] bg-transparent px-3 py-2 text-(length:--text-small) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] focus:border-[color:var(--color-accent)] focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                className="rounded bg-[color:var(--color-accent)] px-4 py-2 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
              >
                Send response
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {/* Exchange requests — owner view */}
      {isOwner && requests.length > 0 ? (
        <section>
          <h2 className="mb-4 text-(length:--text-small) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Responses ({requests.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {requests.map((req) => (
              <li key={req.id} className="rounded border border-[color:var(--color-rule)] p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 text-[10px] font-[var(--font-mono)] tracking-wider text-[color:var(--color-muted)] uppercase">
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                  <span className="metadata text-[color:var(--color-muted)]">
                    {MODE_LABEL[req.mode] ?? req.mode}
                    {req.creditAmount ? ` · ${req.creditAmount} hrs` : ''}
                  </span>
                </div>

                {req.notes ? (
                  <p className="mb-3 text-(length:--text-small) text-[color:var(--color-ink-soft)]">
                    {req.notes}
                  </p>
                ) : null}

                {req.status === 'pending' ? (
                  <div className="flex gap-2">
                    <form action={acceptExchangeAction}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="needOfferId" value={needOfferId} />
                      <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                      <button
                        type="submit"
                        className="rounded border border-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent-soft)]"
                      >
                        Accept
                      </button>
                    </form>
                    <form action={declineExchangeAction}>
                      <input type="hidden" name="requestId" value={req.id} />
                      <input type="hidden" name="needOfferId" value={needOfferId} />
                      <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                      <button
                        type="submit"
                        className="rounded border border-[color:var(--color-rule)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-paper-deep)]"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                ) : null}

                {req.status === 'accepted' ? (
                  <form action={completeExchangeAction}>
                    <input type="hidden" name="requestId" value={req.id} />
                    <input type="hidden" name="needOfferId" value={needOfferId} />
                    <input type="hidden" name="neighborhoodSlug" value={neighborhoodSlug} />
                    <button
                      type="submit"
                      className="rounded bg-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
                    >
                      Mark complete
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
