/**
 * Export module public surface.
 *
 * Two paths (FR-050, FR-051):
 *   1. Own-data — always available; no gating; CR-002 guarantee.
 *   2. Space-wide — requires a finalized Decision Record authorizing the export.
 *
 * `writeBundle` is re-exported for the CLI script (scripts/export-bundle.ts).
 */

export { buildOwnDataBundle, type OwnDataExportInput, type OwnDataBundle } from './own-data.ts';
export {
  buildSpaceWideBundle,
  type SpaceWideExportInput,
  type SpaceWideBundle,
} from './space-wide.ts';
export { writeBundle, type BundleResult } from './bundle.ts';
