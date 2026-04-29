import { eq } from 'drizzle-orm';
import { db, transaction } from '@/db';
import { perspectives } from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';
import { writeTimelineEvent } from '@/server/civic-memory';

/**
 * Edit an existing Perspective's body.
 *
 * Only the original author may edit. Editing sets `edited_at`; the prior
 * body is captured in the `perspective_edited` Civic Memory event's payload
 * so the revision history survives in append-only form even though the
 * perspective row itself is updated in place.
 */

export type EditPerspectiveInput = {
  readonly perspectiveId: string;
  readonly editorMemberId: string;
  readonly bodyMarkdown: string;
};

export async function editPerspective(
  input: EditPerspectiveInput,
): Promise<Result<void, AppError>> {
  if (input.bodyMarkdown.length < 1 || input.bodyMarkdown.length > 10_000) {
    return err(
      errors.validation([
        { path: 'bodyMarkdown', message: 'Perspective body must be 1–10,000 characters.' },
      ]),
    );
  }

  const rows = await db
    .select()
    .from(perspectives)
    .where(eq(perspectives.id, input.perspectiveId))
    .limit(1);
  const existing = rows[0];
  if (!existing) return err(errors.notFound('perspective'));

  if (existing.authorId !== input.editorMemberId) {
    return err(
      errors.notAuthorized(
        'authorship of this Perspective',
        'Only the original author may edit a Perspective.',
      ),
    );
  }

  return transaction(async (tx) => {
    await tx.query(
      `UPDATE perspectives
          SET body_markdown = $1,
              edited_at = now()
        WHERE id = $2`,
      [input.bodyMarkdown, input.perspectiveId],
    );

    await writeTimelineEvent(tx, {
      issueId: existing.issueId,
      eventType: 'perspective_edited',
      actorMemberId: input.editorMemberId,
      payload: {
        perspectiveId: input.perspectiveId,
        priorBody: existing.bodyMarkdown,
        priorEditedAt: existing.editedAt,
      },
    });

    return ok(undefined);
  });
}
