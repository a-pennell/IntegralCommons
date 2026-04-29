import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary';

type Props = {
  variant?: Variant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const baseClasses =
  'inline-flex items-center justify-center px-6 py-3 font-[var(--font-display)] text-(length:--text-body) leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[color:var(--color-ink)] text-[color:var(--color-paper)] hover:bg-[color:var(--color-accent)]',
  secondary:
    'border border-[color:var(--color-rule-strong)] bg-transparent text-[color:var(--color-ink)] hover:bg-[color:var(--color-paper-deep)]',
};

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  return <button {...props} className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
}
