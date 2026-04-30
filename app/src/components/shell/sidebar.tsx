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
  number: string;
  label: string;
  match: (path: string, slug: string) => boolean;
  href: (slug: string) => Route;
};

const sections: Section[] = [
  {
    key: 'dashboard',
    number: '01',
    label: 'Dashboard',
    match: (p, s) => p === `/spaces/${s}`,
    href: (s) => `/spaces/${s}` as Route,
  },
  {
    key: 'issues',
    number: '02',
    label: 'Issues',
    match: (p, s) => p.startsWith(`/spaces/${s}/issues`),
    href: (s) => `/spaces/${s}/issues` as Route,
  },
  {
    key: 'referenda',
    number: '03',
    label: 'Referenda',
    match: (p, s) => p.startsWith(`/spaces/${s}/referenda`),
    href: (s) => `/spaces/${s}/referenda` as Route,
  },
  {
    key: 'delegations',
    number: '04',
    label: 'Delegations',
    match: (p, s) => p.startsWith(`/spaces/${s}/delegations`),
    href: (s) => `/spaces/${s}/delegations` as Route,
  },
  {
    key: 'timeline',
    number: '05',
    label: 'Timeline',
    // TODO: dedicated /timeline route — currently lives under issues
    match: () => false,
    href: (s) => `/spaces/${s}/issues` as Route,
  },
  {
    key: 'settings',
    number: '06',
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
};

export function Sidebar({
  spaceName,
  spaceSlug,
  memberCount,
  convening,
  memberHandle,
  counts = {},
}: Props) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="flex h-full w-(--container-shell-sidebar) flex-col border-r border-[color:var(--color-rule)]">
      <div className="px-6 pt-7 pb-5">
        <div className="eyebrow">CommonGround</div>
      </div>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-6 pt-5 pb-6">
        <h2 className="text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)]">
          {spaceName}
        </h2>
        <div className="metadata mt-2 tabular">
          {memberCount} {memberCount === 1 ? 'member' : 'members'} ·{' '}
          {convening === 'in_session' ? 'in session' : 'in recess'}
        </div>
      </div>

      <nav aria-label="Space sections" className="flex-1 px-3 pb-6">
        <ul className="flex flex-col">
          {sections.map((s) => {
            const isActive = s.match(pathname, spaceSlug);
            const count = counts[s.key];
            return (
              <li key={s.key} className="relative">
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute top-0 bottom-0 left-0 w-[2px] bg-[color:var(--color-accent)]"
                  />
                ) : null}
                <Link
                  href={s.href(spaceSlug)}
                  className={`flex items-baseline justify-between px-3 py-2 transition-colors hover:bg-[color:var(--color-paper-deep)] ${
                    isActive
                      ? 'text-[color:var(--color-ink)]'
                      : 'text-[color:var(--color-ink-soft)]'
                  }`}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="metadata w-7 tabular text-[color:var(--color-muted)]">
                      {s.number}
                    </span>
                    <span
                      className={`text-(length:--text-body) ${
                        isActive ? 'font-medium' : 'font-normal'
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
                  {count ? <span className="metadata tabular">{count}</span> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-6 py-5">
        <div className="metadata tabular">@{memberHandle}</div>
        <Link
          href={'/spaces' as Route}
          className="mt-1 block text-(length:--text-small) text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-accent)]"
        >
          Switch space
        </Link>
      </div>
    </aside>
  );
}

export type { SectionKey };
