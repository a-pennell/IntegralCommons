import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  'inline-flex items-center justify-center rounded px-4 py-2 font-[var(--font-display)] text-(length:--text-small) font-medium leading-none tracking-[0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-40';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-oxblood)]',
  secondary:
    'border border-[color:var(--color-rule)] bg-transparent text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-deep)]',
  ghost:
    'bg-transparent text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-paper-deep)] hover:text-[color:var(--color-ink)]',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return <button {...props} className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}
