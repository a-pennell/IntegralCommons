import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  decisionRecords,
  delegations,
  issues,
  members,
  memberships,
  perspectives,
  spaces,
  timelineEvents,
} from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';

/**
 * Own-data export — always-on, no gating (FR-050, CR-002).
 *
 * Queries every row where the member is the author/subject. This path MUST
 * remain unrestricted — no delegation or DR authorization is required. The
 * member's session alone is sufficient. CR-002 says group decisions may not
 * restrict exit rights; own-data export enforces that guarantee structurally.
 */

export type OwnDataExportInput = {
  readonly memberId: string;
  readonly spaceId?: string;
};

export type OwnDataBundle = {
  readonly exportedAt: string;
  readonly memberId: string;
  readonly member: {
    id: string;
    email: string | null;
    displayName: string | null;
    createdAt: Date;
  } | null;
  readonly memberships: Array<{
    spaceId: string;
    spaceName: string;
    spaceSlug: string;
    joinedAt: Date | null;
    status: string;
  }>;
  readonly perspectives: Array<Record<string, unknown>>;
  readonly decisionRecords: Array<Record<string, unknown>>;
  readonly delegations: Array<Record<string, unknown>>;
  readonly timelineEvents: Array<Record<string, unknown>>;
};

export async function buildOwnDataBundle(
  input: OwnDataExportInput,
): Promise<Result<OwnDataBundle, AppError>> {
  const memberRow = await db
    .select({
      id: members.id,
      email: members.email,
      displayName: members.displayName,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(eq(members.id, input.memberId))
    .limit(1);

  if (!memberRow[0]) {
    return err(errors.notFound('member'));
  }

  const membershipRows = await db
    .select({
      spaceId: memberships.spaceId,
      status: memberships.status,
      joinedAt: memberships.joinedAt,
      spaceName: spaces.name,
      spaceSlug: spaces.slug,
    })
    .from(memberships)
    .innerJoin(spaces, eq(memberships.spaceId, spaces.id))
    .where(
      and(
        eq(memberships.memberId, input.memberId),
        input.spaceId ? eq(memberships.spaceId, input.spaceId) : undefined,
      ),
    );

  const perspectiveRows = await db
    .select()
    .from(perspectives)
    .innerJoin(issues, eq(perspectives.issueId, issues.id))
    .where(
      and(
        eq(perspectives.authorId, input.memberId),
        input.spaceId ? eq(issues.spaceId, input.spaceId) : undefined,
      ),
    );

  const drRows = await db
    .select()
    .from(decisionRecords)
    .innerJoin(issues, eq(decisionRecords.issueId, issues.id))
    .where(
      and(
        eq(decisionRecords.draftedByMemberId, input.memberId),
        input.spaceId ? eq(issues.spaceId, input.spaceId) : undefined,
      ),
    );

  const delegationRows = await db
    .select()
    .from(delegations)
    .where(
      and(
        eq(delegations.granteeMemberId, input.memberId),
        input.spaceId ? eq(delegations.spaceId, input.spaceId) : undefined,
      ),
    );

  const eventRows = await db
    .select({ event: timelineEvents })
    .from(timelineEvents)
    .innerJoin(issues, eq(timelineEvents.issueId, issues.id))
    .where(
      and(
        eq(timelineEvents.actorMemberId, input.memberId),
        input.spaceId ? eq(issues.spaceId, input.spaceId) : undefined,
      ),
    );

  return ok({
    exportedAt: new Date().toISOString(),
    memberId: input.memberId,
    member: memberRow[0] ?? null,
    memberships: membershipRows.map((m) => ({
      spaceId: m.spaceId,
      spaceName: m.spaceName,
      spaceSlug: m.spaceSlug,
      joinedAt: m.joinedAt,
      status: m.status,
    })),
    perspectives: perspectiveRows.map((r) => r.perspectives as Record<string, unknown>),
    decisionRecords: drRows.map((r) => r.decision_records as Record<string, unknown>),
    delegations: delegationRows as Array<Record<string, unknown>>,
    timelineEvents: eventRows.map((r) => r.event as Record<string, unknown>),
  });
}
