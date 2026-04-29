/**
 * Referenda module public surface.
 *
 * Lifecycle: initiating → deliberating → voting → closed.
 * CR-006 (bounded), CR-008 (temporal stability), CR-010 (deliberation first),
 * CR-001 (subject-cannot-vote-on-own-removal) are all enforced here.
 */

export {
  initiateReferendum,
  type InitiateReferendumInput,
  type InitiateReferendumOk,
} from './initiate.ts';

export { supportReferendum } from './support.ts';
export { startReferendumVoting } from './start-voting.ts';
export { castVote, type VoteChoice } from './cast-vote.ts';
export { closeReferendum, type CloseReferendumOutcome } from './close.ts';

export { getReferendum, listReferendaForSpace, listSupporters, listVotes } from './get.ts';
