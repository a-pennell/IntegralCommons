import type { PoolClient } from 'pg';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { cr009RateLimitExceeded } from '@/server/constitution';

/**
 * Per-Member, per-action rate-limit enforcement (CR-009).
 *
 * Phase 1 defaults (spec §CR-009):
 *   - create_issue: 3 per calendar day (UTC window).
 *   - initiate_referendum: 1 per rolling 7-day window.
 *
 * Spaces MAY tighten; looser limits are refused by
 * `governance-config.applyChange` at T178.
 *
 * Two windowing strategies:
 *   - `create_issue` uses a FIXED UTC-day bucket — cheap and intuitive.
 *   - `initiate_referendum` uses a ROLLING 7-day window counted directly off
 *     the `referenda` table (no bucket row needed because the source-of-truth
 *     is already there). The bucket table is only used for fixed windows.
 */

type Action = 'create_issue' | 'initiate_referendum';

const LIMITS: Record<Action, { limit: number; windowMs: number; windowDescription: string }> = {
  create_issue: {
    limit: 3,
    windowMs: 24 * 60 * 60 * 1000,
    windowDescription: 'per calendar day (UTC)',
  },
  initiate_referendum: {
    limit: 1,
    windowMs: 7 * 24 * 60 * 60 * 1000,
    windowDescription: 'per rolling 7-day window',
  },
};

function fixedWindowStart(action: Action, now: Date): Date {
  if (action === 'create_issue') {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  // Rolling-window actions don't use fixed buckets; callers route through
  // the rolling counter below.
  return new Date(now.getTime() - LIMITS[action].windowMs);
}

export async function checkAndBump(
  client: PoolClient,
  args: {
    readonly memberId: string;
    readonly action: Action;
    readonly effectiveLimit?: number; // Space may tighten
    readonly now?: Date;
  },
): Promise<Result<{ readonly newCount: number }, AppError>> {
  const now = args.now ?? new Date();
  const base = LIMITS[args.action];
  const limit = Math.min(args.effectiveLimit ?? base.limit, base.limit);

  if (args.action === 'initiate_referendum') {
    const rollingStart = new Date(now.getTime() - base.windowMs);
    const counted = await client.query<{ n: string }>(
      `SELECT COUNT(*)::text AS n
         FROM referenda
        WHERE initiated_by_member_id = $1
          AND created_at >= $2`,
      [args.memberId, rollingStart],
    );
    const current = Number(counted.rows[0]?.n ?? 0);

    const violation = cr009RateLimitExceeded({
      currentCount: current,
      limit,
      windowDescription: base.windowDescription,
    });
    if (violation) {
      return err(
        errors.rateLimited(
          args.action,
          `${limit} ${base.windowDescription}`,
          new Date(rollingStart.getTime() + base.windowMs * 2),
        ),
      );
    }

    // No bucket bump — the next insert on `referenda` itself moves the counter.
    return ok({ newCount: current + 1 });
  }

  // Fixed-window (create_issue).
  const windowStart = fixedWindowStart(args.action, now);
  const existing = await client.query<{ count: string }>(
    `SELECT count::text
       FROM rate_limit_buckets
      WHERE member_id = $1
        AND action_type = $2
        AND window_start = $3
       LIMIT 1`,
    [args.memberId, args.action, windowStart],
  );
  const current = Number(existing.rows[0]?.count ?? 0);

  const violation = cr009RateLimitExceeded({
    currentCount: current,
    limit,
    windowDescription: base.windowDescription,
  });
  if (violation) {
    return err(
      errors.rateLimited(
        args.action,
        `${limit} ${base.windowDescription}`,
        new Date(windowStart.getTime() + base.windowMs),
      ),
    );
  }

  await client.query(
    `INSERT INTO rate_limit_buckets (member_id, action_type, window_start, count)
       VALUES ($1, $2, $3, 1)
       ON CONFLICT (member_id, action_type, window_start)
       DO UPDATE SET count = rate_limit_buckets.count + 1,
                     updated_at = now()`,
    [args.memberId, args.action, windowStart],
  );

  return ok({ newCount: current + 1 });
}
