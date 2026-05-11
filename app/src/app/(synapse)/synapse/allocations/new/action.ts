'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getDeclarationById, createProposal } from '@/server/synapse';

const Schema = z.object({
  surplusDeclarationId: z.string().min(1),
  shortageDeclarationId: z.string().min(1).optional(),
  quantity: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  notes: z.string().max(1000).optional(),
});

export async function createProposalAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    surplusDeclarationId: formData.get('surplusDeclarationId'),
    shortageDeclarationId: formData.get('shortageDeclarationId') || undefined,
    quantity: formData.get('quantity') || undefined,
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) redirect('/synapse/allocations/new?error=invalid');

  const { surplusDeclarationId, shortageDeclarationId, quantity, notes } = parsed.data;

  const surplusDecl = await getDeclarationById(surplusDeclarationId);
  if (!surplusDecl || surplusDecl.status !== 'active') {
    redirect('/synapse/declarations');
  }

  const result = await createProposal({
    proposedByMemberId: session.value.memberId,
    surplusDeclarationId,
    ...(shortageDeclarationId ? { shortageDeclarationId } : {}),
    ...(quantity ? { quantity } : {}),
    ...(notes ? { notes } : {}),
    producerMemberId: surplusDecl.producer.managedByMemberId,
  });

  if (!result.ok) redirect('/synapse/allocations/new?error=failed');
  redirect(`/synapse/allocations/${result.value.proposalId}`);
}
