'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getDeclarationById, withdrawDeclaration } from '@/server/synapse';

const Schema = z.object({ declarationId: z.string().min(1) });

export async function withdrawDeclarationAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const parsed = Schema.safeParse({ declarationId: formData.get('declarationId') });
  if (!parsed.success) redirect('/synapse/declarations');

  const { declarationId } = parsed.data;
  const declaration = await getDeclarationById(declarationId);
  if (!declaration) redirect('/synapse/declarations');
  if (declaration.producer.managedByMemberId !== session.value.memberId) {
    redirect('/synapse/declarations');
  }

  await withdrawDeclaration(declarationId);
  redirect('/synapse/declarations');
}
