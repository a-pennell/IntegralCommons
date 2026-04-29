/**
 * Digest module public surface.
 *
 * The only push channel from CommonGround to its members (FR-042). Cadence
 * is configurable per-member (lower than Space default, down to "off"); the
 * scheduled job is the one place digests originate.
 */

export { composeDigest, type ComposedDigest } from './compose.ts';
