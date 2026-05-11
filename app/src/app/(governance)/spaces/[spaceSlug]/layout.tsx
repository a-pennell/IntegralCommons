import { notFound, redirect } from 'next/navigation';
import { count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { members, memberships } from '@/db/schema';
import { requireSession } from '@/server/auth';
import { getSpaceBySlugForMember } from '@/server/spaces';
import { ShellRoot } from '@/components/shell/shell-root';

type RouteParams = { spaceSlug: string };

/**
 * Shell layout for any /spaces/[spaceSlug]/** route.
 *
 * Resolves all shell data (current member, current space, member count)
 * once here so child pages don't re-query. Hands off to ShellRoot — a
 * client component that coordinates the persistent sidebar, topbar, and
 * mobile drawer state.
 */
export default async function SpaceShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<RouteParams>;
}) {
  const { spaceSlug } = await params;

  const session = await requireSession();
  if (!session.ok) {
    redirect(`/login?next=${encodeURIComponent(`/spaces/${spaceSlug}`)}`);
  }

  const result = await getSpaceBySlugForMember(spaceSlug, session.value.memberId);
  if (!result) notFound();

  const [memberRow] = await db
    .select({ email: members.email, displayName: members.displayName })
    .from(members)
    .where(eq(members.id, session.value.memberId))
    .limit(1);

  const [{ value: memberCount = 0 } = { value: 0 }] = await db
    .select({ value: count() })
    .from(memberships)
    .where(eq(memberships.spaceId, result.space.id));

  const memberHandle = handleFor(memberRow?.email ?? '', memberRow?.displayName ?? null);
  const memberInitials = initialsFor(memberRow?.email ?? '', memberRow?.displayName ?? null);

  return (
    <ShellRoot
      spaceName={result.space.name}
      spaceSlug={result.space.slug}
      memberCount={memberCount}
      convening={result.space.bootstrapCompletedAt ? 'in_session' : 'in_recess'}
      memberHandle={memberHandle}
      memberInitials={memberInitials}
    >
      {children}
    </ShellRoot>
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
  return 'CG';
}
