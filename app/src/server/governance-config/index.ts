/**
 * Governance-config module public surface.
 *
 * Reads resolve stored JSONB into a fully populated {@link GovernanceProfile}.
 * Writes are not exposed here — every profile change must route through a
 * governance Issue + Decision Record (FR-053). See `governance-config/apply-change.ts`
 * (T178) for the finalize-hook pathway.
 */

export {
  DEFAULT_GOVERNANCE_PROFILE,
  GovernanceProfileSchema,
  resolveGovernanceProfile,
  type GovernanceProfile,
} from './schema.ts';

export { resolveScopeTags } from './resolve-scope-tags.ts';
export {
  proposeGovernanceChange,
  type GovernanceChangeSections,
  type ProfileDiff,
} from './propose-change.ts';
export { applyGovernanceChangeIfNeeded, type ApplyChangeResult } from './apply-change.ts';
