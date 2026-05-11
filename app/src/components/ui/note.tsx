import type { ReactNode } from 'react';

type Tone = 'info' | 'error' | 'warning';

type Props = {
  tone?: Tone;
  children: ReactNode;
};

const toneClasses: Record<Tone, string> = {
  info: 'border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]',
  error: 'border-red-400 bg-red-50',
  warning: 'border-amber-400 bg-amber-50',
};

export function Note({ tone = 'info', children }: Props) {
  return (
    <aside
      className={`rounded border-l-2 ${toneClasses[tone]} px-4 py-3`}
    >
      <div className="text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-ink-soft)]">
        {children}
      </div>
    </aside>
  );
}
