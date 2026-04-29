import type { ReactNode } from 'react';

type Tone = 'info' | 'error';

type Props = {
  tone?: Tone;
  children: ReactNode;
};

const toneClasses: Record<Tone, string> = {
  info: 'border-[color:var(--color-accent-soft)]',
  error: 'border-[color:var(--color-accent)]',
};

export function Note({ tone = 'info', children }: Props) {
  return (
    <aside
      className={`border-l-2 ${toneClasses[tone]} bg-[color:var(--color-paper-soft)] px-5 py-4`}
    >
      <div className="text-(length:--text-small) leading-(--text-small--line-height) text-[color:var(--color-ink-soft)]">
        {children}
      </div>
    </aside>
  );
}
