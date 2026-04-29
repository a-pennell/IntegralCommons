/**
 * Constitutional predicate skeletons.
 *
 * Each CR-001 through CR-012 predicate lives here as a pure function.
 * Modules enforcing the CR call these predicates; the dedicated test suite
 * in tests/constitutional/ attempts violations and asserts refusal.
 *
 * Phase 1 approach: every predicate returns a `Violation | null` shape.
 * Callers translate a non-null result into `errors.constitutional(cr, …)`.
 *
 * Bodies are intentionally minimal here — the real enforcement logic lives
 * in the module that invokes the predicate (e.g., delegations.revoke,
 * referenda.initiate). These are the invariants expressed declaratively so
 * reviewers can see them in one place.
 */

export type Violation = {
  readonly cr:
    | 'CR-001'
    | 'CR-002'
    | 'CR-003'
    | 'CR-004'
    | 'CR-005'
    | 'CR-006'
    | 'CR-007'
    | 'CR-008'
    | 'CR-009'
    | 'CR-010'
    | 'CR-011'
    | 'CR-012';
  readonly explanation: string;
};

const violation = (cr: Violation['cr'], explanation: string): Violation => ({ cr, explanation });

// ─── CR-001: Removal due process ──────────────────────────────────────────

export function cr001SubjectMemberVotingOnOwnRemoval(args: {
  readonly voterMemberId: string;
  readonly subjectMemberId: string | null;
}): Violation | null {
  if (args.subjectMemberId && args.voterMemberId === args.subjectMemberId) {
    return violation(
      'CR-001',
      'The subject of a removal referendum may submit perspectives but may not cast a vote on their own removal.',
    );
  }
  return null;
}

// ─── CR-002: Commons protection ───────────────────────────────────────────

export function cr002WouldRestrictExit(args: {
  readonly decisionRestrictsExport?: boolean;
  readonly decisionRestrictsRightToLeave?: boolean;
}): Violation | null {
  if (args.decisionRestrictsExport || args.decisionRestrictsRightToLeave) {
    return violation(
      'CR-002',
      'Decisions may not privatize shared infrastructure, restrict exit rights, or render governance irrevocable.',
    );
  }
  return null;
}

// ─── CR-003: Forkability ──────────────────────────────────────────────────
// Architectural, not a predicate. Enforced by the export module always
// producing fully-featured bundles; verified by the export→reimport E2E
// test (cr-003-forkability.test.ts).

// ─── CR-004: Bootstrap ────────────────────────────────────────────────────

export function cr004NonBootstrapIssueBeforeCompletion(args: {
  readonly bootstrapCompletedAt: Date | null;
  readonly isBootstrap: boolean;
}): Violation | null {
  if (!args.bootstrapCompletedAt && !args.isBootstrap) {
    return violation(
      'CR-004',
      'Non-bootstrap Issues cannot be created before the Bootstrap Issue is decided.',
    );
  }
  return null;
}

// ─── CR-005: Revocability ─────────────────────────────────────────────────
// Enforced structurally — the delegations table has no `irrevocable` column.
// There is no runtime predicate here. The constitutional test cr-005 asserts
// `delegations.revoke()` always succeeds (idempotent on second call).

// ─── CR-006: Bounded referendum ───────────────────────────────────────────

export function cr006ThresholdNotMet(args: {
  readonly supporterCount: number;
  readonly thresholdRequired: number;
}): Violation | null {
  if (args.supporterCount < args.thresholdRequired) {
    return violation(
      'CR-006',
      `Referendum cannot enter deliberation: needs ${args.thresholdRequired} supporters, has ${args.supporterCount}.`,
    );
  }
  return null;
}

// ─── CR-007: Scope + subsidiarity ─────────────────────────────────────────

export function cr007InvalidScopeTag(args: {
  readonly supplied: ReadonlyArray<string>;
  readonly vocabulary: ReadonlyArray<string>;
}): Violation | null {
  const invalid = args.supplied.filter((t) => !args.vocabulary.includes(t));
  if (invalid.length > 0) {
    return violation(
      'CR-007',
      `Unknown scope tag(s): ${invalid.join(', ')}. Supply only tags in the Space's configured vocabulary.`,
    );
  }
  return null;
}

// ─── CR-008: Temporal stability ───────────────────────────────────────────

export function cr008StabilityPeriodActive(args: {
  readonly lastDecisionAt: Date;
  readonly minimumStabilityDays: number;
  readonly hasSupermajority?: boolean;
}): Violation | null {
  if (args.hasSupermajority) return null;
  const now = Date.now();
  const elapsedDays = (now - args.lastDecisionAt.getTime()) / (1000 * 60 * 60 * 24);
  if (elapsedDays < args.minimumStabilityDays) {
    const daysRemaining = Math.ceil(args.minimumStabilityDays - elapsedDays);
    return violation(
      'CR-008',
      `Stability period active: ${daysRemaining} days remain before this decision can be challenged without a 2/3 supermajority.`,
    );
  }
  return null;
}

// ─── CR-009: Rate limiting ────────────────────────────────────────────────

export function cr009RateLimitExceeded(args: {
  readonly currentCount: number;
  readonly limit: number;
  readonly windowDescription: string;
}): Violation | null {
  if (args.currentCount >= args.limit) {
    return violation('CR-009', `Rate limit reached: ${args.limit} ${args.windowDescription}.`);
  }
  return null;
}

export function cr009WouldLoosenRateLimits(args: {
  readonly proposedLimit: number;
  readonly floorLimit: number;
}): Violation | null {
  if (args.proposedLimit > args.floorLimit) {
    return violation(
      'CR-009',
      `Proposed rate limit ${args.proposedLimit} exceeds the constitutional floor ${args.floorLimit}. Spaces may tighten rate limits, never loosen them.`,
    );
  }
  return null;
}

// ─── CR-010: Deliberation first ───────────────────────────────────────────

export function cr010VoteBeforeDeliberation(args: {
  readonly deliberationStartedAt: Date | null;
  readonly minimumDeliberationMs: number;
}): Violation | null {
  if (!args.deliberationStartedAt) {
    return violation('CR-010', 'Voting cannot begin: deliberation has not started.');
  }
  const elapsed = Date.now() - args.deliberationStartedAt.getTime();
  if (elapsed < args.minimumDeliberationMs) {
    const remainingMinutes = Math.ceil((args.minimumDeliberationMs - elapsed) / 60000);
    return violation(
      'CR-010',
      `Deliberation must run at least the configured minimum: ${remainingMinutes} more minute(s) before voting can start.`,
    );
  }
  return null;
}

// ─── CR-011: Participation integrity ──────────────────────────────────────

export function cr011DecideWithoutAwareness(args: {
  readonly awarenessCount: number;
  readonly awarenessRequired: number;
}): Violation | null {
  if (args.awarenessCount < args.awarenessRequired) {
    return violation(
      'CR-011',
      `Issue cannot be decided: awareness quorum not met (${args.awarenessCount}/${args.awarenessRequired}).`,
    );
  }
  return null;
}

// ─── CR-012: Conflict resolution ──────────────────────────────────────────
// A meta-predicate: when two deliberable principles conflict, the system
// opens a meta-Issue rather than picking a side. Implementation lives in
// `constitution/meta-issue.ts` (T184). No standalone predicate here — the
// conflict is detected by the module that would otherwise be forced to pick.
