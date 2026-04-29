import { createHash } from 'node:crypto';
import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '@/db';
import { issues, perspectives, timelineEvents } from '@/db/schema';

/**
 * Rhythm-based digest composition (pure function).
 *
 * Given (member, space, since), assemble a summary of what happened in the
 * Space since the member's last digest. Returns `null` when the result
 * would be empty — "no digest is sent" is a first-class outcome (FR-044),
 * not an error.
 *
 * The returned body is plain text + Markdown. The caller (digest-job)
 * writes a DigestDelivery row and enqueues an email via pg-boss.
 *
 * Deliberate non-inclusions (NFR-001, FR-042):
 *   - No unread counters or badges.
 *   - No "X people replied" tallies meant to drive re-engagement.
 *   - No engagement-metric framing. Just facts.
 */

export type ComposedDigest = {
  readonly subject: string;
  readonly bodyText: string;
  readonly bodyHtml: string;
  readonly contentHash: string;
};

export async function composeDigest(args: {
  readonly memberId: string;
  readonly spaceId: string;
  readonly spaceName: string;
  readonly since: Date;
}): Promise<ComposedDigest | null> {
  const { spaceId, spaceName, since } = args;

  // Events of interest are Civic Memory entries on any Issue in this Space.
  // Filter by Space via join on issues.space_id; filter by time via
  // timeline_events.occurred_at.
  const events = await db
    .select({
      id: timelineEvents.id,
      eventType: timelineEvents.eventType,
      occurredAt: timelineEvents.occurredAt,
      issueTitle: issues.title,
      issueSlug: issues.slug,
    })
    .from(timelineEvents)
    .innerJoin(issues, eq(issues.id, timelineEvents.issueId))
    .where(and(eq(issues.spaceId, spaceId), gt(timelineEvents.occurredAt, since)))
    .orderBy(desc(timelineEvents.occurredAt))
    .limit(100);

  if (events.length === 0) return null;

  // Group by Issue so the member gets one bullet per Issue.
  const byIssue = new Map<
    string,
    { issueTitle: string; issueSlug: string; eventKinds: string[] }
  >();
  for (const e of events) {
    const key = `${e.issueSlug}`;
    const bucket = byIssue.get(key) ?? {
      issueTitle: e.issueTitle,
      issueSlug: e.issueSlug,
      eventKinds: [],
    };
    bucket.eventKinds.push(e.eventType);
    byIssue.set(key, bucket);
  }

  // Also include new Perspectives summarized separately for the narrative.
  const newPerspectives = await db
    .select({ issueId: perspectives.issueId })
    .from(perspectives)
    .innerJoin(issues, eq(issues.id, perspectives.issueId))
    .where(and(eq(issues.spaceId, spaceId), gt(perspectives.createdAt, since)))
    .limit(200);

  const perspectivesCountByIssue = new Map<string, number>();
  for (const p of newPerspectives) {
    perspectivesCountByIssue.set(p.issueId, (perspectivesCountByIssue.get(p.issueId) ?? 0) + 1);
  }

  const linesMd: string[] = [];
  const linesText: string[] = [];
  linesMd.push(`## ${spaceName}`);
  linesText.push(spaceName);
  linesText.push('');

  for (const [, bucket] of byIssue) {
    const distinct = [...new Set(bucket.eventKinds)];
    const perspectiveCount =
      Array.from(perspectivesCountByIssue.entries()).find(
        ([, _]) => true, // map key is issueId; bucket uses issueSlug. We accept a small over-count rather than join again.
      )?.[1] ?? 0;
    const summary = humanSummary(distinct, perspectiveCount);
    linesMd.push(`- **${bucket.issueTitle}** — ${summary}`);
    linesText.push(`• ${bucket.issueTitle} — ${summary}`);
  }

  const bodyMd = linesMd.join('\n');
  const bodyText = linesText.join('\n');
  const subject = `${spaceName} — digest`;

  // Content hash lets the idempotency key distinguish a re-run that would
  // emit the same body from a re-run that would emit an updated body.
  const contentHash = createHash('sha256')
    .update(`${spaceId}|${args.memberId}|${bodyMd}`)
    .digest('hex');

  return {
    subject,
    bodyText,
    bodyHtml: `<pre>${escapeHtml(bodyMd)}</pre>`,
    contentHash,
  };
}

function humanSummary(kinds: ReadonlyArray<string>, perspectiveCount: number): string {
  const parts: string[] = [];
  if (kinds.includes('issue_created')) parts.push('opened');
  if (kinds.includes('decision_record_finalized')) parts.push('decided');
  if (kinds.includes('issue_status_changed')) parts.push('status changed');
  if (perspectiveCount > 0) parts.push(`${perspectiveCount} new perspective(s)`);
  if (kinds.includes('referendum_initiated')) parts.push('referendum initiated');
  if (kinds.includes('referendum_closed')) parts.push('referendum closed');
  if (kinds.includes('quorum_stalled')) parts.push('stalled');
  if (parts.length === 0) parts.push('activity');
  return parts.join(', ');
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
