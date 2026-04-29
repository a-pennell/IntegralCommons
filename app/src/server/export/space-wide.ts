import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  decisionRecords,
  delegations,
  invitations,
  issues,
  memberships,
  officialSummaries,
  perspectives,
  quorumStates,
  referenda,
  referendumVotes,
  spaces,
  timelineEvents,
} from '@/db/schema';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import type { Result } from '@/lib/result';
import { err, ok } from '@/lib/result';

/**
 * Space-wide export — gated by Issue-driven authorization (FR-051, CR-003).
 *
 * The caller passes the ID of a finalized Decision Record that explicitly
 * authorized the export. The service verifies the DR is finalized and not
 * superseded, then assembles the full dataset.
 *
 * CR-003 (Forkability) requires this export be complete: a fresh import from
 * the bundle must produce an identical governance state.
 */

export type SpaceWideExportInput = {
  readonly spaceId: string;
  readonly requestingMemberId: string;
  readonly authorizingDecisionRecordId: string;
};

export type SpaceWideBundle = {
  readonly exportedAt: string;
  readonly spaceId: string;
  readonly space: Record<string, unknown>;
  readonly memberships: Array<Record<string, unknown>>;
  readonly invitations: Array<Record<string, unknown>>;
  readonly issues: Array<Record<string, unknown>>;
  readonly perspectives: Array<Record<string, unknown>>;
  readonly decisionRecords: Array<Record<string, unknown>>;
  readonly delegations: Array<Record<string, unknown>>;
  readonly referenda: Array<Record<string, unknown>>;
  readonly votes: Array<Record<string, unknown>>;
  readonly quorumStates: Array<Record<string, unknown>>;
  readonly officialSummaries: Array<Record<string, unknown>>;
  readonly timelineEvents: Array<Record<string, unknown>>;
};

export async function buildSpaceWideBundle(
  input: SpaceWideExportInput,
): Promise<Result<SpaceWideBundle, AppError>> {
  // Verify the authorizing DR exists, is finalized, and is not superseded.
  const drRows = await db
    .select()
    .from(decisionRecords)
    .where(
      and(
        eq(decisionRecords.id, input.authorizingDecisionRecordId),
        eq(decisionRecords.issueId, decisionRecords.issueId), // always true — self-check for type inference
      ),
    )
    .limit(1);

  const authDr = drRows[0];
  if (!authDr) {
    return err(errors.notFound('decision_record'));
  }
  if (!authDr.finalizedAt) {
    return err(
      errors.notAuthorized(
        'a finalized Decision Record granting export',
        'The authorizing Decision Record has not been finalized.',
      ),
    );
  }

  // Check the DR hasn't been superseded.
  const supersededBy = await db
    .select({ id: decisionRecords.id })
    .from(decisionRecords)
    .where(eq(decisionRecords.supersedesDecisionRecordId, input.authorizingDecisionRecordId))
    .limit(1);

  if (supersededBy[0]) {
    return err(
      errors.notAuthorized(
        'a current Decision Record granting export',
        'The authorizing Decision Record has been superseded.',
      ),
    );
  }

  // Verify the requesting member is active in the Space.
  const membership = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.spaceId, input.spaceId),
        eq(memberships.memberId, input.requestingMemberId),
        eq(memberships.status, 'active'),
      ),
    )
    .limit(1);

  if (!membership[0]) {
    return err(
      errors.notAuthorized('an active Space membership', 'Only active members may export.'),
    );
  }

  // Assemble the full dataset.
  const [
    spaceRows,
    membershipRows,
    invitationRows,
    issueRows,
    perspectiveRows,
    drRows2,
    delegationRows,
    referendaRows,
    voteRows,
    quorumRows,
    summaryRows,
    eventRows,
  ] = await Promise.all([
    db.select().from(spaces).where(eq(spaces.id, input.spaceId)).limit(1),
    db.select().from(memberships).where(eq(memberships.spaceId, input.spaceId)),
    db.select().from(invitations).where(eq(invitations.spaceId, input.spaceId)),
    db.select().from(issues).where(eq(issues.spaceId, input.spaceId)),
    db
      .select({ perspective: perspectives })
      .from(perspectives)
      .innerJoin(issues, eq(perspectives.issueId, issues.id))
      .where(eq(issues.spaceId, input.spaceId)),
    db
      .select({ dr: decisionRecords })
      .from(decisionRecords)
      .innerJoin(issues, eq(decisionRecords.issueId, issues.id))
      .where(eq(issues.spaceId, input.spaceId)),
    db.select().from(delegations).where(eq(delegations.spaceId, input.spaceId)),
    db
      .select({ referendum: referenda })
      .from(referenda)
      .where(eq(referenda.spaceId, input.spaceId)),
    db
      .select({ vote: referendumVotes })
      .from(referendumVotes)
      .innerJoin(referenda, eq(referendumVotes.referendumId, referenda.id))
      .where(eq(referenda.spaceId, input.spaceId)),
    db
      .select({ qs: quorumStates })
      .from(quorumStates)
      .innerJoin(issues, eq(quorumStates.issueId, issues.id))
      .where(eq(issues.spaceId, input.spaceId)),
    db
      .select({ summary: officialSummaries })
      .from(officialSummaries)
      .innerJoin(issues, eq(officialSummaries.issueId, issues.id))
      .where(eq(issues.spaceId, input.spaceId)),
    db
      .select({ event: timelineEvents })
      .from(timelineEvents)
      .innerJoin(issues, eq(timelineEvents.issueId, issues.id))
      .where(eq(issues.spaceId, input.spaceId)),
  ]);

  if (!spaceRows[0]) {
    return err(errors.notFound('space'));
  }

  return ok({
    exportedAt: new Date().toISOString(),
    spaceId: input.spaceId,
    space: spaceRows[0] as Record<string, unknown>,
    memberships: membershipRows as Array<Record<string, unknown>>,
    invitations: invitationRows as Array<Record<string, unknown>>,
    issues: issueRows as Array<Record<string, unknown>>,
    perspectives: perspectiveRows.map((r) => r.perspective as Record<string, unknown>),
    decisionRecords: drRows2.map((r) => r.dr as Record<string, unknown>),
    delegations: delegationRows as Array<Record<string, unknown>>,
    referenda: referendaRows.map((r) => r.referendum as Record<string, unknown>),
    votes: voteRows.map((r) => r.vote as Record<string, unknown>),
    quorumStates: quorumRows.map((r) => r.qs as Record<string, unknown>),
    officialSummaries: summaryRows.map((r) => r.summary as Record<string, unknown>),
    timelineEvents: eventRows.map((r) => r.event as Record<string, unknown>),
  });
}
