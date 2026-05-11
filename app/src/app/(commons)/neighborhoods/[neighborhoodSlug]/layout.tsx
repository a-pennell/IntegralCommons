import { notFound, redirect } from 'next/navigation';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { members, neighborhoodMemberships } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { getNeighborhoodBySlugForMember } from '@/server/neighborhoods';
import { CommonsShellRoot } from '@/components/commons-shell/commons-shell-root';

type RouteParams = { neighborhoodSlug: string };

export default async function CommonsShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<RouteParams>;
}) {
  const { neighborhoodSlug } = await params;

  const session = await requireSession();
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/neighborhoods/${neighborhoodSlug}`)}`);
  }

  const result = await getNeighborhoodBySlugForMember(neighborhoodSlug, session.value.memberId);
  if (!result) notFound();

  const [memberRow] = await db
    .select({ email: members.email, displayName: members.displayName })
    .from(members)
    .where(eq(members.id, session.value.memberId))
    .limit(1);

  const [{ value: memberCount = 0 } = { value: 0 }] = await db
    .select({ value: count() })
    .from(neighborhoodMemberships)
    .where(eq(neighborhoodMemberships.neighborhoodId, result.neighborhood.id));

  const memberHandle = handleFor(memberRow?.email ?? '', memberRow?.displayName ?? null);
  const memberInitials = initialsFor(memberRow?.email ?? '', memberRow?.displayName ?? null);

  return (
    <CommonsShellRoot
      neighborhoodName={result.neighborhood.name}
      neighborhoodSlug={result.neighborhood.slug}
      memberCount={memberCount}
      memberHandle={memberHandle}
      memberInitials={memberInitials}
    >
      {children}
    </CommonsShellRoot>
  );
}

function handleFor(email: string, displayName: string | null): string {
  if (displayName) {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }
  return (
    email
      .split('@')[0]
      ?.replace(/[^a-z0-9]+/gi, '_')
      .toLowerCase() ?? 'member'
  );
}

function initialsFor(email: string, displayName: string | null): string {
  const source = displayName ?? email.split('@')[0] ?? '';
  const parts = source.split(/[^a-zA-Z]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return 'LC';
}
