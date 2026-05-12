import { notFound, redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { listResourcesForNeighborhood } from '@/server/resources';
import { listActiveNeedsOffers } from '@/server/needs-offers';
import { PrintButton } from './print-button';

type RouteParams = { neighborhoodSlug: string };

export default async function PrintPage({ params }: { params: Promise<RouteParams> }) {
  const { neighborhoodSlug } = await params;
  const session = await requireSession();
  if (!session.ok) redirect(`/login?next=/neighborhoods/${neighborhoodSlug}/print`);

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const [allResources, needs] = await Promise.all([
    listResourcesForNeighborhood(result.neighborhood.id),
    listActiveNeedsOffers(result.neighborhood.id, 'need'),
  ]);

  // PRD: top 10 most recently added Registry items.
  const resources = [...allResources]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  // PRD: all urgent needs first, then remaining sorted by deadline (expiresAt).
  const urgentNeeds = needs.filter((n) => n.isUrgent);
  const otherNeeds = needs
    .filter((n) => !n.isUrgent)
    .sort((a, b) => {
      if (!a.expiresAt && !b.expiresAt) return 0;
      if (!a.expiresAt) return 1;
      if (!b.expiresAt) return -1;
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
    });

  const printedAt = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 1.5cm; size: letter; }
          body { font-size: 11pt; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        body { font-family: Georgia, serif; color: #111; }
        h1 { font-size: 1.5rem; font-weight: bold; margin: 0; }
        h2 { font-size: 1rem; font-weight: bold; border-bottom: 1px solid #888; padding-bottom: 4px; margin: 1rem 0 0.5rem; }
        ul { margin: 0; padding: 0; list-style: none; }
        li { padding: 4px 0; border-bottom: 1px dotted #ccc; font-size: 0.9rem; }
        li:last-child { border-bottom: none; }
        .urgent-badge { font-size: 0.7rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #b91c1c; margin-left: 6px; }
        .meta { font-size: 0.78rem; color: #555; margin-top: 1px; }
        .footer { font-size: 0.75rem; color: #888; margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 0.5rem; }
      `}</style>

      <div
        className="no-print"
        style={{ padding: '1rem', background: '#f5f5f5', marginBottom: '1rem' }}
      >
        <PrintButton />
        <a
          href={`/neighborhoods/${neighborhoodSlug}`}
          style={{ fontSize: '0.875rem', color: '#555' }}
        >
          ← Back to {result.neighborhood.name}
        </a>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem' }}>
        <header
          style={{ borderBottom: '2px solid #111', paddingBottom: '0.5rem', marginBottom: '1rem' }}
        >
          <h1>{result.neighborhood.name}</h1>
          <div style={{ fontSize: '0.8rem', color: '#555', marginTop: '4px' }}>
            Weekly summary · {printedAt}
          </div>
          {result.neighborhood.boundaryDescription ? (
            <div
              style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px', fontStyle: 'italic' }}
            >
              {result.neighborhood.boundaryDescription}
            </div>
          ) : null}
        </header>

        {/* Registry */}
        <section>
          <h2>What we have — Registry ({resources.length} recent items)</h2>
          {resources.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
              No resources registered yet. Ask your neighbors what they have to share!
            </p>
          ) : (
            <ul>
              {resources.map((r) => (
                <li key={r.id}>
                  <strong>{r.title}</strong>
                  {r.kind ? (
                    <span style={{ fontSize: '0.78rem', color: '#555', marginLeft: '6px' }}>
                      [{r.kind}]
                    </span>
                  ) : null}
                  {r.description ? <div className="meta">{r.description}</div> : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Urgent needs */}
        {urgentNeeds.length > 0 ? (
          <section>
            <h2>Urgent needs</h2>
            <ul>
              {urgentNeeds.map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>
                  <span className="urgent-badge">urgent</span>
                  {n.body ? <div className="meta">{n.body}</div> : null}
                  {n.expiresAt ? (
                    <div className="meta">
                      Needed by: {new Date(n.expiresAt).toLocaleDateString('en-US')}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Other open needs */}
        {otherNeeds.length > 0 ? (
          <section>
            <h2>Open needs</h2>
            <ul>
              {otherNeeds.map((n) => (
                <li key={n.id}>
                  <strong>{n.title}</strong>
                  {n.body ? <div className="meta">{n.body}</div> : null}
                  {n.expiresAt ? (
                    <div className="meta">
                      Needed by: {new Date(n.expiresAt).toLocaleDateString('en-US')}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {urgentNeeds.length === 0 && otherNeeds.length === 0 ? (
          <section>
            <h2>Open needs</h2>
            <p style={{ fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
              No open needs right now.
            </p>
          </section>
        ) : null}

        <div className="footer">
          Local Commons · {result.neighborhood.name} · Printed {printedAt}
        </div>
      </div>
    </>
  );
}
