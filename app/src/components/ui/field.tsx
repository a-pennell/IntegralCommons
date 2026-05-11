import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = {
  id: string;
  label: string;
  hint?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({ id, label, hint, className = '', ...inputProps }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={`border-0 border-b border-[color:var(--color-rule-strong)] bg-transparent px-0 py-3 text-(length:--text-lede) leading-(--text-lede--line-height) font-[var(--font-body)] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] placeholder:italic focus:border-[color:var(--color-accent)] focus:outline-none ${className}`}
      />
      {hint ? (
        <p className="text-(length:--text-caption) leading-(--text-caption--line-height) font-[var(--font-body)] text-[color:var(--color-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
