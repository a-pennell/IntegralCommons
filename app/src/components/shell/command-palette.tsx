'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Command palette — ⌘K opens it from anywhere inside the shell.
 *
 * Sections (first pass): "Go" (navigation) and "Create" (actions). Recent
 * entities and members will land later, once we have the queries to back
 * them.
 *
 * Keyboard:
 *   ⌘K   toggle (handled by ShellRoot)
 *   ↑↓   move selection
 *   ↵    navigate to selected
 *   Esc  dismiss
 */

type Command = {
  id: string;
  label: string;
  href: string;
  section: 'go' | 'create';
  keywords?: ReadonlyArray<string>;
};

function buildCommands(spaceSlug: string): Command[] {
  return [
    // Go
    { id: 'go-dashboard', label: 'Dashboard', href: `/spaces/${spaceSlug}`, section: 'go' },
    { id: 'go-issues', label: 'Issues', href: `/spaces/${spaceSlug}/issues`, section: 'go' },
    {
      id: 'go-referenda',
      label: 'Referenda',
      href: `/spaces/${spaceSlug}/referenda`,
      section: 'go',
    },
    {
      id: 'go-delegations',
      label: 'Delegations',
      href: `/spaces/${spaceSlug}/delegations`,
      section: 'go',
      keywords: ['roll', 'capabilities'],
    },
    {
      id: 'go-settings',
      label: 'Governance settings',
      href: `/spaces/${spaceSlug}/settings`,
      section: 'go',
      keywords: ['rules', 'profile'],
    },
    {
      id: 'go-cadence',
      label: 'Digest cadence',
      href: `/spaces/${spaceSlug}/settings/notifications`,
      section: 'go',
      keywords: ['notifications', 'email'],
    },
    {
      id: 'go-export',
      label: 'Export your contributions',
      href: `/spaces/${spaceSlug}/settings/export`,
      section: 'go',
      keywords: ['download'],
    },
    {
      id: 'go-library',
      label: 'Switch space',
      href: '/spaces',
      section: 'go',
      keywords: ['library'],
    },
    {
      id: 'go-framework',
      label: 'Read the Governance Framework',
      href: '/framework',
      section: 'go',
      keywords: ['principles', 'constitution'],
    },

    // Create
    {
      id: 'new-issue',
      label: 'Open an issue',
      href: `/spaces/${spaceSlug}/issues/new`,
      section: 'create',
      keywords: ['create'],
    },
    {
      id: 'new-gov',
      label: 'Open a governance change issue',
      href: `/spaces/${spaceSlug}/issues/new?type=governance`,
      section: 'create',
      keywords: ['profile', 'rules'],
    },
    {
      id: 'new-ref',
      label: 'Initiate a referendum',
      href: `/spaces/${spaceSlug}/referenda/new`,
      section: 'create',
      keywords: ['vote', 'revoke'],
    },
    {
      id: 'new-invite',
      label: 'Invite a member',
      href: `/spaces/${spaceSlug}/invite`,
      section: 'create',
      keywords: ['add member'],
    },
  ];
}

type Props = {
  spaceSlug: string;
  onClose: () => void;
};

export function CommandPalette({ spaceSlug, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => buildCommands(spaceSlug), [spaceSlug]);
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter((c) => {
      const haystack = [c.label, ...(c.keywords ?? [])].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [commands, query]);

  // Clamp selection to current filtered list length (render-time, no effect)
  const safeIdx = filtered.length > 0 ? Math.min(selectedIdx, filtered.length - 1) : 0;

  const goItems = filtered.filter((c) => c.section === 'go');
  const createItems = filtered.filter((c) => c.section === 'create');

  const goToCommand = (cmd: Command) => {
    onClose();
    router.push(cmd.href);
  };

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Keyboard nav — Escape, arrows, Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[safeIdx];
        if (cmd) goToCommand(cmd);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
    // goToCommand is stable for the lifetime of this render's `onClose` and `router`,
    // but we don't include it as a dep to avoid re-binding on every render. The handler
    // closes over `filtered` and `safeIdx`, which are deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, safeIdx, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50"
    >
      <button
        type="button"
        aria-label="Close command palette"
        onClick={onClose}
        className="absolute inset-0 bg-[color:var(--color-ink)]/40"
      />
      <div className="absolute top-[12vh] left-1/2 w-[92vw] max-w-[560px] -translate-x-1/2 border border-[color:var(--color-rule-strong)] bg-[color:var(--color-paper-soft)] shadow-[0_2px_24px_rgba(28,24,21,0.18)]">
        <div className="border-b border-[color:var(--color-rule)] px-5 py-4">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            placeholder="Find or do…"
            className="w-full bg-transparent font-[var(--font-body)] text-(length:--text-lede) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] placeholder:italic focus:outline-none"
            aria-label="Search commands"
          />
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-5 py-6 font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-muted)] italic">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <>
              {goItems.length > 0 ? (
                <CommandSection
                  label="Go"
                  items={goItems}
                  filtered={filtered}
                  safeIdx={safeIdx}
                  onSelect={goToCommand}
                  onHover={setSelectedIdx}
                />
              ) : null}
              {createItems.length > 0 ? (
                <CommandSection
                  label="Create"
                  items={createItems}
                  filtered={filtered}
                  safeIdx={safeIdx}
                  onSelect={goToCommand}
                  onHover={setSelectedIdx}
                />
              ) : null}
            </>
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[color:var(--color-rule)] px-5 py-2">
          <KbdHint label="↑↓" desc="navigate" />
          <KbdHint label="↵" desc="open" />
          <KbdHint label="Esc" desc="close" />
        </div>
      </div>
    </div>
  );
}

function CommandSection({
  label,
  items,
  filtered,
  safeIdx,
  onSelect,
  onHover,
}: {
  label: string;
  items: Command[];
  filtered: Command[];
  safeIdx: number;
  onSelect: (cmd: Command) => void;
  onHover: (idx: number) => void;
}) {
  return (
    <section className="py-1">
      <div className="eyebrow px-5 py-2">{label}</div>
      <ul>
        {items.map((c) => {
          const globalIdx = filtered.indexOf(c);
          const selected = globalIdx === safeIdx;
          return (
            <li key={c.id} className="relative">
              {selected ? (
                <span
                  aria-hidden
                  className="absolute top-0 bottom-0 left-0 w-[2px] bg-[color:var(--color-accent)]"
                />
              ) : null}
              <button
                type="button"
                onClick={() => onSelect(c)}
                onMouseEnter={() => onHover(globalIdx)}
                className={`flex w-full items-baseline justify-between px-5 py-2 text-left transition-colors ${
                  selected
                    ? 'bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink)]'
                    : 'text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)]'
                }`}
              >
                <span className="font-[var(--font-display)] text-(length:--text-body) font-medium">
                  {c.label}
                </span>
                {selected ? (
                  <span aria-hidden className="metadata text-[color:var(--color-muted)]">
                    ↵
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function KbdHint({ label, desc }: { label: string; desc: string }) {
  return (
    <span className="metadata flex items-center gap-1 tabular text-[color:var(--color-muted)]">
      <kbd className="border border-[color:var(--color-rule)] px-[5px] py-[1px] font-[var(--font-mono)] text-[10px]">
        {label}
      </kbd>
      <span>{desc}</span>
    </span>
  );
}
