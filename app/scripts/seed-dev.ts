#!/usr/bin/env tsx
/**
 * Deterministic development seed for demos and Playwright E2E.
 *
 * Hand-written rather than faker-based: we want the same rows every run so
 * screenshots, URLs, and story walkthroughs are reproducible. Faker-based
 * arbitraries (for property tests) are a Phase 2 addition per plan Open
 * Question #4.
 *
 * Run with: pnpm -F app tsx scripts/seed-dev.ts
 */

import { db } from '@/db';
import { members, memberships, spaces } from '@/db/schema';
import { ulid } from '@/lib/ulid';

async function main(): Promise<void> {
  // The IDs are intentionally NOT fixed strings — ULIDs are time-sortable and
  // seeded on each run, but the *shape* of the dataset is stable.
  const founderId = ulid();
  const alexId = ulid();
  const blairId = ulid();
  const spaceId = ulid();

  await db.insert(members).values([
    { id: founderId, email: 'founder@commonground.test', displayName: 'Founder' },
    { id: alexId, email: 'alex@commonground.test', displayName: 'Alex' },
    { id: blairId, email: 'blair@commonground.test', displayName: 'Blair' },
  ]);

  await db.insert(spaces).values({
    id: spaceId,
    name: 'Neighborhood Cooperative',
    slug: 'neighborhood-coop',
    description: 'A small cooperative deliberating about shared space and resources.',
  });

  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: founderId, status: 'active' },
    { id: ulid(), spaceId, memberId: alexId, status: 'active' },
    { id: ulid(), spaceId, memberId: blairId, status: 'active' },
  ]);

  console.log(`seeded space=${spaceId} founder=${founderId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
