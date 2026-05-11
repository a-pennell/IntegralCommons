'use server';

import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { clearSessionCookie } from '@/server/auth';
import { deleteAccount } from '@/server/members';

export async function deleteAccountAction(): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  const result = await deleteAccount(session.value.memberId);
  if (!result.ok) redirect('/account/delete?error=failed');

  // Clear the session cookie — the session rows were deleted server-side.
  await clearSessionCookie();
  redirect('/login?deleted=true');
}
