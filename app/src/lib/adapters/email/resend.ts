import type { EmailAdapter, SendEmailInput, SendEmailResult } from './types.ts';

/**
 * ResendAdapter — the hosted reference adapter. Uses Resend's HTTP API
 * directly; no SDK dep (keeps self-hosters' dependency footprint smaller
 * since they use SmtpAdapter and will never instantiate ResendAdapter).
 *
 * Required env: RESEND_API_KEY, RESEND_FROM.
 */
export class ResendAdapter implements EmailAdapter {
  readonly name = 'resend';
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-CG-Message-Id': input.messageId,
        },
        body: JSON.stringify({
          from: input.from ?? this.from,
          to: input.to,
          subject: input.subject,
          html: input.bodyHtml,
          text: input.bodyText,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        if (response.status === 429) {
          return { ok: false, reason: 'rate_limited', detail: text };
        }
        if (response.status === 422) {
          return { ok: false, reason: 'invalid_recipient', detail: text };
        }
        return {
          ok: false,
          reason: 'dispatch_failed',
          detail: `status=${response.status} ${text}`,
        };
      }

      const data = (await response.json()) as { id?: string };
      return { ok: true, providerId: data.id ?? input.messageId };
    } catch (err) {
      return {
        ok: false,
        reason: 'dispatch_failed',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
