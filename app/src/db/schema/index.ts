/**
 * Schema composition. Drizzle-kit reads this file to generate migrations;
 * the Drizzle client imports it to get the fully-typed `schema` object.
 *
 * Order of exports does not affect migration ordering — drizzle-kit resolves
 * table dependencies from the column `references()` calls.
 *
 * Cross-table invariants that can't be expressed at the ORM level (circular
 * FKs, append-only grants, the issue-status consistency trigger) are
 * declared in `../triggers.sql` and applied post-migration.
 */

export * from '../enums.ts';
export * from './members.ts';
export * from './spaces.ts';
export * from './memberships.ts';
export * from './invitations.ts';
export * from './issues.ts';
export * from './perspectives.ts';
export * from './decision_records.ts';
export * from './delegations.ts';
export * from './referenda.ts';
export * from './quorum_states.ts';
export * from './timeline_events.ts';
export * from './official_summaries.ts';
export * from './rate_limit_buckets.ts';
export * from './auth.ts';
export * from './digest_deliveries.ts';

// ─── Synapse (Flow Engine) ─────────────────────────────────────────────────────
export * from './producers.ts';
export * from './declarations.ts';
export * from './allocation_proposals.ts';

// ─── Local Commons ────────────────────────────────────────────────────────────
export * from './neighborhoods.ts';
export * from './neighborhood_memberships.ts';
export * from './resources.ts';
export * from './needs_offers.ts';
export * from './exchange_requests.ts';
export * from './stewardship_records.ts';
export * from './time_credits.ts';
export * from './commons_charter.ts';
