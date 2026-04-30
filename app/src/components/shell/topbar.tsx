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
  /** Slot for command-palette trigger; rendered as a stub until wired. */
  paletteTrigger?: ReactNode;
  /** Click handler for the hamburger (mobile drawer toggle). When omitted, hamburger is hidden. */
  onMenuClick?: () => void;
};

export function Topbar({
  back,
  hasNotifications = false,
  memberInitials,
  paletteTrigger,
  onMenuClick,
}: Props) {
  return (
    <header className="flex h-(--container-shell-topbar) items-center justify-between border-b border-[color:var(--color-rule)] px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="flex h-8 w-8 items-center justify-center text-[color:var(--color-ink)] hover:text-[color:var(--color-accent)] lg:hidden"
          >
            <HamburgerIcon />
          </button>
        ) : null}
        {back ? (
          <a
            href={back.href}
            className="font-[var(--font-body)] text-(length:--text-small) text-[color:var(--color-ink-soft)] italic hover:text-[color:var(--color-accent)]"
          >
            ◂ {back.label}
          </a>
        ) : null}
      </div>

      <div className="flex items-center gap-5">
        {paletteTrigger ?? (
          <span
            aria-hidden
            className="metadata hidden items-center gap-1 tabular text-[color:var(--color-muted)] sm:flex"
          >
            <kbd className="border border-[color:var(--color-rule)] px-[5px] py-[1px] font-[var(--font-mono)] text-[10px]">
              ⌘
            </kbd>
            <kbd className="border border-[color:var(--color-rule)] px-[5px] py-[1px] font-[var(--font-mono)] text-[10px]">
              K
            </kbd>
          </span>
        )}

        {hasNotifications ? (
          <span
            aria-label="You have unread notifications"
            className="block h-[6px] w-[6px] rounded-full bg-[color:var(--color-accent)]"
          />
        ) : (
          <span aria-hidden className="block h-[6px] w-[6px]" />
        )}

        <span
          className="metadata tabular text-[color:var(--color-ink)]"
          aria-label="Your account"
        >
          {memberInitials}
        </span>
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
