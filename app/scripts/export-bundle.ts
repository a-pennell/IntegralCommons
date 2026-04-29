#!/usr/bin/env tsx
/**
 * CLI dry-run for space-wide export.
 *
 * Usage:
 *   DATABASE_URL=postgres://... pnpm tsx scripts/export-bundle.ts \
 *     --space-id <ULID> \
 *     --member-id <ULID> \
 *     --dr-id <ULID>
 *
 * Writes the bundle to stdout (uncompressed JSON) for inspection.
 * Does NOT write to storage — this is purely diagnostic.
 */

import { parseArgs } from 'node:util';
import { buildSpaceWideBundle, buildOwnDataBundle } from '../src/server/export/index.ts';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'space-id': { type: 'string' },
    'member-id': { type: 'string' },
    'dr-id': { type: 'string' },
    'own-data': { type: 'boolean', default: false },
  },
});

async function main() {
  const memberId = values['member-id'];
  const spaceId = values['space-id'];

  if (!memberId) {
    process.stderr.write('--member-id is required\n');
    process.exit(1);
  }

  if (values['own-data']) {
    const result = await buildOwnDataBundle({ memberId, ...(spaceId ? { spaceId } : {}) });
    if (!result.ok) {
      process.stderr.write(`Export failed: ${JSON.stringify(result.error)}\n`);
      process.exit(1);
    }
    process.stdout.write(JSON.stringify(result.value, null, 2) + '\n');
    return;
  }

  const drId = values['dr-id'];
  if (!spaceId || !drId) {
    process.stderr.write('Space-wide export requires --space-id and --dr-id (or use --own-data)\n');
    process.exit(1);
  }

  const result = await buildSpaceWideBundle({
    spaceId,
    requestingMemberId: memberId,
    authorizingDecisionRecordId: drId,
  });

  if (!result.ok) {
    process.stderr.write(`Export failed: ${JSON.stringify(result.error)}\n`);
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(result.value, null, 2) + '\n');
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
