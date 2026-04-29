import type { PoolClient } from 'pg';
import { ulid } from '@/lib/ulid';
import type { TimelineEvent } from '@/db/schema';

/**
 * Write a Civic Memory event.
 *
 * Must be called from inside a transaction that has already acquired a
 * {@link PoolClient}. The helper flips the session role to `civic_memory_role`
 * for the duration of the INSERT so that the database-enforced append-only
 * invariant (FR-025, FR-026) applies: the writer role has INSERT+SELECT but
 * not UPDATE+DELETE. See triggers.sql for the role setup.
 *
 * Callers that are not already in a transaction should use the overload
 * defined in `./index.ts` that opens one for them.
 */

export type WriteTimelineEventInput = Omit<TimelineEvent, 'id' | 'occurredAt'> & {
  readonly id?: string;
  readonly occurredAt?: Date;
};

export async function writeTimelineEvent(
  client: PoolClient,
  input: WriteTimelineEventInput,
): Promise<{ readonly id: string }> {
  const id = input.id ?? ulid();
  const occurredAt = input.occurredAt ?? new Date();

  // Switch to the writer role for this statement. `SET LOCAL` scopes the
  // role change to the current transaction — it reverts on COMMIT/ROLLBACK.
  await client.query(`SET LOCAL ROLE civic_memory_role`);
  try {
    await client.query(
      `INSERT INTO timeline_events (id, issue_id, event_type, actor_member_id, payload, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, input.issueId, input.eventType, input.actorMemberId ?? null, input.payload, occurredAt],
    );
  } finally {
    await client.query(`RESET ROLE`);
  }

  return { id };
}
