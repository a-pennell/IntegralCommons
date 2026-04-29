import { pgEnum } from 'drizzle-orm/pg-core';

/**
 * PostgreSQL ENUM types used across the schema.
 *
 * Adding a value is a migration. Removing a value is a migration AND a
 * backfill exercise — rare. Every enum here is declared at the database
 * level so referential integrity is enforced below the service layer.
 *
 * See data-model.md §Conventions and §Entities for the full mapping.
 */

export const membershipStatusEnum = pgEnum('membership_status', ['invited', 'active', 'departed']);

export const issueStatusEnum = pgEnum('issue_status', [
  'open',
  'exploring',
  'decided',
  'reopened',
  'archived',
  'stalled',
]);

export const stallReasonEnum = pgEnum('stall_reason', ['insufficient_participation']);

export const delegationGrantSourceEnum = pgEnum('delegation_grant_source', [
  'group_consent',
  'predecessor_delegation',
  'bootstrap',
]);

export const delegationCapabilityEnum = pgEnum('delegation_capability', ['facilitation']);

export const referendumTargetEnum = pgEnum('referendum_target', [
  'delegation',
  'decision_record',
  'governance_profile_change',
]);

export const referendumStatusEnum = pgEnum('referendum_status', [
  'initiating',
  'deliberating',
  'voting',
  'closed',
]);

export const referendumOutcomeEnum = pgEnum('referendum_outcome', [
  'affirmed',
  'revoked',
  'insufficient_quorum',
]);

export const voteChoiceEnum = pgEnum('vote_choice', ['support', 'oppose', 'stand_aside']);

export const timelineEventTypeEnum = pgEnum('timeline_event_type', [
  'issue_created',
  'issue_status_changed',
  'issue_edited',
  'perspective_added',
  'perspective_edited',
  'summary_published',
  'decision_record_drafted',
  'decision_record_finalized',
  'decision_record_superseded',
  'delegation_granted',
  'delegation_revoked',
  'referendum_initiated',
  'referendum_deliberation_started',
  'referendum_voting_started',
  'referendum_closed',
  'quorum_stalled',
  'quorum_unstalled',
  'governance_profile_changed',
  'member_removed',
  'export_performed',
  'export_attempt_denied',
]);

export const rateLimitedActionEnum = pgEnum('rate_limited_action', [
  'initiate_referendum',
  'create_issue',
]);

export const digestCadenceEnum = pgEnum('digest_cadence', ['daily', 'weekly', 'monthly', 'off']);
