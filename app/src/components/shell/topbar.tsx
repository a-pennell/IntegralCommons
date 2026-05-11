'use client';

import type { ReactNode } from 'react';

/**
 * Shell topbar — minimal architectural strip across the top of the canvas.
 *
 * Slots:
 *   left:    hamburger (narrow only) · breadcrumb back-link when nested
 *   right:   ⌘K command palette indicator (≥sm) · notification dot · member initials
 *
 * Sidebar is authoritative about location, so the topbar stays ascetic.
 */

type Props = {
  back?: { href: string; label: string };
  hasNotifications?: boolean;
  memberInitials: string;
  /** Slot for a custom palette trigger; defaults to the ⌘K button. */
  paletteTrigger?: ReactNode;
  /** Click handler for the hamburger (mobile drawer toggle). When omitted, hamburger is hidden. */
  onMenuClick?: () => void;
  /** Click handler for the ⌘K command palette trigger. */
  onPaletteClick?: () => void;
};

export function Topbar({
  back,
  hasNotifications = false,
  memberInitials,
  paletteTrigger,
  onMenuClick,
  onPaletteClick,
}: Props) {
  return (
    <header className="flex h-(--container-shell-topbar) items-center justify-between border-b border-[color:var(--color-rule)] bg-[color:var(--color-paper)] px-4 sm:px-5">
      <div className="flex items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-7 w-7 items-center justify-center rounded text-[color:var(--color-muted)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)] lg:hidden"
          >
            <HamburgerIcon />
          </button>
        ) : null}
        {back ? (
          <a
            href={back.href}
            className="flex items-center gap-1 text-(length:--text-small) text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]"
          >
            <span aria-hidden>←</span> {back.label}
          </a>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        {paletteTrigger ??
          (onPaletteClick ? (
            <button
              type="button"
              onClick={onPaletteClick}
              aria-label="Open command palette"
              className="metadata tabular hidden items-center gap-1 text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] sm:flex"
            >
              <kbd className="rounded border border-[color:var(--color-rule)] px-[5px] py-[2px] text-[10px] font-[var(--font-mono)]">
                ⌘
              </kbd>
              <kbd className="rounded border border-[color:var(--color-rule)] px-[5px] py-[2px] text-[10px] font-[var(--font-mono)]">
                K
              </kbd>
            </button>
          ) : null)}

        {hasNotifications ? (
          <span
            aria-label="You have unread notifications"
            className="block h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]"
          />
        ) : (
          <span aria-hidden className="block h-1.5 w-1.5" />
        )}

        <a
          href="/account"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[10px] font-[var(--font-display)] font-semibold tracking-wide text-white hover:opacity-80"
          aria-label="Your account"
        >
          {memberInitials}
        </a>
      </div>
    </header>
  );
}

function HamburgerIcon() {
  // Three architectural rules — matches the design language (no rounded icons).
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden fill="none">
      <line x1="0" y1="1" x2="20" y2="1" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.5" />
      <line x1="0" y1="13" x2="20" y2="13" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
