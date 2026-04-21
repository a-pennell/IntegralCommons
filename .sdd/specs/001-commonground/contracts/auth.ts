import { z } from 'zod';

/**
 * Auth contracts — magic-link request + verify, session shape.
 * Implements NFR-014.
 *
 * Phase 1: stub. Task phase fills in edge cases (e.g., throttle headers,
 * verify-redirect targets).
 */

// ─── Magic-link request ────────────────────────────────────────────────────

export const RequestMagicLinkInputSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  // Optional redirect path the caller wants the verify flow to land on.
  // Must be a relative path; absolute URLs are rejected at the server.
  redirectTo: z.string().regex(/^\//).optional(),
});

export type RequestMagicLinkInput = z.infer<typeof RequestMagicLinkInputSchema>;

export const RequestMagicLinkOutputSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true) }),
  z.object({
    ok: z.literal(false),
    error: z.enum(['rate_limited', 'invalid_email', 'email_dispatch_failed']),
    retryAfterSeconds: z.number().optional(),
  }),
]);

export type RequestMagicLinkOutput = z.infer<typeof RequestMagicLinkOutputSchema>;

// ─── Magic-link verify ─────────────────────────────────────────────────────

export const VerifyMagicLinkInputSchema = z.object({
  // The plaintext token from the email URL.
  token: z.string().min(16).max(256),
});

export type VerifyMagicLinkInput = z.infer<typeof VerifyMagicLinkInputSchema>;

export const VerifyMagicLinkOutputSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    memberId: z.string().length(26),
    // The caller is expected to set the session cookie from this value.
    sessionId: z.string().length(26),
    redirectTo: z.string().regex(/^\//),
  }),
  z.object({
    ok: z.literal(false),
    error: z.enum(['token_not_found', 'token_expired', 'token_consumed']),
  }),
]);

export type VerifyMagicLinkOutput = z.infer<typeof VerifyMagicLinkOutputSchema>;

// ─── Session ───────────────────────────────────────────────────────────────

export const CurrentSessionSchema = z.object({
  sessionId: z.string().length(26),
  memberId: z.string().length(26),
  expiresAt: z.date(),
  lastUsedAt: z.date(),
});

export type CurrentSession = z.infer<typeof CurrentSessionSchema>;

export const RevokeSessionInputSchema = z.object({
  sessionId: z.string().length(26),
});

export type RevokeSessionInput = z.infer<typeof RevokeSessionInputSchema>;
