'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

/**
 * Commons shell sidebar — the Local Commons app navigation.
 *
 * Composition:
 *   masthead    ICOS
 *   hoodblock   Neighborhood name · member count
 *   sections    01 Commons · 02 Resources · 03 Needs & Offers · 04 Charter · 05 Stewardship
 *   footer      member identity · all apps
 */

type SectionKey = 'commons' | 'resources' | 'needs-offers' | 'charter' | 'stewardship';

type Section = {
  key: SectionKey;
  number: string;
  label: string;
  match: (path: string, slug: string) => boolean;
  href: (slug: string) => Route;
};

const sections: Section[] = [
  {
    key: 'commons',
    number: '01',
    label: 'Commons',
    match: (p, s) => p === `/neighborhoods/${s}`,
    href: (s) => `/neighborhoods/${s}` as Route,
  },
  {
    key: 'resources',
    number: '02',
    label: 'Resources',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/resources`),
    href: (s) => `/neighborhoods/${s}/resources` as Route,
  },
  {
    key: 'needs-offers',
    number: '03',
    label: 'Needs & Offers',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/needs-offers`),
    href: (s) => `/neighborhoods/${s}/needs-offers` as Route,
  },
  {
    key: 'charter',
    number: '04',
    label: 'Charter',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/charter`),
    href: (s) => `/neighborhoods/${s}/charter` as Route,
  },
  {
    key: 'stewardship',
    number: '05',
    label: 'Stewardship',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/stewardship`),
    href: (s) => `/neighborhoods/${s}/stewardship` as Route,
  },
];

type Props = {
  neighborhoodName: string;
  neighborhoodSlug: string;
  memberCount: number;
  memberHandle: string;
  onNavigate?: () => void;
};

export function CommonsSidebar({
  neighborhoodName,
  neighborhoodSlug,
  memberCount,
  memberHandle,
  onNavigate,
}: Props) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="flex h-full w-(--container-shell-sidebar) flex-col border-r border-[color:var(--color-rule)]">
      <div className="px-6 pt-7 pb-5">
        <div className="eyebrow">Local Commons</div>
      </div>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-6 pt-5 pb-6">
        <h2 className="text-(length:--text-heading) leading-(--text-heading--line-height) tracking-(--text-heading--letter-spacing) font-[var(--font-display)] font-bold text-[color:var(--color-ink)]">
          {neighborhoodName}
        </h2>
        <div className="metadata mt-2 tabular">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </div>
      </div>

      <nav aria-label="Commons sections" className="flex-1 px-3 pb-6">
        <ul className="flex flex-col">
          {sections.map((s) => {
            const isActive = s.match(pathname, neighborhoodSlug);
            return (
              <li key={s.key} className="relative">
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute top-0 bottom-0 left-0 w-[2px] bg-[color:var(--color-accent)]"
                  />
                ) : null}
                <Link
                  href={s.href(neighborhoodSlug)}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
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
                      className={`font-[var(--font-display)] text-(length:--text-body) ${
                        isActive ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      {s.label}
                    </span>
                  </span>
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
          href={'/' as Route}
          {...(onNavigate ? { onClick: onNavigate } : {})}
          className="mt-1 block text-(length:--text-small) text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-accent)]"
        >
          All apps
        </Link>
      </div>
    </aside>
  );
}
