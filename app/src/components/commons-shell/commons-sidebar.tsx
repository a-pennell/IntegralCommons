'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

type SectionKey = 'commons' | 'resources' | 'needs-offers' | 'charter' | 'stewardship' | 'credits';

type Section = {
  key: SectionKey;
  label: string;
  match: (path: string, slug: string) => boolean;
  href: (slug: string) => Route;
};

const sections: Section[] = [
  {
    key: 'commons',
    label: 'Commons',
    match: (p, s) => p === `/neighborhoods/${s}`,
    href: (s) => `/neighborhoods/${s}` as Route,
  },
  {
    key: 'resources',
    label: 'Resources',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/resources`),
    href: (s) => `/neighborhoods/${s}/resources` as Route,
  },
  {
    key: 'needs-offers',
    label: 'Needs & Offers',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/needs-offers`),
    href: (s) => `/neighborhoods/${s}/needs-offers` as Route,
  },
  {
    key: 'charter',
    label: 'Charter',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/charter`),
    href: (s) => `/neighborhoods/${s}/charter` as Route,
  },
  {
    key: 'stewardship',
    label: 'Stewardship',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/stewardship`),
    href: (s) => `/neighborhoods/${s}/stewardship` as Route,
  },
  {
    key: 'credits',
    label: 'Credits',
    match: (p, s) => p.startsWith(`/neighborhoods/${s}/credits`),
    href: (s) => `/neighborhoods/${s}/credits` as Route,
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
    <aside className="flex h-full w-(--container-shell-sidebar) flex-col border-r border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <div className="px-5 pt-5 pb-4">
        <div className="eyebrow tracking-widest">Local Commons</div>
      </div>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-5 pt-4 pb-5">
        <h2 className="text-(length:--text-small) leading-snug font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          {neighborhoodName}
        </h2>
        <div className="metadata tabular mt-1">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </div>
      </div>

      <nav aria-label="Commons sections" className="flex-1 px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const isActive = s.match(pathname, neighborhoodSlug);
            return (
              <li key={s.key}>
                <Link
                  href={s.href(neighborhoodSlug)}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  className={`flex items-center rounded px-3 py-1.5 text-(length:--text-small) font-[var(--font-display)] transition-colors ${
                    isActive
                      ? 'bg-[color:var(--color-accent-soft)] font-medium text-[color:var(--color-accent)]'
                      : 'font-normal text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]'
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-5 py-4">
        <div className="metadata tabular text-[color:var(--color-ink-soft)]">@{memberHandle}</div>
        <Link
          href={'/' as Route}
          {...(onNavigate ? { onClick: onNavigate } : {})}
          className="mt-2 block text-(length:--text-caption) text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)]"
        >
          All apps
        </Link>
      </div>
    </aside>
  );
}
