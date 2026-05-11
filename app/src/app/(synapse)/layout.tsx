import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { members } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { SynapseShellRoot } from '@/components/synapse-shell/synapse-shell-root';

export default async function SynapseLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  if (!session.ok) redirect('/login?next=/synapse');

  const [memberRow] = await db
    .select({ email: members.email, displayName: members.displayName })
    .from(members)
    .where(eq(members.id, session.value.memberId))
    .limit(1);

  const handle = handleFor(memberRow?.email ?? '', memberRow?.displayName ?? null);
  const initials = initialsFor(memberRow?.email ?? '', memberRow?.displayName ?? null);

  return (
    <SynapseShellRoot memberHandle={handle} memberInitials={initials}>
      {children}
    </SynapseShellRoot>
  );
}

function handleFor(email: string, displayName: string | null): string {
  if (displayName) {
    return displayName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }
  return email.split('@')[0]?.replace(/[^a-z0-9]+/gi, '_').toLowerCase() ?? 'member';
}

function initialsFor(email: string, displayName: string | null): string {
  const source = displayName ?? email.split('@')[0] ?? '';
  const parts = source.split(/[^a-zA-Z]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return 'SY';
}
