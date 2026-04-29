import type { PoolClient } from 'pg';
import type { GovernanceProfile } from '@/server/governance-config';

/**
 * Snapshot quorum thresholds for a new Issue.
 *
 * The thresholds are frozen on Issue creation — later changes to the Space's
 * governance_profile do not retroactively change open Issues' quorum
 * requirements. That invariant matters for CR-008 (temporal stability).
 *
 * Counts are derived from active-Membership count × percentages in the
 * governance profile. A Space with 10 active members and awareness_pct=0.5
 * snapshots awareness_required=5.
 */

export type QuorumSnapshot = {
  readonly awarenessRequired: number;
  readonly participationRequired: number;
  readonly deliberationPeriodEndsAt: Date;
};

export async function snapshotQuorumThresholds(
  client: PoolClient,
  args: {
    readonly spaceId: string;
    readonly profile: GovernanceProfile;
    readonly now?: Date;
  },
): Promise<QuorumSnapshot> {
  const now = args.now ?? new Date();

  const activeCount = await client.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM memberships WHERE space_id = $1 AND status = 'active'`,
    [args.spaceId],
  );
  const active = Number(activeCount.rows[0]?.n ?? 0);

  const awarenessRequired = Math.max(1, Math.ceil(active * args.profile.quorum.awarenessPct));
  const participationRequired = Math.max(
    1,
    Math.ceil(active * args.profile.quorum.participationPct),
  );

  const deliberationPeriodEndsAt = new Date(
    now.getTime() + args.profile.quorum.deliberationHours * 60 * 60 * 1000,
  );

  return { awarenessRequired, participationRequired, deliberationPeriodEndsAt };
}
