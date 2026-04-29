import type { EmailAdapter } from './types.ts';
import { MailhogAdapter } from './mailhog.ts';
import { ResendAdapter } from './resend.ts';
import { SmtpAdapter } from './smtp.ts';

/**
 * Select the EmailAdapter implementation from EMAIL_ADAPTER.
 *
 * MailhogAdapter is blocked in production. Missing required env for SMTP /
 * Resend throws at boot (fail-fast).
 */
export function selectEmailAdapter(env: NodeJS.ProcessEnv = process.env): EmailAdapter {
  const choice = (env.EMAIL_ADAPTER ?? 'mailhog').trim().toLowerCase();

  if (choice === 'mailhog') {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        'EMAIL_ADAPTER=mailhog is not permitted in production. Use "smtp" or "resend".',
      );
    }
    return new MailhogAdapter({
      ...(env.MAILHOG_HOST !== undefined && { host: env.MAILHOG_HOST }),
      ...(env.MAILHOG_PORT !== undefined && { port: Number(env.MAILHOG_PORT) }),
    });
  }

  if (choice === 'smtp') {
    const host = env.SMTP_HOST;
    const port = env.SMTP_PORT ? Number(env.SMTP_PORT) : undefined;
    const from = env.SMTP_FROM;
    if (!host || !port || !from) {
      throw new Error(
        'EMAIL_ADAPTER=smtp requires SMTP_HOST, SMTP_PORT, SMTP_FROM. See app/.env.example.',
      );
    }
    return new SmtpAdapter({
      host,
      port,
      from,
      ...(env.SMTP_USER !== undefined && { user: env.SMTP_USER }),
      ...(env.SMTP_PASSWORD !== undefined && { password: env.SMTP_PASSWORD }),
      ...(env.SMTP_SECURE !== undefined && { secure: env.SMTP_SECURE === 'true' }),
    });
  }

  if (choice === 'resend') {
    const apiKey = env.RESEND_API_KEY;
    const from = env.RESEND_FROM;
    if (!apiKey || !from) {
      throw new Error(
        'EMAIL_ADAPTER=resend requires RESEND_API_KEY and RESEND_FROM. See app/.env.example.',
      );
    }
    return new ResendAdapter(apiKey, from);
  }

  throw new Error(`Unknown EMAIL_ADAPTER="${choice}". Valid values: mailhog, smtp, resend.`);
}

export type { EmailAdapter, SendEmailInput, SendEmailResult } from './types.ts';
