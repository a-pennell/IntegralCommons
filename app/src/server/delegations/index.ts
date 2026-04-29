/**
 * Delegations module public surface.
 *
 * Satisfies FR-027 through FR-030 + CR-005. The absence of any
 * `irrevocable`-setter is the structural CR-005 enforcement: there is no
 * column, no API, no path.
 */

export { grantDelegation, type GrantDelegationInput, type GrantDelegationOk } from './grant.ts';

export { revokeDelegation, type RevokeDelegationInput } from './revoke.ts';

export { findActiveDelegations, memberHoldsCapability } from './holder-for.ts';

export { listDelegationsForSpace, type DelegationWithGrantee } from './list.ts';
