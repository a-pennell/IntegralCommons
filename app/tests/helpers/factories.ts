import { ulid } from '@/lib/ulid';
import type { NewIssue, NewMember, NewMembership, NewSpace } from '@/db/schema';

/**
 * Deterministic factories for integration + constitutional tests.
 *
 * Two kinds of sources:
 *   - `make*()` — hand-written fixtures with reasonable defaults, overridable
 *     via a partial. Good for "given a Space, when the founder invites…" tests.
 *   - (Phase 2) faker-based arbitraries — introduced if/when property tests are
 *     added. Not used in Phase 1.
 */

let counter = 0;
const next = () => ++counter;

export function makeMember(overrides: Partial<NewMember> = {}): NewMember {
  const n = next();
  return {
    id: ulid(),
    email: `member${n}@example.test`,
    displayName: `Member ${n}`,
    ...overrides,
  };
}

export function makeSpace(overrides: Partial<NewSpace> = {}): NewSpace {
  const n = next();
  return {
    id: ulid(),
    name: `Test Space ${n}`,
    slug: `test-space-${n}`,
    ...overrides,
  };
}

export function makeMembership(
  spaceId: string,
  memberId: string,
  overrides: Partial<NewMembership> = {},
): NewMembership {
  return {
    id: ulid(),
    spaceId,
    memberId,
    status: 'active',
    ...overrides,
  };
}

export function makeIssue(
  spaceId: string,
  createdByMemberId: string,
  overrides: Partial<NewIssue> = {},
): NewIssue {
  const n = next();
  return {
    id: ulid(),
    spaceId,
    createdByMemberId,
    title: `Test Issue ${n}`,
    slug: `test-issue-${n}`,
    scope: `Scope for test issue ${n}`,
    status: 'open',
    ...overrides,
  };
}

/** Reset the counter between tests if you want deterministic names. */
export function resetFactoryCounter(): void {
  counter = 0;
}
