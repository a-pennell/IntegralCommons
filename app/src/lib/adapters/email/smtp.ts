import nodemailer, { type Transporter } from 'nodemailer';
import type { EmailAdapter, SendEmailInput, SendEmailResult } from './types.ts';

/**
 * SmtpAdapter — production SMTP for self-hosters with their own mail
 * provider (Fastmail, Postmark via SMTP, etc.).
 *
 * Required env vars when EMAIL_ADAPTER=smtp: SMTP_HOST, SMTP_PORT, SMTP_FROM.
 * Optional: SMTP_USER, SMTP_PASSWORD, SMTP_SECURE.
 */
export class SmtpAdapter implements EmailAdapter {
  readonly name = 'smtp';
  private transport: Transporter;
  private from: string;

  constructor(config: {
    host: string;
    port: number;
    from: string;
    user?: string;
    password?: string;
    secure?: boolean;
  }) {
    this.from = config.from;
    this.transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      ...(config.user && config.password
        ? { auth: { user: config.user, pass: config.password } }
        : {}),
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
