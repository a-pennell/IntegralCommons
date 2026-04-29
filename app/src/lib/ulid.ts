import { ulid as ulidFactory } from 'ulid';

/**
 * ULID generator.
 *
 * 26-char Crockford-base32, monotonic-friendly. Sorts chronologically
 * (lexicographic sort = time sort), which keeps TimelineEvent queries cheap.
 * See data-model.md §Conventions.
 */
export function ulid(): string {
  return ulidFactory();
}

/** True iff the string is a syntactically valid ULID. Does NOT verify existence. */
export function isUlid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9A-HJKMNP-TV-Z]{26}$/.test(value);
}
