import type { TextareaHTMLAttributes, ReactNode } from 'react';

type Props = {
  id: string;
  label: string;
  hint?: ReactNode;
  /** Render the textarea in mono — for JSON, code, or fixed-width input. */
  mono?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Textarea — a writing surface that reads as paper.
 *
 * Hairline bottom border, transparent background, body type. The eyebrow
 * label sits above; an optional italic hint sits below. For multi-line code
 * (governance JSON, etc.), pass `mono` to render in IBM Plex Mono.
 */
export function Textarea({ id, label, hint, mono = false, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow">
        {label}
      </label>
      <textarea
        id={id}
        {...props}
        className={`min-h-[6em] resize-y border-0 border-b border-[color:var(--color-rule-strong)] bg-transparent px-0 py-3 leading-(--text-body--line-height) text-[color:var(--color-ink)] placeholder:text-[color:var(--color-muted)] placeholder:italic focus:border-[color:var(--color-accent)] focus:outline-none ${
          mono
            ? 'font-[var(--font-mono)] text-(length:--text-small)'
            : 'font-[var(--font-body)] text-(length:--text-body)'
        } ${className}`}
      />
      {hint ? (
        <p className="font-[var(--font-body)] text-(length:--text-caption) leading-(--text-caption--line-height) text-[color:var(--color-muted)] italic">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
