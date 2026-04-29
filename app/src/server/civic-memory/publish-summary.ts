import { createHash } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db, getPool } from '@/db';
import { officialSummaries } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';
import { memberHoldsCapability } from '@/server/delegations';
import { writeTimelineEvent } from './write-event.ts';

/**
 * Publish an Official Summary for an Issue (FR-040, FR-041).
 *
 * Each publish creates a new row with an incremented version — prior
 * versions are immutable. The author must hold the `facilitation`
 * delegation for the Issue.
 *
 * A `summary_published` TimelineEvent is written via civic_memory_role
 * (append-only) so the summary history appears in the Civic Memory timeline.
 */

export type PublishSummaryInput = {
  readonly issueId: string;
  readonly spaceId: string;
  readonly authorMemberId: string;
  readonly bodyMarkdown: string;
};

export type PublishSummaryOk = {
  readonly summaryId: string;
  readonly version: number;
};

export async function publishSummary(
  input: PublishSummaryInput,
): Promise<Result<PublishSummaryOk, AppError>> {
  const trimmedBody = input.bodyMarkdown.trim();
  if (trimmedBody.length < 1 || trimmedBody.length > 20_000) {
    return err(
      errors.validation([
        { path: 'bodyMarkdown', message: 'Summary must be 1–20,000 characters.' },
      ]),
    );
  }

  // Facilitation delegation required (US5, T170).
  const hasFacilitation = await memberHoldsCapability({
    spaceId: input.spaceId,
    issueId: input.issueId,
    memberId: input.authorMemberId,
    capability: 'facilitation',
  });
  if (!hasFacilitation) {
    return err(
      errors.notAuthorized(
        'a facilitation delegation for this Issue',
        'Only the delegated facilitator may publish an Official Summary.',
      ),
    );
  }

  // Resolve the next version number.
  const latest = await db
    .select({ version: officialSummaries.version })
    .from(officialSummaries)
    .where(eq(officialSummaries.issueId, input.issueId))
    .orderBy(desc(officialSummaries.version))
    .limit(1);

  const nextVersion = (latest[0]?.version ?? 0) + 1;
  const contentHash = createHash('sha256').update(trimmedBody).digest('hex');
  const summaryId = ulid();

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO official_summaries (id, issue_id, version, author_member_id, body_markdown, content_hash, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, now())`,
      [summaryId, input.issueId, nextVersion, input.authorMemberId, trimmedBody, contentHash],
    );

    await writeTimelineEvent(client, {
      issueId: input.issueId,
      eventType: 'summary_published',
      actorMemberId: input.authorMemberId,
      payload: { summaryId, version: nextVersion },
    });

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  return ok({ summaryId, version: nextVersion });
}
