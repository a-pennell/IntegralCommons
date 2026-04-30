/**
 * StatusStamp — uppercase mono label that reads as a pre-printed stamp on a
 * filed paper. The single voice for status across CommonGround.
 *
 * Color rule:
 *   - terracotta:  in-progress, attention   (EXPLORING, DELIBERATING, VOTING)
 *   - oxblood:     irreversible authority   (DECIDED, CLOSED)
 *   - muted:       quiet, withdrawn         (STALLED, ARCHIVED, REVOKED, DEPARTED)
 *   - ink:         neutral default          (OPEN, GRANTED, INVITED, ACTIVE)
 *
 * Visual: hairline outline, no fill. Never colorful pill, never with an emoji.
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
  ink: 'border-[color:var(--color-ink-soft)] text-[color:var(--color-ink-soft)]',
  accent: 'border-[color:var(--color-accent)] text-[color:var(--color-accent)]',
  oxblood: 'border-[color:var(--color-oxblood)] text-[color:var(--color-oxblood)]',
  muted: 'border-[color:var(--color-muted)] text-[color:var(--color-muted)]',
};

export function StatusStamp({ status }: { status: Status }) {
  const tone = toneFor[status];
  return (
    <span
      className={`inline-flex items-center border px-2 py-[3px] font-[var(--font-mono)] text-[10px] leading-none font-medium tracking-[0.18em] uppercase ${toneClasses[tone]}`}
    >
      {labels[status]}
    </span>
  );
}

export type { Status };
