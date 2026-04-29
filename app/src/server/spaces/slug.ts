/**
 * Slug derivation for Space and Issue. Server-side only — member input
 * supplies the title/name, never a raw slug (plan §Error Handling).
 */

const RESERVED = new Set(['new', 'api', 'spaces', 'login', 'verify', 'logout', 'admin']);

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  if (!base) return 'space';
  if (RESERVED.has(base)) return `${base}-group`;
  return base;
}

/**
 * Append a numeric disambiguator when a slug is already taken within a Space.
 * The caller supplies the conflict check; this is just the helper that
 * produces "name-2", "name-3", etc.
 */
export function disambiguate(base: string, attempt: number): string {
  if (attempt <= 1) return base;
  return `${base}-${attempt}`;
}
