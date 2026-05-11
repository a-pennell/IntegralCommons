'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { SynapseSidebar } from './synapse-sidebar';
import { Topbar } from '@/components/shell/topbar';

type Props = {
  children: ReactNode;
  memberHandle: string;
  memberInitials: string;
};

export function SynapseShellRoot({ children, memberHandle, memberInitials }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

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
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-[color:var(--color-paper)] transition-transform duration-200 ease-out lg:relative lg:translate-x-0 lg:transition-none ${
          drawerOpen
            ? 'translate-x-0 shadow-[1px_0_0_0_var(--color-rule-strong)]'
            : '-translate-x-full lg:translate-x-0'
        }`}
        aria-hidden={!drawerOpen ? undefined : false}
      >
        <SynapseSidebar memberHandle={memberHandle} onNavigate={closeDrawer} />
      </div>

      {drawerOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-20 bg-[color:var(--color-ink)]/40 lg:hidden"
        />
      ) : null}

      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <Topbar memberInitials={memberInitials} onMenuClick={() => setDrawerOpen((v) => !v)} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
