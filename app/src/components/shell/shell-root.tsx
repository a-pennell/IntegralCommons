'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CommandPalette } from './command-palette';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

/**
 * Shell root — the client-side coordinator that owns mobile-drawer state
 * and the command palette.
 *
 * On desktop (≥lg): sidebar is fixed in flow.
 * On narrow viewports: sidebar slides in from the left as a drawer.
 * ⌘K (or Ctrl+K) toggles the command palette from anywhere in the shell.
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
  const [paletteOpen, setPaletteOpen] = useState(false);
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

  // Escape closes the drawer (palette has its own Escape handler)
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  // ⌘K (or Ctrl+K) toggles the command palette from anywhere in the shell.
  // Registered once; state updates live in the event handler, not the effect body.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[color:var(--color-paper)]">
      {/* Sidebar — fixed at lg+, drawer below */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-[color:var(--color-paper)] transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:transition-none ${
          drawerOpen
            ? 'translate-x-0 shadow-[1px_0_0_0_var(--color-rule-strong)]'
            : '-translate-x-full lg:translate-x-0'
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
          onPaletteClick={() => setPaletteOpen(true)}
        />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>

      {paletteOpen ? (
        <CommandPalette spaceSlug={spaceSlug} onClose={() => setPaletteOpen(false)} />
      ) : null}
    </div>
  );
}
