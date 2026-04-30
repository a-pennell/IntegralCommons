'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/**
 * Shell root — the client-side coordinator that owns mobile-drawer state.
 *
 * On desktop (≥lg): sidebar is fixed, drawer state has no effect.
 * On narrow viewports: sidebar slides in from the left as a drawer when
 * the hamburger is tapped. Backdrop scrim closes it. Escape closes it.
 * Body scroll locks while open. Navigation auto-closes.
 */

type Props = {
  children: ReactNode;
  spaceName: string;
  spaceSlug: string;
  memberCount: number;
  convening: 'in_session' | 'in_recess';
  memberHandle: string;
  memberInitials: string;
};

export function ShellRoot({
  children,
  spaceName,
  spaceSlug,
  memberCount,
  convening,
  memberHandle,
  memberInitials,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  // Escape closes the drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <div className="flex h-screen w-full bg-[color:var(--color-paper)]">
      {/* Sidebar — fixed at lg+, drawer below */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-[color:var(--color-paper)] transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:transition-none ${
          drawerOpen ? 'translate-x-0 shadow-[1px_0_0_0_var(--color-rule-strong)]' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-hidden={!drawerOpen ? undefined : false}
      >
        <Sidebar
          spaceName={spaceName}
          spaceSlug={spaceSlug}
          memberCount={memberCount}
          convening={convening}
          memberHandle={memberHandle}
          onNavigate={closeDrawer}
        />
      </div>

      {/* Backdrop scrim — narrow viewports only when drawer open */}
      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-20 bg-[color:var(--color-ink)]/40 lg:hidden"
        />
      ) : null}

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Topbar
          memberInitials={memberInitials}
          onMenuClick={() => setDrawerOpen((v) => !v)}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
