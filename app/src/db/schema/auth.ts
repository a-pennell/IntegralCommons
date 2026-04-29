import { sql } from 'drizzle-orm';
import { check, index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { members } from './members.ts';

/**
 * MagicLinkToken — single-use email login tokens. 15-minute TTL.
 *
 * token_hash stores SHA-256(token_plaintext). The plaintext lives ONLY in
 * the email body — never at rest in the database or logs. See
 * `app/src/server/auth/request-magic-link.ts` for the hashing step.
 *
 * NFR-014.
 */
export const magicLinkTokens = pgTable(
  'magic_link_tokens',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    requestedFromIp: text('requested_from_ip'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    idUlidCheck: check('magic_link_tokens_id_ulid_length', sql`char_length(${table.id}) = 26`),
    tokenHashIdx: index('magic_link_tokens_hash_idx').on(table.tokenHash),
    emailRecencyIdx: index('magic_link_tokens_email_recency_idx').on(table.email, table.createdAt),
  }),
);

/**
 * Session — authenticated session state.
 *
 * id doubles as the cookie value (256 bits of entropy generated server-side).
 * Sliding 30-day expiry: each request bumps `last_used_at` (rate-limited to
 * 1/min at the service layer to reduce write contention).
 *
 * NFR-014.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    memberId: text('member_id')
      .notNull()
      .references(() => members.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow(),
    userAgent: text('user_agent'),
    ipAtLastUse: text('ip_at_last_use'),
  },
  (table) => ({
    idUlidCheck: check('sessions_id_ulid_length', sql`char_length(${table.id}) = 26`),
    memberExpiresIdx: index('sessions_member_expires_idx').on(table.memberId, table.expiresAt),
  }),
);

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type NewMagicLinkToken = typeof magicLinkTokens.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
