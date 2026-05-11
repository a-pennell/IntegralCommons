'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getProducerByMember, createDeclaration } from '@/server/synapse';
import type { SurplusShortageDeclaration } from '@/db/schema';

const RESOURCE_TYPES: SurplusShortageDeclaration['resourceType'][] = [
  'vegetables',
  'fruit',
  'grains',
  'legumes',
  'herbs',
  'dairy',
  'eggs',
  'meat',
  'honey',
  'seeds',
  'other',
];

const EXCHANGE_TERMS = ['free', 'exchange', 'cost_recovery'] as const;

const Schema = z.object({
  kind: z.enum(['surplus', 'shortage']),
  resourceType: z.enum(
    RESOURCE_TYPES as [
      SurplusShortageDeclaration['resourceType'],
      ...SurplusShortageDeclaration['resourceType'][],
    ],
  ),
  resourceDetail: z.string().max(200).optional(),
  quantity: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  unit: z.string().max(30).optional(),
  availableFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  availableUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  locationDescription: z.string().max(300).optional(),
  exchangeTerms: z.enum(EXCHANGE_TERMS),
  conditions: z.string().max(1000).optional(),
});

export async function createDeclarationAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const producer = await getProducerByMember(session.value.memberId);
  if (!producer) redirect('/synapse/producers/new');

  const parsed = Schema.safeParse({
    kind: formData.get('kind'),
    resourceType: formData.get('resourceType'),
    resourceDetail: formData.get('resourceDetail') || undefined,
    quantity: formData.get('quantity') || undefined,
    unit: formData.get('unit') || undefined,
    availableFrom: formData.get('availableFrom'),
    availableUntil: formData.get('availableUntil') || undefined,
    locationDescription: formData.get('locationDescription') || undefined,
    exchangeTerms: formData.get('exchangeTerms'),
    conditions: formData.get('conditions') || undefined,
  });
  if (!parsed.success) redirect('?error=invalid');

  const {
    kind,
    resourceType,
    availableFrom,
    exchangeTerms,
    resourceDetail,
    quantity,
    unit,
    availableUntil,
    locationDescription,
    conditions,
  } = parsed.data;

  const result = await createDeclaration({
    producerId: producer.id,
    kind,
    resourceType,
    availableFrom,
    exchangeTerms,
    ...(resourceDetail ? { resourceDetail } : {}),
    ...(quantity ? { quantity } : {}),
    ...(unit ? { unit } : {}),
    ...(availableUntil ? { availableUntil } : {}),
    ...(locationDescription ? { locationDescription } : {}),
    ...(conditions ? { conditions } : {}),
  });
  if (!result.ok) redirect('?error=failed');
  redirect(`/synapse/declarations/${result.value.declarationId}`);
}
