import type { ReactNode } from 'react';

/**
 * SectionHeader — used to introduce a section within a broadsheet page.
 * Eyebrow-style label on the left, optional count, optional right slot.
 * Hairline rule below.
 */

type Props = {
  label: string;
  count?: number | string;
  right?: ReactNode;
};

export function SectionHeader({ label, count, right }: Props) {
  return (
    <div className="mb-6 flex items-baseline justify-between border-b border-[color:var(--color-rule)] pb-3">
      <div className="flex items-baseline gap-3">
        <span className="eyebrow">{label}</span>
        {count !== undefined ? (
          <span className="metadata tabular text-[color:var(--color-muted)]">· {count}</span>
        ) : null}
      </div>
      {right ? <div className="metadata">{right}</div> : null}
    </div>
  );
}
