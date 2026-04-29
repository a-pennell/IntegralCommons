import type { PgBoss, Job } from 'pg-boss';
import { selectEmailAdapter, type SendEmailInput } from '@/lib/adapters/email';
import { logger } from '@/lib/logger';

/**
 * email-dispatch-job — outbound email pipeline.
 *
 * All outbound email (magic links, invitations, digests) flows through
 * pg-boss rather than being sent inline. Benefits:
 *   1. Retries on transient dispatch failure (pg-boss handles backoff).
 *   2. The service layer never blocks on SMTP/HTTP to send.
 *   3. Tests can assert "a job was enqueued" without asserting on SMTP.
 *
 * The job payload is the full `SendEmailInput` shape. pg-boss serializes it
 * as JSON; recipients re-parse. Idempotency is provided by `messageId`.
 */

const QUEUE_NAME = 'email_dispatch';

export type EmailDispatchJobPayload = SendEmailInput;

export async function enqueueEmailDispatch(
  boss: PgBoss,
  payload: EmailDispatchJobPayload,
): Promise<void> {
  await boss.send(QUEUE_NAME, payload, {
    singletonKey: payload.messageId,
    retryLimit: 5,
    retryBackoff: true,
    retryDelay: 30,
  });
}

export async function registerEmailDispatchJob(boss: PgBoss): Promise<void> {
  const adapter = selectEmailAdapter();

  await boss.createQueue(QUEUE_NAME);

  await boss.work<EmailDispatchJobPayload>(
    QUEUE_NAME,
    async (jobs: Job<EmailDispatchJobPayload>[]) => {
      for (const job of jobs) {
        const payload = job.data;
        const result = await adapter.send(payload);

        if (!result.ok) {
          logger.warn(
            {
              adapter: adapter.name,
              messageId: payload.messageId,
              reason: result.reason,
              detail: result.detail,
            },
            'email dispatch failed — pg-boss will retry',
          );
          throw new Error(`email dispatch failed (${result.reason}): ${result.detail}`);
        }

        logger.info(
          {
            adapter: adapter.name,
            messageId: payload.messageId,
            providerId: result.providerId,
          },
          'email dispatched',
        );
      }
    },
  );
}
