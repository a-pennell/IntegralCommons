import type { ReactNode } from 'react';

/**
 * Folio — the document layout. Marginalia on the left, body on the right.
 *
 * Marginalia carries citation handles, provenance, status, and cross-references
 * — the kind of metadata that lives in the margin of a printed civic document
 * (court filings, parliamentary papers, academic journals).
 *
 * Body carries the running text — title, sections, perspectives, decisions.
 *
 * On narrow viewports, the marginalia stacks above the body.
 *
 * Used at two scales:
 *   - per-section (one Folio per principle in /framework)
 *   - per-page    (one Folio for the whole issue detail page)
 */
type Props = {
  margin: ReactNode;
  children: ReactNode;
  /** Default 180px — bump to 220-240px when marginalia carries more metadata. */
  marginWidth?: '180px' | '220px' | '240px';
  /** Container className for layout-level overrides (e.g., `mb-0` to suppress bottom spacing on a final folio). */
  className?: string;
};

export function Folio({ margin, children, marginWidth = '180px', className = 'mb-14' }: Props) {
  const gridClass =
    marginWidth === '240px'
      ? 'sm:grid-cols-[240px_1fr]'
      : marginWidth === '220px'
        ? 'sm:grid-cols-[220px_1fr]'
        : 'sm:grid-cols-[180px_1fr]';
  return (
    <div className={`grid gap-y-3 ${gridClass} sm:gap-x-12 ${className}`}>
      <aside className="pt-1 sm:border-r sm:border-[color:var(--color-rule)] sm:pr-8">
        <div className="metadata leading-(--text-caption--line-height)">{margin}</div>
      </aside>
      <div>{children}</div>
    </div>
  );
}
