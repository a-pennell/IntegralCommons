import type { GovernanceProfile } from './schema.ts';

/**
 * Produce a human-readable diff between two governance profiles (FR-053).
 *
 * The diff is embedded as structured metadata in the governance-change Issue's
 * `structured_sections` field so the deliberation has a concrete, reviewable
 * proposal attached. This is a pure function — it makes no database writes.
 *
 * The diff shows every key that changed, with before/after values. Unchanged
 * keys are omitted to keep the proposal legible.
 */

export type ProfileDiff = {
  readonly key: string;
  readonly before: unknown;
  readonly after: unknown;
};

export type GovernanceChangeSections = {
  readonly proposedProfile: GovernanceProfile;
  readonly diff: ReadonlyArray<ProfileDiff>;
  readonly changeType: 'governance_profile';
};

export function proposeGovernanceChange(args: {
  readonly current: GovernanceProfile;
  readonly proposed: GovernanceProfile;
}): GovernanceChangeSections {
  const diff: ProfileDiff[] = [];

  for (const key of Object.keys(args.proposed) as Array<keyof GovernanceProfile>) {
    const before = args.current[key];
    const after = args.proposed[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      diff.push({ key, before, after });
    }
  }

  return {
    proposedProfile: args.proposed,
    diff,
    changeType: 'governance_profile',
  };
}
