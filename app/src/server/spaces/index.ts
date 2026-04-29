/**
 * Spaces module public surface. Cross-module callers import from here.
 */

export { createSpace } from './create.ts';
export type { CreateSpaceInput, CreateSpaceOk } from './create.ts';

export { inviteMember } from './invite.ts';
export type { InviteMemberInput, InviteMemberOk } from './invite.ts';

export { acceptInvitation } from './accept-invitation.ts';
export type { AcceptInvitationInput, AcceptInvitationOk } from './accept-invitation.ts';

export { getSpaceBySlugForMember, getSpaceByIdForMember, type SpaceWithMembership } from './get.ts';

export { listSpacesForMember } from './list-for-member.ts';

export {
  ensureBootstrapIssue,
  completeBootstrapIfApplicable,
  type EnsureBootstrapIssueInput,
  type EnsureBootstrapIssueOk,
} from './bootstrap.ts';

export { setDigestCadence } from './set-digest-cadence.ts';
