'use client';

import { useEffect, useRef } from 'react';
import type { Resource } from '@/db/schema';

const KIND_LABEL: Record<string, string> = {
  tool: 'Tool',
  space: 'Space',
  skill: 'Skill',
  material: 'Material',
  other: 'Other',
};

type Props = {
  resource: Resource;
  neighborhoodSlug: string;
  onClose: () => void;
};

export function ResourceDetailPanel({ resource, neighborhoodSlug, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Small delay so the click that opened the panel doesn't immediately close it
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-0 h-full w-72 overflow-y-auto border-l border-[color:var(--color-rule)] bg-white p-5 shadow-lg"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[color:var(--color-paper-deep)] px-1.5 py-0.5 font-[var(--font-mono)] text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
            {KIND_LABEL[resource.kind] ?? resource.kind}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded p-1 text-[color:var(--color-muted)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <h2 className="text-(length:--text-small) font-[var(--font-display)] font-semibold leading-snug text-[color:var(--color-ink)]">
        {resource.title}
      </h2>

      {resource.description ? (
        <p className="mt-3 text-(length:--text-small) leading-relaxed text-[color:var(--color-ink-soft)]">
          {resource.description}
        </p>
      ) : null}

      {resource.locationHint ? (
        <p className="metadata mt-4 text-[color:var(--color-muted)]">{resource.locationHint}</p>
      ) : null}

      {resource.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[color:var(--color-rule)] px-2.5 py-0.5 text-(length:--text-caption) text-[color:var(--color-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 border-t border-[color:var(--color-rule)] pt-4">
        <a
          href={`/neighborhoods/${neighborhoodSlug}/resources/${resource.id}`}
          className="text-(length:--text-small) font-[var(--font-display)] font-medium text-[color:var(--color-accent)] hover:underline"
        >
          View full detail →
        </a>
      </div>
    </div>
  );
}
