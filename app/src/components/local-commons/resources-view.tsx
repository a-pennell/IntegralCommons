'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Resource } from '@/db/schema';
import { ResourceDetailPanel } from './resource-detail-panel';

// Dynamic import keeps the heavy xyflow bundle out of the initial page load.
const ResourceMapCanvas = dynamic(
  () => import('./resource-map-canvas').then((m) => m.ResourceMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[560px] animate-pulse rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)]" />
    ),
  },
);

const KIND_LABEL: Record<string, string> = {
  tool: 'Tool',
  space: 'Space',
  skill: 'Skill',
  material: 'Material',
  other: 'Other',
};

type Props = {
  resources: Resource[];
  neighborhoodSlug: string;
};

export function ResourcesView({ resources, neighborhoodSlug }: Props) {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selected, setSelected] = useState<Resource | null>(null);

  // Restore view from sessionStorage across navigations
  useEffect(() => {
    const stored = sessionStorage.getItem('resources-view');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored === 'map') setView('map');
  }, []);

  const switchView = (next: 'list' | 'map') => {
    setView(next);
    setSelected(null);
    sessionStorage.setItem('resources-view', next);
  };

  const handleSelect = useCallback((resource: Resource) => {
    setSelected(resource);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <div>
      {/* View toggle */}
      <div className="mb-5 flex gap-1">
        <button
          type="button"
          onClick={() => switchView('list')}
          aria-pressed={view === 'list'}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] transition-colors ${
            view === 'list'
              ? 'bg-[color:var(--color-accent-soft)] font-medium text-[color:var(--color-accent)]'
              : 'text-[color:var(--color-muted)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]'
          }`}
        >
          <ListIcon /> List
        </button>
        <button
          type="button"
          onClick={() => switchView('map')}
          aria-pressed={view === 'map'}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] transition-colors ${
            view === 'map'
              ? 'bg-[color:var(--color-accent-soft)] font-medium text-[color:var(--color-accent)]'
              : 'text-[color:var(--color-muted)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]'
          }`}
        >
          <MapIcon /> Map
        </button>
      </div>

      {view === 'list' ? (
        resources.length === 0 ? (
          <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
            No resources listed yet. Be the first to add one.
          </p>
        ) : (
          <ul className="divide-y divide-[color:var(--color-rule)]">
            {resources.map((r) => (
              <li key={r.id} className="py-4">
                <a
                  href={`/neighborhoods/${neighborhoodSlug}/resources/${r.id}`}
                  className="group block"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 text-[10px] font-[var(--font-mono)] tracking-wider text-[color:var(--color-muted)] uppercase">
                      {KIND_LABEL[r.kind] ?? r.kind}
                    </span>
                    <span className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-ink)] group-hover:text-[color:var(--color-accent)]">
                      {r.title}
                    </span>
                  </div>
                  {r.description ? (
                    <p className="mt-1 line-clamp-2 text-(length:--text-small) text-[color:var(--color-muted)]">
                      {r.description}
                    </p>
                  ) : null}
                  {r.locationHint ? (
                    <p className="metadata mt-1 text-[color:var(--color-muted)]">
                      {r.locationHint}
                    </p>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div className="relative">
          {resources.length === 0 ? (
            <div className="flex h-[560px] items-center justify-center rounded border border-[color:var(--color-rule)] bg-[color:var(--color-paper-soft)]">
              <p className="text-(length:--text-small) text-[color:var(--color-muted)]">
                No resources to display on the map.
              </p>
            </div>
          ) : (
            <ResourceMapCanvas resources={resources} onSelect={handleSelect} />
          )}
          {selected ? (
            <ResourceDetailPanel
              resource={selected}
              neighborhoodSlug={neighborhoodSlug}
              onClose={handleClose}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function ListIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <rect x="4" y="1" width="9" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="4" y="5.75" width="9" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="4" y="10.5" width="9" height="1.5" rx="0.75" fill="currentColor" />
      <circle cx="1.5" cy="1.75" r="1.25" fill="currentColor" />
      <circle cx="1.5" cy="6.5" r="1.25" fill="currentColor" />
      <circle cx="1.5" cy="11.25" r="1.25" fill="currentColor" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <rect x="2.5" y="2.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="7" y="2.5" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity="0.6" />
      <rect x="2.5" y="7" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity="0.4" />
      <rect x="7" y="7" width="3.5" height="3.5" rx="0.5" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
