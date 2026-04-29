/**
 * EmailAdapter — the outbound email surface.
 *
 * Three concrete implementations (see ./mailhog.ts, ./smtp.ts, ./resend.ts)
 * are selected at boot via EMAIL_ADAPTER. Self-hosters MUST have at least
 * one working path that is not Resend (NFR-008).
 *
 * Adapters are idempotent by design: the pg-boss email-dispatch-job keys
 * its work by a message id so retries do not double-send.
 */

export type SendEmailInput = {
  readonly to: string;
  readonly subject: string;
  readonly bodyHtml: string;
  readonly bodyText: string;
  readonly from?: string;
  /**
   * Opaque correlation id. Included in the adapter's logs. Not a header.
   * Used by the dispatch-job table to dedupe retries.
   */
  readonly messageId: string;
};

export type SendEmailOk = {
  readonly ok: true;
  /** Adapter-specific id (e.g., Resend message id, SMTP envelope id). */
  readonly providerId: string;
};

export type SendEmailErr = {
  readonly ok: false;
  readonly reason: 'invalid_recipient' | 'dispatch_failed' | 'rate_limited' | 'config';
  readonly detail: string;
};

export type SendEmailResult = SendEmailOk | SendEmailErr;

export interface EmailAdapter {
  readonly name: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
