import { z } from 'zod';

/**
 * Governance profile — per-Space configurable mechanics.
 *
 * Stored in `spaces.governance_profile` (JSONB). Every field has a constitutional
 * floor enforced at the service layer — Spaces may TIGHTEN defaults, never
 * loosen below them (CR-008, CR-009).
 *
 * See docs/commonground-default-governance-policy.md for the full rationale.
 * This schema is the Phase-1 subset the code actually reads; it grows as more
 * machinery lands.
 */

// ─── Defaults ──────────────────────────────────────────────────────────────

const DELIBERATION_DEFAULTS = {
  standardIssueHours: 72,
  tier2AmendmentDays: 14,
  tier1AmendmentDays: 30,
  decisionMethodChangeDays: 14,
} as const;

const QUORUM_DEFAULTS = {
  awarenessPct: 0.5,
  participationPct: 0.25,
  deliberationHours: 72,
  extensionMultiplier: 1.5,
} as const;

const RATE_LIMIT_DEFAULTS = {
  createIssuePerDay: 3,
  initiateReferendumPerRollingWeek: 1,
} as const;

const STABILITY_DEFAULTS = {
  standardIssueDays: 30,
  policyChangeDays: 90,
  constitutionalAmendmentDays: 180,
  delegationGrantDays: 90,
} as const;

const REFERENDUM_THRESHOLD_DEFAULTS = {
  minimumSupporters: 2,
  minimumSupportersPct: 0.1,
} as const;

const TAXONOMY_DEFAULT = [
  'values',
  'risk',
  'equity',
  'feasibility',
  'relational',
  'temporal',
] as const;

// ─── Schemas ───────────────────────────────────────────────────────────────

export const DeliberationFloorsSchema = z
  .object({
    standardIssueHours: z.number().min(48),
    tier2AmendmentDays: z.number().min(7),
    tier1AmendmentDays: z.number().min(14),
    decisionMethodChangeDays: z.number().min(7),
  })
  .strict();

export const QuorumThresholdsSchema = z
  .object({
    awarenessPct: z.number().min(0.25).max(1),
    participationPct: z.number().min(0.1).max(1),
    deliberationHours: z.number().min(48),
    extensionMultiplier: z.number().min(1.25).max(2),
  })
  .strict();

export const RateLimitsSchema = z
  .object({
    createIssuePerDay: z.number().int().min(1).max(3),
    initiateReferendumPerRollingWeek: z.number().int().min(1).max(1),
  })
  .strict();

export const StabilityPeriodSchema = z
  .object({
    standardIssueDays: z.number().min(30),
    policyChangeDays: z.number().min(60),
    constitutionalAmendmentDays: z.number().min(90),
    delegationGrantDays: z.number().min(30),
  })
  .strict();

export const ReferendumThresholdSchema = z
  .object({
    minimumSupporters: z.number().int().min(2),
    minimumSupportersPct: z.number().min(0.05).max(0.5),
  })
  .strict();

export const GovernanceProfileSchema = z
  .object({
    version: z.literal(1).default(1),
    decisionMethodDefault: z.enum(['consent']).default('consent'),
    deliberation: DeliberationFloorsSchema.default(DELIBERATION_DEFAULTS),
    quorum: QuorumThresholdsSchema.default(QUORUM_DEFAULTS),
    rateLimits: RateLimitsSchema.default(RATE_LIMIT_DEFAULTS),
    stability: StabilityPeriodSchema.default(STABILITY_DEFAULTS),
    referendumThreshold: ReferendumThresholdSchema.default(REFERENDUM_THRESHOLD_DEFAULTS),
    taxonomyVocabulary: z.array(z.string().min(1).max(60)).default([...TAXONOMY_DEFAULT]),
    scopeTagVocabulary: z.array(z.string().min(1).max(60)).default([]),
  })
  .strict();

export type GovernanceProfile = z.infer<typeof GovernanceProfileSchema>;

/** The default profile applied to every new Space. */
export const DEFAULT_GOVERNANCE_PROFILE: GovernanceProfile = GovernanceProfileSchema.parse({});

/**
 * Merge a partial (stored) profile with the defaults. Missing keys fall back
 * to defaults; extra keys are stripped by `.strict()`. Returns a fully
 * populated profile the service layer can read without nullish guards.
 */
export function resolveGovernanceProfile(stored: unknown): GovernanceProfile {
  const parsed = GovernanceProfileSchema.safeParse(stored ?? {});
  if (parsed.success) return parsed.data;
  // A malformed profile means something bypassed the governance-Issue
  // pipeline. Fall back to safe defaults rather than throwing during render.
  return DEFAULT_GOVERNANCE_PROFILE;
}
