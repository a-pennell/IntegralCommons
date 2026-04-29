import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { issues } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Archive an Issue. Final state — no further transitions out.
 *
 * Permitted from: open, exploring, decided, reopened, stalled.
 * Writes an `issue_status_changed` Civic Memory event.
 */
export async function archiveIssue(input: {
  readonly issueId: string;
  readonly actorMemberId: string;
}): Promise<Result<void, AppError>> {
  const rows = await db.select().from(issues).where(eq(issues.id, input.issueId)).limit(1);
  const issue = rows[0];
  if (!issue) return err(errors.notFound('issue'));

  if (issue.status === 'archived') return ok(undefined);

  return transaction(async (tx) => {
    await tx.query(`UPDATE issues SET status = 'archived', updated_at = now() WHERE id = $1`, [
      input.issueId,
    ]);
    await writeTimelineEvent(tx, {
      issueId: input.issueId,
      eventType: 'issue_status_changed',
      actorMemberId: input.actorMemberId,
      payload: { from: issue.status, to: 'archived' },
    });
    return ok(undefined);
  });
}
