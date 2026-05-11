/**
 * Citation — the fundamental unit of reference in CommonGround.
 *
 * Every entity in the system has a typed citation handle: ISS-007, REF-002, DR-12.
 * Always set in mono, slightly muted, copy-and-deep-link friendly.
 *
 * The eyebrow row above an entity title is its full citation:
 *   ISSUE · ISS-007 · 14 Apr 2026 · by @anna_p
 */

type Type = 'ISS' | 'DR' | 'REF' | 'DEL' | 'MEM' | 'SUM' | 'TXN';

const typeLabels: Record<Type, string> = {
  ISS: 'Issue',
  DR: 'Decision Record',
  REF: 'Referendum',
  DEL: 'Delegation',
  MEM: 'Member',
  SUM: 'Summary',
  TXN: 'Timeline event',
};

type Props = {
  type: Type;
  number: number | string;
  date?: string;
  actor?: string;
  /** Show the kind label as the lead segment. Used in entity headers. */
  withKind?: boolean;
};

export function Citation({ type, number, date, actor, withKind = false }: Props) {
  const num = typeof number === 'number' ? String(number).padStart(3, '0') : number;
  return (
    <span className="metadata tabular">
      {withKind ? <span className="eyebrow mr-2 inline">{typeLabels[type]}</span> : null}
      <span className="text-[color:var(--color-ink)]">
        {type}-{num}
      </span>
      {date ? <span> · {date}</span> : null}
      {actor ? <span> · by @{actor}</span> : null}
    </span>
  );
}

export type { Type as CitationType };
