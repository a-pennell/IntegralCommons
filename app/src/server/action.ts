'use server';

import type { z, ZodTypeAny } from 'zod';
import type { AppError, FieldIssue } from '@/lib/errors';
import { errors } from '@/lib/errors';
import { requestLogger } from '@/lib/logger';
import type { Result } from '@/lib/result';
import { err } from '@/lib/result';
import { newTraceId } from '@/lib/telemetry';

/**
 * Wraps a service-layer function in a server-action boundary.
 *
 * Invariants:
 *   1. Input is Zod-parsed before the handler runs. Parse failures yield
 *      `ValidationError` — the handler is never invoked with untrusted data.
 *   2. The handler returns `Result<Ok, AppError>`; the wrapper returns the
 *      same shape.
 *   3. Thrown errors are caught, logged with a trace ID, and converted to
 *      `InternalError` (no implementation detail leaks to the UI).
 *
 * Usage:
 *   export const createSpace = createAction(CreateSpaceInputSchema, async (input) => {
 *     return spaces.create(input);
 *   });
 */
export function createAction<Schema extends ZodTypeAny, Out>(
  schema: Schema,
  handler: (input: z.infer<Schema>) => Promise<Result<Out, AppError>>,
  options: { readonly name: string },
): (input: unknown) => Promise<Result<Out, AppError>> {
  return async function action(rawInput: unknown): Promise<Result<Out, AppError>> {
    const traceId = newTraceId();
    const log = requestLogger({ traceId, action: options.name });

    const parsed = schema.safeParse(rawInput);
    if (!parsed.success) {
      const issues: FieldIssue[] = parsed.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      log.info({ outcome: 'validation_failed', issueCount: issues.length });
      return err(errors.validation(issues));
    }

    try {
      const result = await handler(parsed.data);
      if (result.ok) {
        log.info({ outcome: 'ok' });
      } else {
        log.info({ outcome: 'err', errorKind: result.error.kind });
      }
      return result;
    } catch (thrown) {
      log.error(
        {
          outcome: 'internal_error',
          err:
            thrown instanceof Error
              ? { message: thrown.message, stack: thrown.stack }
              : { raw: String(thrown) },
        },
        'action threw — returning InternalError',
      );
      return err(errors.internal(traceId));
    }
  };
}

/** Re-export helpers so callers don't need a second import line. */
export { ok, err } from '@/lib/result';
export { errors } from '@/lib/errors';
