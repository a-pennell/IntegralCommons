import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { decisionRecords } from '@/db/schema';
import type { DecisionRecord } from '@/db/schema';

/**
 * Read helpers for Decision Records. Visibility is scoped upstream by the
 * caller (via `getIssueBySlugForMember`); once the Issue is visible, every
 * associated DR is too.
 */

export async function getDecisionRecord(decisionRecordId: string): Promise<DecisionRecord | null> {
  const rows = await db
    .select()
    .from(decisionRecords)
    .where(eq(decisionRecords.id, decisionRecordId))
    .limit(1);
  return rows[0] ?? null;
}

export async function listDecisionRecordsForIssue(
  issueId: string,
): Promise<ReadonlyArray<DecisionRecord>> {
  return db
    .select()
    .from(decisionRecords)
    .where(eq(decisionRecords.issueId, issueId))
    .orderBy(desc(decisionRecords.createdAt));
}

/**
 * Walk the supersession chain — newest-first — starting from the currently
 * finalized DR on an Issue.
 */
export async function getSupersessionChain(
  currentDecisionRecordId: string,
): Promise<ReadonlyArray<DecisionRecord>> {
  const out: DecisionRecord[] = [];
  let cursor: string | null = currentDecisionRecordId;
  while (cursor) {
    const dr = await getDecisionRecord(cursor);
    if (!dr) break;
    out.push(dr);
    cursor = dr.supersedesDecisionRecordId;
  }
  return out;
}
