import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { members, perspectives } from '@/db/schema';
import type { Perspective } from '@/db/schema';

/**
 * Read Perspectives for an Issue, grouped by taxonomy then parent→child.
 *
 * Returns an ordered list where each top-level Perspective is immediately
 * followed by its (one-level) replies, sorted by `createdAt asc`. The
 * grouping-by-taxonomy rendering is a UI concern — this helper just supplies
 * the resolved rows + author display names for the view layer.
 */

export type PerspectiveWithAuthor = Perspective & {
  readonly authorDisplayName: string | null;
};

export async function listPerspectivesForIssue(
  issueId: string,
): Promise<ReadonlyArray<PerspectiveWithAuthor>> {
  // Load all perspectives on the Issue in a single query so child → parent
  // linkage is resolved in memory.
  const rows = await db
    .select({ p: perspectives, displayName: members.displayName })
    .from(perspectives)
    .innerJoin(members, eq(members.id, perspectives.authorId))
    .where(eq(perspectives.issueId, issueId))
    .orderBy(asc(perspectives.createdAt));

  const byId = new Map<string, PerspectiveWithAuthor>();
  const roots: PerspectiveWithAuthor[] = [];
  const childrenOf = new Map<string, PerspectiveWithAuthor[]>();

  for (const { p, displayName } of rows) {
    const withAuthor: PerspectiveWithAuthor = { ...p, authorDisplayName: displayName };
    byId.set(p.id, withAuthor);
    if (p.parentPerspectiveId === null) {
      roots.push(withAuthor);
    } else {
      const bucket = childrenOf.get(p.parentPerspectiveId) ?? [];
      bucket.push(withAuthor);
      childrenOf.set(p.parentPerspectiveId, bucket);
    }
  }

  // Flatten root-then-children; ordering within each group is already ascending.
  const out: PerspectiveWithAuthor[] = [];
  for (const root of roots) {
    out.push(root);
    for (const child of childrenOf.get(root.id) ?? []) out.push(child);
  }
  // Any children whose parent is missing (shouldn't happen given FK) land at
  // the end to avoid dropping rows silently.
  const seen = new Set(out.map((p) => p.id));
  for (const row of rows) {
    if (!seen.has(row.p.id)) {
      out.push(byId.get(row.p.id) as PerspectiveWithAuthor);
    }
  }
  return out;
}
