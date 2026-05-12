'use server';

import { redirect } from 'next/navigation';
import { requireSession } from '@/server/auth';
import { clearSessionCookie } from '@/server/auth';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function signOutAction(): Promise<void> {
  const session = await requireSession();
  if (!session.ok) redirect('/login');

  // Delete the session row and clear the cookie.
  await db.delete(sessions).where(eq(sessions.id, session.value.id));
  await clearSessionCookie();
  redirect('/login');
}
