import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Route } from 'next';
import { requireSession } from '@/server/auth';
import { listActiveProducers, getProducerByMember } from '@/server/synapse';

export default async function ProducersPage() {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse/producers');

  const [producers, myProducer] = await Promise.all([
    listActiveProducers(),
    getProducerByMember(session.value.memberId),
  ]);

  return (
    <main
      data-density="standard"
      className="mx-auto w-full max-w-(--container-folio) px-6 py-8 sm:px-10 sm:py-10"
    >
      <header className="mb-6 flex items-center justify-between border-b border-[color:var(--color-rule)] pb-5">
        <div>
          <div className="eyebrow mb-1">Synapse</div>
          <h1 className="text-(length:--text-heading) font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
            Producers
          </h1>
        </div>
        {!myProducer ? (
          <Link
            href={'/synapse/producers/new' as Route}
            className="rounded bg-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-white transition-colors hover:bg-[color:var(--color-oxblood)]"
          >
            Register as producer
          </Link>
        ) : (
          <Link
            href={`/synapse/producers/${myProducer.id}` as Route}
            className="rounded border border-[color:var(--color-accent)] px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-accent)] transition-colors hover:bg-[color:var(--color-accent-soft)]"
          >
            Your profile
          </Link>
        )}
      </header>

      {producers.length === 0 ? (
        <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
          No producers registered yet.
        </p>
      ) : (
        <ul className="divide-y divide-[color:var(--color-rule)] rounded border border-[color:var(--color-rule)]">
          {producers.map((p) => (
            <li key={p.id}>
              <Link
                href={`/synapse/producers/${p.id}` as Route}
                className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-[color:var(--color-paper-deep)]"
              >
                <div>
                  <div className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)]">
                    {p.orgName}
                    {p.managedByMemberId === session.value.memberId ? (
                      <span className="ml-2 text-(length:--text-caption) font-normal text-[color:var(--color-muted)]">
                        you
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-(length:--text-caption) text-[color:var(--color-muted)]">
                    {p.locationDescription}
                  </div>
                </div>
                {!p.isPublic ? (
                  <span className="text-(length:--text-caption) text-[color:var(--color-muted)]">
                    Private
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
