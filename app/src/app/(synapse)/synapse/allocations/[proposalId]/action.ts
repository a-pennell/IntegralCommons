'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { respondToConsent } from '@/server/synapse';

const Schema = z.object({
  proposalId: z.string().min(1),
  consentId: z.string().min(1),
  status: z.enum(['consented', 'rejected']),
  notes: z.string().max(500).optional(),
});

export async function respondToConsentAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({
    proposalId: formData.get('proposalId'),
    consentId: formData.get('consentId'),
    status: formData.get('status'),
    notes: formData.get('notes') || undefined,
  });
  if (!parsed.success) redirect('/synapse/allocations');

  const { proposalId, consentId, status, notes } = parsed.data;

  await respondToConsent({
    consentId,
    memberId: session.value.memberId,
    status,
    ...(notes ? { notes } : {}),
  });

  redirect(`/synapse/allocations/${proposalId}`);
}
