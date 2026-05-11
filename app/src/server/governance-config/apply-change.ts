import type { PoolClient } from 'pg';
import { GovernanceProfileSchema, type GovernanceProfile } from './schema.ts';
import { cr009WouldLoosenRateLimits } from '@/server/constitution';

// Constitutional floors (must match governance-config/schema.ts DEFAULTS).
const RATE_LIMIT_FLOOR = {
  createIssuePerDay: 3,
  initiateReferendumPerRollingWeek: 1,
};
const STABILITY_FLOOR_DAYS = {
  standardIssue: 30,
  policyChange: 90,
  constitutionalAmendment: 180,
  delegationGrant: 90,
};

/**
 * Apply a governance-profile change after a Decision Record is finalized.
 *
 * Called from `decisions/finalize.ts` inside the same transaction when the
 * closed Issue's `structured_sections.changeType === 'governance_profile'`.
 *
 * Validates the proposed profile against the constitutional floors (CR-008,
 * CR-009) before writing. If validation fails the transaction is rolled back
 * by the caller.
 */

export type ApplyChangeResult =
  | { readonly ok: true; readonly applied: boolean }
  | { readonly ok: false; readonly reason: string; readonly cr?: string };

export async function applyGovernanceChangeIfNeeded(
  client: PoolClient,
  args: {
    readonly spaceId: string;
    readonly issueStructuredSections: unknown;
  },
): Promise<ApplyChangeResult> {
  const sections = args.issueStructuredSections as Record<string, unknown> | null;
  if (!sections || sections.changeType !== 'governance_profile') {
    return { ok: true, applied: false };
  }

  const raw = sections.proposedProfile;

  // CR-009 pre-check: run before full schema validation so the violation is
  // tagged with cr:'CR-009' even when Zod's .max() constraint rejects the
  // same value (they enforce the same floor).
  const rawRateLimits = (raw as { rateLimits?: Record<string, unknown> } | null)?.rateLimits;
  if (rawRateLimits) {
    const { createIssuePerDay, initiateReferendumPerRollingWeek } = rawRateLimits;
    if (typeof createIssuePerDay === 'number') {
      const v = cr009WouldLoosenRateLimits({
        proposedLimit: createIssuePerDay,
        floorLimit: RATE_LIMIT_FLOOR.createIssuePerDay,
      });
      if (v) return { ok: false, reason: v.explanation, cr: 'CR-009' };
    }
    if (typeof initiateReferendumPerRollingWeek === 'number') {
      const v = cr009WouldLoosenRateLimits({
        proposedLimit: initiateReferendumPerRollingWeek,
        floorLimit: RATE_LIMIT_FLOOR.initiateReferendumPerRollingWeek,
      });
      if (v) return { ok: false, reason: v.explanation, cr: 'CR-009' };
    }
  }

  const parsed = GovernanceProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reason: `Proposed governance profile failed schema validation: ${parsed.error.message}`,
    };
  }

  const proposed: GovernanceProfile = parsed.data;

  // CR-009: rate limits may not be loosened below constitutional floors.
  const createIssueViolation = cr009WouldLoosenRateLimits({
    proposedLimit: proposed.rateLimits.createIssuePerDay,
    floorLimit: RATE_LIMIT_FLOOR.createIssuePerDay,
  });
  if (createIssueViolation) {
    return { ok: false, reason: createIssueViolation.explanation, cr: 'CR-009' };
  }

  const referendumViolation = cr009WouldLoosenRateLimits({
    proposedLimit: proposed.rateLimits.initiateReferendumPerRollingWeek,
    floorLimit: RATE_LIMIT_FLOOR.initiateReferendumPerRollingWeek,
  });
  if (referendumViolation) {
    return { ok: false, reason: referendumViolation.explanation, cr: 'CR-009' };
  }

  // CR-008: stability periods may not be shortened below constitutional floors.
  const stabilityChecks: Array<{ proposed: number; floor: number; name: string }> = [
    {
      proposed: proposed.stability.standardIssueDays,
      floor: STABILITY_FLOOR_DAYS.standardIssue,
      name: 'standardIssueDays',
    },
    {
      proposed: proposed.stability.policyChangeDays,
      floor: STABILITY_FLOOR_DAYS.policyChange,
      name: 'policyChangeDays',
    },
    {
      proposed: proposed.stability.constitutionalAmendmentDays,
      floor: STABILITY_FLOOR_DAYS.constitutionalAmendment,
      name: 'constitutionalAmendmentDays',
    },
    {
      proposed: proposed.stability.delegationGrantDays,
      floor: STABILITY_FLOOR_DAYS.delegationGrant,
      name: 'delegationGrantDays',
    },
  ];

  for (const check of stabilityChecks) {
    if (check.proposed < check.floor) {
      return {
        ok: false,
        reason: `CR-008: ${check.name} (${check.proposed}) cannot be set below the constitutional floor (${check.floor} days).`,
        cr: 'CR-008',
      };
    }
  }

  // Write the new profile.
  await client.query(
    `UPDATE spaces SET governance_profile = $1, updated_at = now() WHERE id = $2`,
    [JSON.stringify(proposed), args.spaceId],
  );

  return { ok: true, applied: true };
}
