import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { allocationProposals, allocationConsents, members, surplusShortageDeclarations, producers } from '@/db/schema';
import type { AllocationProposal, AllocationConsent } from '@/db/schema';
import type { Result } from '@/lib/result';
import type { AppError } from '@/lib/errors';
import { errors } from '@/lib/errors';
import { err, ok } from '@/lib/result';
import { ulid } from '@/lib/ulid';

export type ProposalWithDetails = AllocationProposal & {
  proposerDisplayName: string | null;
  surplusProducerName: string;
  surplusResourceType: string;
  consents: AllocationConsent[];
};

export async function listProposals(): Promise<ProposalWithDetails[]> {
  const proposals = await db
    .select()
    .from(allocationProposals)
    .orderBy(desc(allocationProposals.createdAt))
    .limit(100);

  if (proposals.length === 0) return [];

  const proposerIds = [...new Set(proposals.map((p) => p.proposedByMemberId))];
  const declarationIds = [...new Set(proposals.map((p) => p.surplusDeclarationId))];
  const proposalIds = proposals.map((p) => p.id);

  const [proposerRows, declarationRows, consentRows] = await Promise.all([
    db.select({ id: members.id, displayName: members.displayName })
      .from(members)
      .where(eq(members.id, proposerIds[0]!)),
    db.select({
        id: surplusShortageDeclarations.id,
        resourceType: surplusShortageDeclarations.resourceType,
        producerId: surplusShortageDeclarations.producerId,
        orgName: producers.orgName,
      })
      .from(surplusShortageDeclarations)
      .innerJoin(producers, eq(producers.id, surplusShortageDeclarations.producerId))
      .where(eq(surplusShortageDeclarations.id, declarationIds[0]!)),
    db.select().from(allocationConsents)
      .where(eq(allocationConsents.proposalId, proposalIds[0]!)),
  ]);

  const proposerMap = new Map(proposerRows.map((r) => [r.id, r.displayName]));
  const declarationMap = new Map(declarationRows.map((r) => [r.id, r]));
  const consentMap = new Map<string, AllocationConsent[]>();
  for (const c of consentRows) {
    if (!consentMap.has(c.proposalId)) consentMap.set(c.proposalId, []);
    consentMap.get(c.proposalId)!.push(c);
  }

  return proposals.map((p) => {
    const decl = declarationMap.get(p.surplusDeclarationId);
    return {
      ...p,
      proposerDisplayName: proposerMap.get(p.proposedByMemberId) ?? null,
      surplusProducerName: decl?.orgName ?? '',
      surplusResourceType: decl?.resourceType ?? '',
      consents: consentMap.get(p.id) ?? [],
    };
  });
}

export async function getProposalById(
  proposalId: string,
): Promise<ProposalWithDetails | null> {
  const rows = await db
    .select()
    .from(allocationProposals)
    .where(eq(allocationProposals.id, proposalId))
    .limit(1);

  const proposal = rows[0];
  if (!proposal) return null;

  const [proposerRows, declarationRows, consentRows] = await Promise.all([
    db.select({ id: members.id, displayName: members.displayName })
      .from(members)
      .where(eq(members.id, proposal.proposedByMemberId))
      .limit(1),
    db.select({
        id: surplusShortageDeclarations.id,
        resourceType: surplusShortageDeclarations.resourceType,
        producerId: surplusShortageDeclarations.producerId,
        orgName: producers.orgName,
      })
      .from(surplusShortageDeclarations)
      .innerJoin(producers, eq(producers.id, surplusShortageDeclarations.producerId))
      .where(eq(surplusShortageDeclarations.id, proposal.surplusDeclarationId))
      .limit(1),
    db.select().from(allocationConsents).where(eq(allocationConsents.proposalId, proposalId)),
  ]);

  const decl = declarationRows[0];
  return {
    ...proposal,
    proposerDisplayName: proposerRows[0]?.displayName ?? null,
    surplusProducerName: decl?.orgName ?? '',
    surplusResourceType: decl?.resourceType ?? '',
    consents: consentRows,
  };
}

export async function createProposal(args: {
  readonly proposedByMemberId: string;
  readonly surplusDeclarationId: string;
  readonly shortageDeclarationId?: string;
  readonly quantity?: string;
  readonly notes?: string;
  readonly producerMemberId: string;
}): Promise<Result<{ proposalId: string }, AppError>> {
  const proposalId = ulid();

  await db.insert(allocationProposals).values({
    id: proposalId,
    proposedByMemberId: args.proposedByMemberId,
    surplusDeclarationId: args.surplusDeclarationId,
    ...(args.shortageDeclarationId ? { shortageDeclarationId: args.shortageDeclarationId } : {}),
    ...(args.quantity ? { quantity: args.quantity } : {}),
    ...(args.notes ? { notes: args.notes } : {}),
  });

  // Create consent records: one for the surplus producer, one for the proposer's community.
  const surplusConsentId = ulid();
  const communityConsentId = ulid();

  await db.insert(allocationConsents).values([
    {
      id: surplusConsentId,
      proposalId,
      consentingMemberId: args.producerMemberId,
      status: 'pending',
    },
    {
      id: communityConsentId,
      proposalId,
      consentingMemberId: args.proposedByMemberId,
      status: 'pending',
    },
  ]);

  return ok({ proposalId });
}

export async function respondToConsent(args: {
  readonly consentId: string;
  readonly memberId: string;
  readonly status: 'consented' | 'rejected';
  readonly notes?: string;
}): Promise<Result<void, AppError>> {
  const rows = await db
    .select()
    .from(allocationConsents)
    .where(eq(allocationConsents.id, args.consentId))
    .limit(1);

  const consent = rows[0];
  if (!consent) return err(errors.notFound('consent'));
  if (consent.consentingMemberId !== args.memberId) return err(errors.notFound('consent'));
  if (consent.status !== 'pending') return err(errors.conflict('consent', 'Already responded.'));

  await db
    .update(allocationConsents)
    .set({
      status: args.status,
      respondedAt: new Date(),
      updatedAt: new Date(),
      ...(args.notes ? { notes: args.notes } : {}),
    })
    .where(eq(allocationConsents.id, args.consentId));

  // If all consents on this proposal are now 'consented', advance status.
  const allConsents = await db
    .select()
    .from(allocationConsents)
    .where(eq(allocationConsents.proposalId, consent.proposalId));

  const allConsented = allConsents.every((c) =>
    c.id === args.consentId ? args.status === 'consented' : c.status === 'consented',
  );
  const anyRejected = allConsents.some((c) =>
    c.id === args.consentId ? args.status === 'rejected' : c.status === 'rejected',
  );

  if (anyRejected) {
    await db
      .update(allocationProposals)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(allocationProposals.id, consent.proposalId));
  } else if (allConsented) {
    await db
      .update(allocationProposals)
      .set({ status: 'consented', updatedAt: new Date() })
      .where(eq(allocationProposals.id, consent.proposalId));
  }

  return ok(undefined);
}
