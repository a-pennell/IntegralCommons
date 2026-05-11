/**
 * StatusStamp — compact pill badge for status across CommonGround.
 *
 * Color rule:
 *   - blue:   in-progress, active attention  (EXPLORING, DELIBERATING, VOTING, IN_SESSION)
 *   - navy:   irreversible authority         (DECIDED, CLOSED)
 *   - muted:  quiet, withdrawn              (STALLED, ARCHIVED, REVOKED, DEPARTED)
 *   - ink:    neutral default               (OPEN, GRANTED, INVITED, ACTIVE)
 */

type Status =
  | 'open'
  | 'exploring'
  | 'decided'
  | 'stalled'
  | 'archived'
  | 'reopened'
  | 'initiating'
  | 'deliberating'
  | 'voting'
  | 'closed'
  | 'granted'
  | 'revoked'
  | 'invited'
  | 'active'
  | 'departed'
  | 'in_session'
  | 'in_recess';

const labels: Record<Status, string> = {
  open: 'Open',
  exploring: 'Exploring',
  decided: 'Decided',
  stalled: 'Stalled',
  archived: 'Archived',
  reopened: 'Reopened',
  initiating: 'Initiating',
  deliberating: 'Deliberating',
  voting: 'Voting',
  closed: 'Closed',
  granted: 'Granted',
  revoked: 'Revoked',
  invited: 'Invited',
  active: 'Active',
  departed: 'Departed',
  in_session: 'In session',
  in_recess: 'In recess',
};

type Tone = 'ink' | 'accent' | 'oxblood' | 'muted';

const toneFor: Record<Status, Tone> = {
  exploring: 'accent',
  deliberating: 'accent',
  voting: 'accent',
  initiating: 'accent',
  in_session: 'accent',
  decided: 'oxblood',
  closed: 'oxblood',
  stalled: 'muted',
  archived: 'muted',
  revoked: 'muted',
  departed: 'muted',
  in_recess: 'muted',
  reopened: 'muted',
  open: 'ink',
  granted: 'ink',
  invited: 'ink',
  active: 'ink',
};

const toneClasses: Record<Tone, string> = {
  ink: 'bg-[color:var(--color-paper-deep)] text-[color:var(--color-ink-soft)]',
  accent: 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]',
  oxblood: 'bg-[#e0e7ff] text-[color:var(--color-oxblood)]',
  muted: 'bg-[color:var(--color-paper-deep)] text-[color:var(--color-muted)]',
};

export function StatusStamp({ status }: { status: Status }) {
  const tone = toneFor[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-[3px] font-[var(--font-mono)] text-[10px] leading-none font-medium tracking-[0.12em] uppercase ${toneClasses[tone]}`}
    >
      {labels[status]}
    </span>
  );
}

export type { Status };
