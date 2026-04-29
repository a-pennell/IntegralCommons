import type { PgBoss, Job } from 'pg-boss';
import { and, eq } from 'drizzle-orm';
import { db, getPool } from '@/db';
import { digestDeliveries, members, memberships, spaces } from '@/db/schema';
import { logger } from '@/lib/logger';
import { ulid } from '@/lib/ulid';
import { composeDigest } from '@/server/digest';
import { enqueueEmailDispatch } from './email-dispatch-job.ts';

/**
 * Rhythm-based digest job (US8).
 *
 * Runs once per hour; for each (member, space) pair whose effective cadence
 * is due, compose a digest and dispatch. Idempotency comes from the UNIQUE
 * (member_id, space_id, scheduled_for) constraint on digest_deliveries — a
 * second tick in the same bucket is a no-op.
 *
 * "Nothing to digest" → no row inserted, no email sent (FR-044).
 */

const QUEUE_NAME = 'digest';

export async function registerDigestJob(boss: PgBoss): Promise<void> {
  await boss.createQueue(QUEUE_NAME);

  await boss.work<{ tickAt?: string }>(QUEUE_NAME, async (jobs: Job<{ tickAt?: string }>[]) => {
    for (const _ of jobs) {
      await runOnce(boss);
    }
  });

  // Hourly tick at 5 past the hour. Cadence-due selection happens inside
  // runOnce based on the member's effective cadence.
  await boss.schedule(QUEUE_NAME, '5 * * * *', {} as never);
}

export async function runOnce(boss: PgBoss): Promise<void> {
  const now = new Date();
  const rows = await db
    .select({
      memberId: memberships.memberId,
      spaceId: memberships.spaceId,
      memberEmail: members.email,
      spaceName: spaces.name,
      membershipCadence: memberships.digestCadence,
      spaceCadenceDefault: spaces.digestCadenceDefault,
    })
    .from(memberships)
    .innerJoin(members, eq(members.id, memberships.memberId))
    .innerJoin(spaces, eq(spaces.id, memberships.spaceId))
    .where(eq(memberships.status, 'active'));

  for (const r of rows) {
    try {
      const cadence = (r.membershipCadence ?? r.spaceCadenceDefault) as
        | 'daily'
        | 'weekly'
        | 'monthly'
        | 'off';
      if (cadence === 'off') continue;
      if (!r.memberEmail) continue;

      const scheduledFor = bucketStart(cadence, now);
      if (!scheduledFor) continue;

      // Idempotent claim: try to insert the DigestDelivery row first.
      // If the conflict fires, another worker already handled this bucket.
      const pool = getPool();
      const deliveryId = ulid();
      const claim = await pool.query<{ id: string }>(
        `INSERT INTO digest_deliveries (id, member_id, space_id, scheduled_for, content_hash, dispatched_adapter)
           VALUES ($1, $2, $3, $4, '', 'pending')
           ON CONFLICT (member_id, space_id, scheduled_for) DO NOTHING
           RETURNING id`,
        [deliveryId, r.memberId, r.spaceId, scheduledFor],
      );
      if (claim.rowCount === 0) continue;

      const since = previousBucketStart(cadence, scheduledFor);
      const body = await composeDigest({
        memberId: r.memberId,
        spaceId: r.spaceId,
        spaceName: r.spaceName,
        since,
      });

      if (!body) {
        // Nothing meaningful to digest — remove the claim row so the
        // idempotency key is not wasted on an empty delivery.
        await pool.query(`DELETE FROM digest_deliveries WHERE id = $1 AND delivered_at IS NULL`, [
          deliveryId,
        ]);
        continue;
      }

      await enqueueEmailDispatch(boss, {
        to: r.memberEmail,
        subject: body.subject,
        bodyText: body.bodyText,
        bodyHtml: body.bodyHtml,
        messageId: `digest:${deliveryId}`,
      });

      await pool.query(
        `UPDATE digest_deliveries
            SET content_hash = $1,
                delivered_at = $2,
                dispatched_adapter = 'pg-boss-email'
          WHERE id = $3`,
        [body.contentHash, new Date(), deliveryId],
      );

      logger.info({ memberId: r.memberId, spaceId: r.spaceId, cadence }, 'digest dispatched');
    } catch (e) {
      logger.error({ err: e, memberId: r.memberId, spaceId: r.spaceId }, 'digest job error');
    }
  }

  // keep drizzle happy about unused tables import
  void digestDeliveries;
  void and;
}

/** Lower-bound of the current cadence bucket. Returns null for 'off'. */
function bucketStart(cadence: 'daily' | 'weekly' | 'monthly', now: Date): Date | null {
  const d = new Date(now);
  switch (cadence) {
    case 'daily':
      d.setUTCHours(0, 0, 0, 0);
      return d;
    case 'weekly': {
      // Monday 00:00 UTC.
      const day = d.getUTCDay();
      const diff = (day + 6) % 7; // Mon=0
      d.setUTCDate(d.getUTCDate() - diff);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    }
    case 'monthly':
      d.setUTCDate(1);
      d.setUTCHours(0, 0, 0, 0);
      return d;
    default:
      return null;
  }
}

function previousBucketStart(cadence: 'daily' | 'weekly' | 'monthly', currentBucket: Date): Date {
  const d = new Date(currentBucket);
  switch (cadence) {
    case 'daily':
      d.setUTCDate(d.getUTCDate() - 1);
      return d;
    case 'weekly':
      d.setUTCDate(d.getUTCDate() - 7);
      return d;
    case 'monthly':
      d.setUTCMonth(d.getUTCMonth() - 1);
      return d;
  }
}
