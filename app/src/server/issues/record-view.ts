import { eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { issueViews, quorumStates } from '@/db/schema';

/**
 * Record that a member has viewed an Issue (awareness-quorum tracker).
 *
 * Uses ON CONFLICT DO NOTHING — the first view per (issue, member) pair
 * inserts a row; subsequent calls are silent no-ops (idempotent by design).
 * After the insert, the QuorumState awareness_count is bumped atomically.
 *
 * Implements FR-037 (awareness tracking) and the read side of CR-011
 * (participation integrity — an Issue cannot reach Decided if fewer than
 * the threshold fraction of active members have viewed it).
 */

export async function recordIssueView(args: {
  readonly issueId: string;
  readonly memberId: string;
}): Promise<void> {
  // Insert the view row (no-op if already exists).
  const inserted = await db
    .insert(issueViews)
    .values({ issueId: args.issueId, memberId: args.memberId })
    .onConflictDoNothing()
    .returning({ issueId: issueViews.issueId });

  // Only bump the counter if a new row was actually written.
  if (inserted.length > 0) {
    await db
      .update(quorumStates)
      .set({
        awarenessCount: sql`${quorumStates.awarenessCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(quorumStates.issueId, args.issueId));
  }
}
