/**
 * AppError — discriminated-union error taxonomy for the service layer.
 *
 * Every service-layer function returns Result<Ok, AppError>. The UI renders
 * each variant according to plan.md §Error Handling & Validation Strategy:
 *
 *   - ValidationError          → inline field error
 *   - NotAuthenticated         → redirect to /login
 *   - NotAuthorized            → explanation + who holds the delegation
 *   - ConstitutionalViolation  → dialog citing the CR number and principle
 *   - QuorumNotMet             → current counts vs. thresholds
 *   - RateLimited              → cadence + unlock time
 *   - StabilityPeriodActive    → days remaining + exceptional-conditions threshold
 *   - NotFound                 → 404
 *   - Conflict                 → reload and reconcile
 *   - InternalError            → 500 with trace ID
 */

export type FieldIssue = {
  readonly path: string;
  readonly message: string;
};

export type ValidationError = {
  readonly kind: 'ValidationError';
  readonly issues: ReadonlyArray<FieldIssue>;
};

export type NotAuthenticated = {
  readonly kind: 'NotAuthenticated';
  readonly redirectTo?: string;
};

export type NotAuthorized = {
  readonly kind: 'NotAuthorized';
  readonly required: string; // e.g. "facilitation delegation on issue X"
  readonly holderHint?: string; // e.g. "Member Y currently holds this delegation"
};

export type ConstitutionalViolation = {
  readonly kind: 'ConstitutionalViolation';
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

export type QuorumNotMet = {
  readonly kind: 'QuorumNotMet';
  readonly tier: 'awareness' | 'participation' | 'decision';
  readonly current: number;
  readonly required: number;
  readonly nextCheckAt?: Date;
};

export type RateLimitedAction = 'initiate_referendum' | 'create_issue' | 'magic_link_request';

export type RateLimited = {
  readonly kind: 'RateLimited';
  readonly action: RateLimitedAction;
  readonly windowDescription: string; // e.g. "1 per rolling 7-day window"
  readonly unlocksAt: Date;
};

export type StabilityPeriodActive = {
  readonly kind: 'StabilityPeriodActive';
  readonly daysRemaining: number;
  readonly supermajorityRequired: number; // e.g. 67 for 2/3
};

export type NotFound = {
  readonly kind: 'NotFound';
  readonly resource: string;
};

export type Conflict = {
  readonly kind: 'Conflict';
  readonly resource: string;
  readonly reason: string;
};

export type InternalError = {
  readonly kind: 'InternalError';
  readonly traceId: string;
};

export type AppError =
  | ValidationError
  | NotAuthenticated
  | NotAuthorized
  | ConstitutionalViolation
  | QuorumNotMet
  | RateLimited
  | StabilityPeriodActive
  | NotFound
  | Conflict
  | InternalError;

// ─── Constructors ──────────────────────────────────────────────────────────

export const errors = {
  validation: (issues: ReadonlyArray<FieldIssue>): ValidationError => ({
    kind: 'ValidationError',
    issues,
  }),

  notAuthenticated: (redirectTo?: string): NotAuthenticated => ({
    kind: 'NotAuthenticated',
    ...(redirectTo !== undefined && { redirectTo }),
  }),

  notAuthorized: (required: string, holderHint?: string): NotAuthorized => ({
    kind: 'NotAuthorized',
    required,
    ...(holderHint !== undefined && { holderHint }),
  }),

  constitutional: (
    cr: ConstitutionalViolation['cr'],
    explanation: string,
  ): ConstitutionalViolation => ({
    kind: 'ConstitutionalViolation',
    cr,
    explanation,
  }),

  quorum: (
    tier: QuorumNotMet['tier'],
    current: number,
    required: number,
    nextCheckAt?: Date,
  ): QuorumNotMet => ({
    kind: 'QuorumNotMet',
    tier,
    current,
    required,
    ...(nextCheckAt !== undefined && { nextCheckAt }),
  }),

  rateLimited: (
    action: RateLimitedAction,
    windowDescription: string,
    unlocksAt: Date,
  ): RateLimited => ({
    kind: 'RateLimited',
    action,
    windowDescription,
    unlocksAt,
  }),

  stability: (daysRemaining: number, supermajorityRequired: number): StabilityPeriodActive => ({
    kind: 'StabilityPeriodActive',
    daysRemaining,
    supermajorityRequired,
  }),

  notFound: (resource: string): NotFound => ({
    kind: 'NotFound',
    resource,
  }),

  conflict: (resource: string, reason: string): Conflict => ({
    kind: 'Conflict',
    resource,
    reason,
  }),

  internal: (traceId: string): InternalError => ({
    kind: 'InternalError',
    traceId,
  }),
} as const;
