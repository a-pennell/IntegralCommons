'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

/**
 * Shell sidebar — the volume's spine and table of contents.
 *
 * Composition:
 *   masthead    COMMONGROUND
 *   spaceblock  Space name · members · convening state
 *   sections    01 Dashboard · 02 Issues · ... (typographic, no icons)
 *   footer      member identity · switch space
 *
 * Visual: same paper as the canvas, hairline right border. The active section
 * gets a 2px terracotta vertical rule on its left edge + label weight 500.
 */

type SectionKey = 'dashboard' | 'issues' | 'referenda' | 'delegations' | 'timeline' | 'settings';

type Section = {
  key: SectionKey;
  label: string;
  match: (path: string, slug: string) => boolean;
  href: (slug: string) => Route;
};

const sections: Section[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    match: (p, s) => p === `/spaces/${s}`,
    href: (s) => `/spaces/${s}` as Route,
  },
  {
    key: 'issues',
    label: 'Issues',
    match: (p, s) => p.startsWith(`/spaces/${s}/issues`),
    href: (s) => `/spaces/${s}/issues` as Route,
  },
  {
    key: 'referenda',
    label: 'Referenda',
    match: (p, s) => p.startsWith(`/spaces/${s}/referenda`),
    href: (s) => `/spaces/${s}/referenda` as Route,
  },
  {
    key: 'delegations',
    label: 'Delegations',
    match: (p, s) => p.startsWith(`/spaces/${s}/delegations`),
    href: (s) => `/spaces/${s}/delegations` as Route,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    // TODO: dedicated /timeline route — currently lives under issues
    match: () => false,
    href: (s) => `/spaces/${s}/issues` as Route,
  },
  {
    key: 'settings',
    label: 'Settings',
    match: (p, s) => p.startsWith(`/spaces/${s}/settings`),
    href: (s) => `/spaces/${s}/settings` as Route,
  },
];

type Props = {
  spaceName: string;
  spaceSlug: string;
  memberCount: number;
  convening: 'in_session' | 'in_recess';
  memberHandle: string;
  counts?: Partial<Record<SectionKey, number>>;
  /** Called when any nav link is clicked. Used by ShellRoot to close mobile drawer. */
  onNavigate?: () => void;
};

export function Sidebar({
  spaceName,
  spaceSlug,
  memberCount,
  convening,
  memberHandle,
  counts = {},
  onNavigate,
}: Props) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="flex h-full w-(--container-shell-sidebar) flex-col border-r border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <div className="px-5 pt-5 pb-4">
        <div className="eyebrow tracking-widest">CommonGround</div>
      </div>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-5 pt-4 pb-5">
        <h2 className="text-(length:--text-small) font-[var(--font-display)] font-semibold leading-snug text-[color:var(--color-ink)]">
          {spaceName}
        </h2>
        <div className="metadata mt-1 tabular">
          {memberCount} {memberCount === 1 ? 'member' : 'members'} ·{' '}
          {convening === 'in_session' ? 'in session' : 'in recess'}
        </div>
      </div>

      <nav aria-label="Space sections" className="flex-1 px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const isActive = s.match(pathname, spaceSlug);
            const count = counts[s.key];
            return (
              <li key={s.key}>
                <Link
                  href={s.href(spaceSlug)}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  className={`flex items-center justify-between rounded px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] transition-colors ${
                    isActive
                      ? 'bg-[color:var(--color-accent-soft)] font-medium text-[color:var(--color-accent)]'
                      : 'font-normal text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]'
                  }`}
                >
                  {s.label}
                  {count ? (
                    <span className="metadata tabular text-[color:var(--color-muted)]">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-5 py-4">
        <div className="metadata tabular text-[color:var(--color-ink-soft)]">@{memberHandle}</div>
        <div className="mt-2 flex gap-3">
          <Link
            href={'/spaces' as Route}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            className="text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
          >
            Switch space
          </Link>
          <span aria-hidden className="text-(length:--text-caption) text-[color:var(--color-rule-strong)]">·</span>
          <Link
            href={'/' as Route}
            {...(onNavigate ? { onClick: onNavigate } : {})}
            className="text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
          >
            All apps
          </Link>
        </div>
      </div>
    </aside>
  );
}

export type { SectionKey };
