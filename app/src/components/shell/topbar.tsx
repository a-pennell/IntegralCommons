import type { ReactNode } from 'react';

/**
 * Shell topbar — minimal architectural strip across the top of the canvas.
 *
 * Slots:
 *   left:    breadcrumb back-link when nested (otherwise empty)
 *   right:   ⌘K command palette indicator · notification dot · member initials
 *
 * Sidebar is authoritative about location, so the topbar stays ascetic.
 */

type Props = {
  back?: { href: string; label: string };
  hasNotifications?: boolean;
  memberInitials: string;
  /** Slot for command-palette trigger; rendered as a stub until wired. */
  paletteTrigger?: ReactNode;
};

export function Topbar({ back, hasNotifications = false, memberInitials, paletteTrigger }: Props) {
  return (
    <header className="flex h-(--container-shell-topbar) items-center justify-between border-b border-[color:var(--color-rule)] px-6">
      <div className="flex items-center">
        {back ? (
          <a
            href={back.href}
            className="text-(length:--text-small) text-[color:var(--color-ink-soft)] italic hover:text-[color:var(--color-accent)]"
          >
            ◂ {back.label}
          </a>
        ) : null}
      </div>

      <div className="flex items-center gap-5">
        {paletteTrigger ?? (
          <span
            aria-hidden
            className="metadata flex items-center gap-1 tabular text-[color:var(--color-muted)]"
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
