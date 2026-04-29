import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailAdapter, SendEmailInput, SendEmailResult } from './types.ts';

/**
 * MailhogAdapter — dev SMTP capture. Connects to a local Mailhog instance
 * (see docker-compose.yml), which accepts any envelope and exposes the
 * message at http://localhost:8025 for inspection.
 *
 * NOT for production use; `selectAdapter()` blocks this in production.
 */
export class MailhogAdapter implements EmailAdapter {
  readonly name = 'mailhog';
  private transport: Transporter;
  private from: string;

  constructor(config: { host?: string; port?: number; from?: string } = {}) {
    this.from = config.from ?? 'CommonGround (dev) <noreply@commonground.local>';
    this.transport = nodemailer.createTransport({
      host: config.host ?? 'localhost',
      port: config.port ?? 1025,
      secure: false,
      ignoreTLS: true,
    });
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const info = await this.transport.sendMail({
        from: input.from ?? this.from,
        to: input.to,
        subject: input.subject,
        text: input.bodyText,
        html: input.bodyHtml,
        headers: { 'X-CG-Message-Id': input.messageId },
      });
      return { ok: true, providerId: info.messageId };
    } catch (err) {
      return {
        ok: false,
        reason: 'dispatch_failed',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
