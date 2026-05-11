'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlug, getMembershipForNeighborhood } from '@/server/neighborhoods';
import { createResource } from '@/server/resources';
import { createNeedOffer } from '@/server/needs-offers';
import { parseCsv } from '@/lib/csv';

const RESOURCE_KINDS = ['tool', 'space', 'skill', 'material', 'other'] as const;
type ResourceKind = (typeof RESOURCE_KINDS)[number];

function normalizeKind(raw: string): ResourceKind {
  const v = raw.toLowerCase().trim() as ResourceKind;
  return RESOURCE_KINDS.includes(v) ? v : 'other';
}

/**
 * Import resources from a pasted CSV.
 * Expected headers (case-insensitive): type | kind, title, description, steward, availability
 * Rows with no title are skipped.
 */
export async function importResourcesAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/neighborhoods');

  const neighborhoodSlug = String(formData.get('neighborhoodSlug') ?? '');
  const csvText = String(formData.get('csv') ?? '');

  if (!neighborhoodSlug || !csvText.trim()) redirect(`/neighborhoods/${neighborhoodSlug}/import`);

  const neighborhood = await getNeighborhoodBySlug(neighborhoodSlug);
  if (!neighborhood) redirect('/neighborhoods');

  const membership = await getMembershipForNeighborhood(neighborhood.id, session.value.memberId);
  if (!membership || membership.leftAt || membership.role !== 'steward') {
    redirect(`/neighborhoods/${neighborhoodSlug}/import?error=not_steward`);
  }

  const rows = parseCsv(csvText);
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = (row['title'] ?? '').trim();
    if (!title) {
      skipped++;
      continue;
    }
    const kind = normalizeKind(row['type'] ?? row['kind'] ?? 'other');
    const description = (row['description'] ?? '').trim();
    const locationHint = (row['steward'] ?? row['location'] ?? '').trim() || undefined;

    const result = await createResource({
      neighborhoodId: neighborhood.id,
      offeredByMemberId: session.value.memberId,
      title,
      kind,
      ...(description ? { description } : {}),
      ...(locationHint ? { locationHint } : {}),
    });

    if (result.ok) imported++;
    else skipped++;
  }

  redirect(
    `/neighborhoods/${neighborhoodSlug}/import?tab=resources&imported=${imported}&skipped=${skipped}`,
  );
}

/**
 * Import needs from a pasted CSV.
 * Expected headers (case-insensitive): title, body | description, urgent | is_urgent,
 *   expires_at | deadline
 */
export async function importNeedsAction(formData: FormData): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/neighborhoods');

  const neighborhoodSlug = String(formData.get('neighborhoodSlug') ?? '');
  const csvText = String(formData.get('csv') ?? '');

  if (!neighborhoodSlug || !csvText.trim()) redirect(`/neighborhoods/${neighborhoodSlug}/import`);

  const neighborhood = await getNeighborhoodBySlug(neighborhoodSlug);
  if (!neighborhood) redirect('/neighborhoods');

  const membership = await getMembershipForNeighborhood(neighborhood.id, session.value.memberId);
  if (!membership || membership.leftAt || membership.role !== 'steward') {
    redirect(`/neighborhoods/${neighborhoodSlug}/import?error=not_steward`);
  }

  const rows = parseCsv(csvText);
  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const title = (row['title'] ?? '').trim();
    if (!title) {
      skipped++;
      continue;
    }

    const body = (row['body'] ?? row['description'] ?? '').trim();
    const urgentRaw = (row['urgent'] ?? row['is_urgent'] ?? '').toLowerCase();
    const isUrgent = urgentRaw === 'true' || urgentRaw === 'yes' || urgentRaw === '1';
    const deadlineRaw = (row['expires_at'] ?? row['deadline'] ?? '').trim();
    const expiresAt = deadlineRaw ? new Date(deadlineRaw) : undefined;
    const validExpiry =
      expiresAt && !isNaN(expiresAt.getTime()) && expiresAt > new Date() ? expiresAt : undefined;

    const result = await createNeedOffer({
      neighborhoodId: neighborhood.id,
      postedByMemberId: session.value.memberId,
      type: 'need',
      title,
      ...(body ? { body } : {}),
      isUrgent,
      ...(validExpiry ? { expiresAt: validExpiry } : {}),
    });

    if (result.ok) imported++;
    else skipped++;
  }

  redirect(
    `/neighborhoods/${neighborhoodSlug}/import?tab=needs&imported=${imported}&skipped=${skipped}`,
  );
}
