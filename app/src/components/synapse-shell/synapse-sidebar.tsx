'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

type SectionKey = 'overview' | 'producers' | 'declarations' | 'allocations';

type Section = {
  key: SectionKey;
  label: string;
  match: (path: string) => boolean;
  href: Route;
};

const sections: Section[] = [
  {
    key: 'overview',
    label: 'Overview',
    match: (p) => p === '/synapse',
    href: '/synapse' as Route,
  },
  {
    key: 'producers',
    label: 'Producers',
    match: (p) => p.startsWith('/synapse/producers'),
    href: '/synapse/producers' as Route,
  },
  {
    key: 'declarations',
    label: 'Declarations',
    match: (p) => p.startsWith('/synapse/declarations'),
    href: '/synapse/declarations' as Route,
  },
  {
    key: 'allocations',
    label: 'Allocations',
    match: (p) => p.startsWith('/synapse/allocations'),
    href: '/synapse/allocations' as Route,
  },
];

type Props = {
  memberHandle: string;
  onNavigate?: () => void;
};

export function SynapseSidebar({ memberHandle, onNavigate }: Props) {
  const pathname = usePathname() ?? '';

  return (
    <aside className="flex h-full w-(--container-shell-sidebar) flex-col border-r border-[color:var(--color-rule)] bg-[color:var(--color-paper)]">
      <div className="px-5 pt-5 pb-4">
        <div className="eyebrow tracking-widest">Flow Engine</div>
      </div>

      <div className="border-t border-[color:var(--color-rule)]" />

      <div className="px-5 pt-4 pb-5">
        <h2 className="text-(length:--text-small) leading-snug font-[var(--font-display)] font-semibold text-[color:var(--color-ink)]">
          Synapse
        </h2>
        <p className="metadata mt-1 text-[color:var(--color-muted)]">Regional surplus visibility</p>
      </div>

      <nav aria-label="Synapse sections" className="flex-1 px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const isActive = s.match(pathname);
            return (
              <li key={s.key}>
                <Link
                  href={s.href}
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
