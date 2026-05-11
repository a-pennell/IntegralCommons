#!/usr/bin/env tsx
/**
 * Deterministic development seed for demos and Playwright E2E.
 *
 * Hand-written rather than faker-based: we want the same rows every run so
 * screenshots, URLs, and story walkthroughs are reproducible. Faker-based
 * arbitraries (for property tests) are a Phase 2 addition.
 *
 * Run with: pnpm -F app tsx scripts/seed-dev.ts
 *
 * Story arc:
 *   Space — Eastside Commons Co-op (8 members)
 *   Issue 1 — Tool library governance (DECIDED): full arc with perspectives,
 *             delegation, Decision Record, and Civic Memory
 *   Issue 2 — North lot garden expansion (EXPLORING): active deliberation,
 *             facilitation delegation, official summary, good quorum
 *   Issue 3 — Membership fee structure (OPEN): freshly opened, early-stage
 */

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  delegations,
  decisionRecords,
  issues,
  issueViews,
  members,
  memberships,
  officialSummaries,
  perspectives,
  quorumStates,
  spaces,
  timelineEvents,
} from '@/db/schema';
import { ulid } from '@/lib/ulid';

// ---------------------------------------------------------------------------
// IDs — generated once per run; shape is stable, values differ each run
// ---------------------------------------------------------------------------

// Members
const priyaId = ulid(); // founder, space creator
const marcusId = ulid(); // facilitates tool library issue
const sofiaId = ulid(); // raises garden issue
const devonId = ulid(); // facilitates garden issue
const anikaId = ulid(); // raises fee issue
const tomaszId = ulid();
const laylaId = ulid();
const chenId = ulid();

// Space
const spaceId = ulid();

// Issues
const toolIssueId = ulid(); // DECIDED
const gardenIssueId = ulid(); // EXPLORING
const feeIssueId = ulid(); // OPEN

// Decision Record for tool library issue
const toolDrId = ulid();

// Delegations
const toolDelegationId = ulid(); // Marcus facilitates tool issue
const gardenDelegationId = ulid(); // Devon facilitates garden issue

// Perspectives — tool library issue (5)
const p_tool_priya = ulid();
const p_tool_marcus = ulid();
const p_tool_sofia = ulid();
const p_tool_devon = ulid();
const p_tool_tomasz = ulid();
const p_tool_layla_reply = ulid(); // reply to Sofia's risk perspective

// Perspectives — garden issue (6)
const p_garden_anika = ulid();
const p_garden_layla = ulid();
const p_garden_chen = ulid();
const p_garden_marcus = ulid();
const p_garden_priya = ulid();
const p_garden_tomasz = ulid();

// Perspectives — fee issue (2)
const p_fee_anika = ulid();
const p_fee_chen = ulid();

// Official summary
const gardenSummaryId = ulid();

// ---------------------------------------------------------------------------
// Dates — past events anchored to today (2026-05-03)
// ---------------------------------------------------------------------------

const d = (iso: string) => new Date(iso);

async function main(): Promise<void> {
  // -------------------------------------------------------------------------
  // 1. Members
  // -------------------------------------------------------------------------
  await db.insert(members).values([
    { id: priyaId, email: 'priya@eastside.test', displayName: 'Priya Sharma' },
    { id: marcusId, email: 'marcus@eastside.test', displayName: 'Marcus Webb' },
    { id: sofiaId, email: 'sofia@eastside.test', displayName: 'Sofia Reyes' },
    { id: devonId, email: 'devon@eastside.test', displayName: 'Devon Park' },
    { id: anikaId, email: 'anika@eastside.test', displayName: 'Anika Osei' },
    { id: tomaszId, email: 'tomasz@eastside.test', displayName: 'Tomasz Kowalski' },
    { id: laylaId, email: 'layla@eastside.test', displayName: 'Layla Hassan' },
    { id: chenId, email: 'chen@eastside.test', displayName: 'Chen Wei' },
  ]);

  // -------------------------------------------------------------------------
  // 2. Space
  // -------------------------------------------------------------------------
  await db.insert(spaces).values({
    id: spaceId,
    name: 'Eastside Commons Co-op',
    slug: 'eastside-commons',
    description:
      'A neighborhood cooperative deliberating about shared space, resources, and governance on the east side of Millbrook.',
    bootstrapCompletedAt: d('2026-01-15T10:00:00Z'),
    governanceProfile: {
      awarenessQuorumPct: 0.6,
      participationQuorumPct: 0.3,
      deliberationWindowDays: 21,
      decisionMethodDefault: 'consent',
    },
  });

  // -------------------------------------------------------------------------
  // 3. Memberships (all active)
  // -------------------------------------------------------------------------
  await db.insert(memberships).values([
    { id: ulid(), spaceId, memberId: priyaId, status: 'active' },
    { id: ulid(), spaceId, memberId: marcusId, status: 'active' },
    { id: ulid(), spaceId, memberId: sofiaId, status: 'active' },
    { id: ulid(), spaceId, memberId: devonId, status: 'active' },
    { id: ulid(), spaceId, memberId: anikaId, status: 'active' },
    { id: ulid(), spaceId, memberId: tomaszId, status: 'active' },
    { id: ulid(), spaceId, memberId: laylaId, status: 'active' },
    { id: ulid(), spaceId, memberId: chenId, status: 'active' },
  ]);

  // -------------------------------------------------------------------------
  // 4. Issues — inserted with intermediate statuses so we can add DRs
  //    before finalizing the decided issue
  // -------------------------------------------------------------------------

  // Issue 1: Tool library (will be updated to 'decided' after DR is inserted)
  await db.insert(issues).values({
    id: toolIssueId,
    spaceId,
    title: 'How should we govern the shared tool library?',
    slug: 'tool-library-governance',
    scope:
      `Policies for borrowing, returning, maintaining, and expanding the co-op's shared tool collection. Excludes large machinery and vehicles.`,
    status: 'exploring',
    createdByMemberId: priyaId,
    scopeTags: ['tools', 'shared-resources', 'stewardship'],
    structuredSections: {
      framings: [
        'We have accumulated ~40 tools through donations and shared purchases, but access is ad hoc — people text Priya directly, which creates an informal bottleneck.',
        'Some tools have gone missing or come back damaged with no accountability mechanism.',
      ],
      constraints: [
        `No budget for dedicated storage — tools must live in members' homes or the shared shed.`,
        'Not all members are available on the same days for handoffs.',
      ],
      stakeholders: [
        'All 8 current members who borrow tools',
        'Future members who will join after policies are set',
        'Neighbors outside the co-op who sometimes borrow through members',
      ],
      knownFacts: [
        'Priya currently manages all tool requests informally.',
        'Two drills and a circular saw have gone missing in the past year.',
        `Devon does not have a car, making pickup from certain members' homes difficult.`,
      ],
      openQuestions: [
        'Do we want a dedicated tool steward each month, or a rotating schedule?',
        'How do we handle tools that come back damaged?',
        'Should neighbors outside the co-op have access?',
      ],
    },
    decisionMethod: 'consent',
    createdAt: d('2026-02-01T09:00:00Z'),
    updatedAt: d('2026-03-15T14:00:00Z'),
  });

  // Issue 2: Garden (EXPLORING)
  await db.insert(issues).values({
    id: gardenIssueId,
    spaceId,
    title: 'North lot expansion — community garden',
    slug: 'north-lot-garden-expansion',
    scope:
      'Whether and how to expand the existing herb planters to include the vacant north lot adjacent to our building. Includes governance of plot allocation, maintenance expectations, and relationship with the property owner.',
    status: 'exploring',
    createdByMemberId: sofiaId,
    scopeTags: ['garden', 'food', 'land-use', 'commons'],
    reviewDate: '2026-06-15',
    structuredSections: {
      framings: [
        `The north lot has been vacant for two years. We have a verbal indication from the building owner that they'd consider a community garden lease.`,
        'We currently grow herbs in planter boxes — this would be a substantial expansion of scope and commitment.',
      ],
      constraints: [
        `We don't have a formal lease yet — any decision depends on getting one.`,
        'The lot has known drainage issues in the southeast corner.',
        'Some members have limited time availability for regular tending.',
      ],
      stakeholders: [
        'All current co-op members',
        'Neighbors on the block who expressed interest last summer',
        'Building owner (external)',
      ],
      knownFacts: [
        'Herb garden participation was high in the first season, dropped by ~40% in year two.',
        'Chen has civil engineering background and can assess the drainage issue.',
        'Three neighbors outside the co-op expressed interest when Sofia mentioned it at the block meeting.',
      ],
      openQuestions: [
        'Can we get a proper lease, and on what terms?',
        'How do we allocate plots fairly given different capacity to participate?',
        'What happens to plots if a member departs the co-op?',
      ],
    },
    decisionMethod: 'consent',
    createdAt: d('2026-03-20T11:00:00Z'),
    updatedAt: d('2026-04-18T16:00:00Z'),
  });

  // Issue 3: Fee structure (OPEN)
  await db.insert(issues).values({
    id: feeIssueId,
    spaceId,
    title: 'Membership fee structure — access vs. sustainability',
    slug: 'membership-fee-structure',
    scope:
      'Whether to introduce optional or required membership fees to cover shared costs (shed maintenance, consumables, insurance). Excludes decisions about time credits or mutual aid — those are separate issues.',
    status: 'open',
    createdByMemberId: anikaId,
    scopeTags: ['fees', 'access', 'sustainability', 'governance'],
    structuredSections: {
      framings: [
        'We have been absorbing shared costs informally through whoever happens to buy something. This is unsustainable and creates invisible inequality.',
        'A fee structure could make the co-op more sustainable but risks excluding lower-income members.',
      ],
      constraints: [
        `Any fee structure must be designed so it doesn't gate participation.`,
        `We don't yet know what our actual annual costs are — we'd need a budget first.`,
      ],
      stakeholders: ['All current members', 'Future prospective members'],
      knownFacts: [],
      openQuestions: [
        'What are our actual annual costs?',
        'Should fees be sliding scale, fixed, or completely voluntary?',
        `What happens if someone can't pay?`,
      ],
    },
    decisionMethod: 'consent',
    createdAt: d('2026-04-28T10:30:00Z'),
    updatedAt: d('2026-04-28T10:30:00Z'),
  });

  // -------------------------------------------------------------------------
  // 5. Quorum states (one per issue)
  // -------------------------------------------------------------------------

  // Tool library: deliberation long over, all quorums met
  await db.insert(quorumStates).values({
    issueId: toolIssueId,
    awarenessCount: 8,
    awarenessRequired: 5, // 60% of 8
    participationCount: 7,
    participationRequired: 3, // 30% of 8 (rounded up)
    decisionQuorumMet: true,
    deliberationPeriodEndsAt: d('2026-03-08T23:59:59Z'),
    updatedAt: d('2026-03-15T14:00:00Z'),
  });

  // Garden: deliberation open, good participation so far
  await db.insert(quorumStates).values({
    issueId: gardenIssueId,
    awarenessCount: 7,
    awarenessRequired: 5,
    participationCount: 6,
    participationRequired: 3,
    decisionQuorumMet: false,
    deliberationPeriodEndsAt: d('2026-05-20T23:59:59Z'),
    updatedAt: d('2026-04-18T16:00:00Z'),
  });

  // Fee: just opened, low awareness
  await db.insert(quorumStates).values({
    issueId: feeIssueId,
    awarenessCount: 3,
    awarenessRequired: 5,
    participationCount: 2,
    participationRequired: 3,
    decisionQuorumMet: false,
    deliberationPeriodEndsAt: d('2026-06-01T23:59:59Z'),
    updatedAt: d('2026-04-28T10:30:00Z'),
  });

  // Issue views to back awareness counts (tool library — all 8 saw it)
  await db.insert(issueViews).values([
    { issueId: toolIssueId, memberId: priyaId, firstViewedAt: d('2026-02-01T09:05:00Z') },
    { issueId: toolIssueId, memberId: marcusId, firstViewedAt: d('2026-02-01T14:00:00Z') },
    { issueId: toolIssueId, memberId: sofiaId, firstViewedAt: d('2026-02-02T08:30:00Z') },
    { issueId: toolIssueId, memberId: devonId, firstViewedAt: d('2026-02-02T19:00:00Z') },
    { issueId: toolIssueId, memberId: anikaId, firstViewedAt: d('2026-02-03T12:00:00Z') },
    { issueId: toolIssueId, memberId: tomaszId, firstViewedAt: d('2026-02-04T10:00:00Z') },
    { issueId: toolIssueId, memberId: laylaId, firstViewedAt: d('2026-02-05T09:00:00Z') },
    { issueId: toolIssueId, memberId: chenId, firstViewedAt: d('2026-02-06T11:00:00Z') },
    // Garden — 7 of 8 have seen it
    { issueId: gardenIssueId, memberId: sofiaId, firstViewedAt: d('2026-03-20T11:05:00Z') },
    { issueId: gardenIssueId, memberId: priyaId, firstViewedAt: d('2026-03-20T15:00:00Z') },
    { issueId: gardenIssueId, memberId: devonId, firstViewedAt: d('2026-03-21T09:00:00Z') },
    { issueId: gardenIssueId, memberId: marcusId, firstViewedAt: d('2026-03-21T18:00:00Z') },
    { issueId: gardenIssueId, memberId: laylaId, firstViewedAt: d('2026-03-22T10:00:00Z') },
    { issueId: gardenIssueId, memberId: anikaId, firstViewedAt: d('2026-03-23T14:00:00Z') },
    { issueId: gardenIssueId, memberId: tomaszId, firstViewedAt: d('2026-04-01T11:00:00Z') },
    // Fee — 3 of 8 have seen it
    { issueId: feeIssueId, memberId: anikaId, firstViewedAt: d('2026-04-28T10:35:00Z') },
    { issueId: feeIssueId, memberId: chenId, firstViewedAt: d('2026-04-29T09:00:00Z') },
    { issueId: feeIssueId, memberId: priyaId, firstViewedAt: d('2026-04-30T11:00:00Z') },
  ]);

  // -------------------------------------------------------------------------
  // 6. Delegations
  // -------------------------------------------------------------------------

  // Marcus facilitates the tool library issue
  await db.insert(delegations).values({
    id: toolDelegationId,
    spaceId,
    issueId: toolIssueId,
    granteeMemberId: marcusId,
    grantedByType: 'group_consent',
    capability: 'facilitation',
    grantedAt: d('2026-02-05T12:00:00Z'),
    createdAt: d('2026-02-05T12:00:00Z'),
    updatedAt: d('2026-02-05T12:00:00Z'),
  });

  // Devon facilitates the garden issue
  await db.insert(delegations).values({
    id: gardenDelegationId,
    spaceId,
    issueId: gardenIssueId,
    granteeMemberId: devonId,
    grantedByType: 'group_consent',
    capability: 'facilitation',
    grantedAt: d('2026-03-21T10:00:00Z'),
    createdAt: d('2026-03-21T10:00:00Z'),
    updatedAt: d('2026-03-21T10:00:00Z'),
  });

  // -------------------------------------------------------------------------
  // 7. Perspectives — tool library issue (decided)
  // -------------------------------------------------------------------------

  await db.insert(perspectives).values([
    {
      id: p_tool_priya,
      issueId: toolIssueId,
      authorId: priyaId,
      taxonomyType: 'values',
      fromDirectExperience: true,
      bodyMarkdown:
        `I started this library because I was tired of watching neighbors buy the same drill five times when we could share one. But right now I'm the informal gatekeeper, and that's not sustainable or fair. Whatever we decide, it needs to take the informal coordination burden off any one person — including me. We should be designing for a co-op that works when I'm on vacation.`,
      createdAt: d('2026-02-06T09:30:00Z'),
    },
    {
      id: p_tool_marcus,
      issueId: toolIssueId,
      authorId: marcusId,
      taxonomyType: 'feasibility',
      fromDirectExperience: false,
      bodyMarkdown:
        'I did a rough inventory this weekend. We have about 42 items: hand tools, two drills, a circular saw, a level set, and various garden tools. The circular saw is the one item that requires a proper handoff (safety check on the blade guard). Everything else is pretty low-risk. I think a monthly rotating steward model is feasible — the burden per person per month would be maybe 2-3 hours if we set up a simple shared calendar.',
      createdAt: d('2026-02-08T18:00:00Z'),
    },
    {
      id: p_tool_sofia,
      issueId: toolIssueId,
      authorId: sofiaId,
      taxonomyType: 'risk',
      fromDirectExperience: true,
      bodyMarkdown:
        `We need to be honest about damage. Last year's missing drill didn't disappear — it came back broken and the person who had it didn't say anything. Any governance model that doesn't include a clear, non-punitive way to report damage just means broken tools get quietly returned and the next person discovers the problem. I'd rather have an awkward "the drill stopped working while I was using it" norm than a shame spiral.`,
      createdAt: d('2026-02-10T11:00:00Z'),
    },
    {
      id: p_tool_layla_reply,
      issueId: toolIssueId,
      authorId: laylaId,
      taxonomyType: 'risk',
      fromDirectExperience: false,
      parentPerspectiveId: p_tool_sofia,
      bodyMarkdown:
        `Agreed with Sofia. I'd add: we should also think about what happens when something breaks through normal wear-and-tear vs. user error. We probably shouldn't try to assign fault — just have a small repair/replacement fund and treat it as a commons cost.`,
      createdAt: d('2026-02-11T09:00:00Z'),
    },
    {
      id: p_tool_devon,
      issueId: toolIssueId,
      authorId: devonId,
      taxonomyType: 'equity',
      fromDirectExperience: true,
      bodyMarkdown:
        `I don't have a car, which means I can only realistically borrow tools from members within walking distance. A rotation model that always places tools at the same address, or that requires me to coordinate pickups from wherever the tool happens to be, effectively excludes me. Can we think about tool storage locations as part of this decision? Maybe the shed should be the default return point rather than people's homes.`,
      createdAt: d('2026-02-12T17:00:00Z'),
    },
    {
      id: p_tool_tomasz,
      issueId: toolIssueId,
      authorId: tomaszId,
      taxonomyType: 'temporal',
      fromDirectExperience: false,
      bodyMarkdown:
        `I've been part of two tool libraries in other cities. Both started well and both collapsed after 18 months when the initial enthusiastic stewards burned out. Whatever we build, it needs to be designed for low enthusiasm, not high. The system should be light enough that a steward who has a hard month can fulfil their obligations without heroics.`,
      createdAt: d('2026-02-15T08:00:00Z'),
    },
  ]);

  // -------------------------------------------------------------------------
  // 8. Decision Record for tool library issue
  // -------------------------------------------------------------------------

  await db.insert(decisionRecords).values({
    id: toolDrId,
    issueId: toolIssueId,
    draftedByMemberId: marcusId,
    whatText:
      'Adopt a rotating monthly steward model for the tool library.\n\n' +
      '**Steward responsibilities (monthly rotation):**\n' +
      '- Manage incoming borrow requests via the shared calendar\n' +
      '- Confirm returns and log any damage without assigning fault\n' +
      '- Ensure tools are returned to the shared shed (not individual homes) at end of borrowing period\n' +
      '- Escalate any tool needing repair to the group (brief message in the co-op channel)\n\n' +
      '**Repair and replacement:**\n' +
      '- Establish a small commons repair fund (target: $200/year) funded by voluntary contribution during annual governance review\n' +
      '- Damage reporting is non-punitive; the group absorbs wear-and-tear costs collectively\n\n' +
      '**Access:**\n' +
      '- The shared shed is the default borrow/return point for all tools\n' +
      '- Members may request tool delivery for accessibility reasons; the monthly steward accommodates where possible\n' +
      '- Access for neighbors outside the co-op is permitted on a case-by-case basis when the steward judges it appropriate; this decision is revisited at 6-month review',
    howMethod: 'consent',
    rationaleText:
      'Six weeks of deliberation surfaced three themes that shaped this decision:\n\n' +
      "1. **Deconcentrate coordination.** Priya's direct message had become an informal bottleneck. Rotating stewardship distributes both burden and authority.\n\n" +
      "2. **Design for low enthusiasm, not high.** Tomasz's temporal perspective (and experience from two prior tool libraries) pushed us toward a minimal steward role that's sustainable even in busy months.\n\n" +
      `3. **Shed-first logistics.** Devon's equity perspective was decisive in the storage question. Making the shed the default return point removes car-dependency from access.`,
    unresolvedObjectionsText:
      'Devon raised an ongoing concern about whether the shared shed is accessible enough — it is currently locked with a combination only Priya and Marcus know. This was acknowledged as a legitimate concern but resolved to address in a follow-up issue ("Shed access policy") rather than blocking this decision.',
    reviewDate: '2026-09-01',
    finalizedAt: d('2026-03-15T14:00:00Z'),
    finalizedByMemberId: marcusId,
    createdAt: d('2026-03-10T11:00:00Z'),
    updatedAt: d('2026-03-15T14:00:00Z'),
  });

  // Now update the tool library issue to 'decided' and link the DR
  await db
    .update(issues)
    .set({
      status: 'decided',
      currentDecisionRecordId: toolDrId,
      updatedAt: d('2026-03-15T14:00:00Z'),
    })
    .where(eq(issues.id, toolIssueId));

  // -------------------------------------------------------------------------
  // 9. Perspectives — garden issue (exploring)
  // -------------------------------------------------------------------------

  await db.insert(perspectives).values([
    {
      id: p_garden_anika,
      issueId: gardenIssueId,
      authorId: anikaId,
      taxonomyType: 'values',
      fromDirectExperience: false,
      bodyMarkdown:
        `Food sovereignty at neighborhood scale matters to me even if the amounts are small. Growing some of our own food together isn't just about efficiency — it's about knowing where food comes from and having some collective agency over it. I support expansion, but I want us to be honest that this is a political choice about what kind of neighborhood we want to be, not just a lifestyle project.`,
      createdAt: d('2026-03-22T10:00:00Z'),
    },
    {
      id: p_garden_layla,
      issueId: gardenIssueId,
      authorId: laylaId,
      taxonomyType: 'equity',
      fromDirectExperience: true,
      bodyMarkdown:
        `I want to raise the question of who actually has time to tend a plot. Our current herb garden participation fell 40% in year two because the people who started with enthusiasm got busy. If we expand, I want us to design plot allocation so that people who can commit less time (caregivers, people working multiple jobs) aren't systematically excluded. Maybe smaller plots or a shared-maintenance option alongside individual plots.`,
      createdAt: d('2026-03-24T15:00:00Z'),
    },
    {
      id: p_garden_chen,
      issueId: gardenIssueId,
      authorId: chenId,
      taxonomyType: 'feasibility',
      fromDirectExperience: true,
      bodyMarkdown:
        `I walked the north lot last weekend. The drainage problem in the southeast corner is real — standing water after rain. That corner is about 25% of the total lot. The rest is usable. We have two options: raised beds throughout (more expensive, solves drainage everywhere), or just avoid the southeast corner (cheaper, but we lose some area and the boundary is ambiguous). I can put together rough cost estimates for both approaches if that's useful.`,
      createdAt: d('2026-03-26T09:00:00Z'),
    },
    {
      id: p_garden_marcus,
      issueId: gardenIssueId,
      authorId: marcusId,
      taxonomyType: 'risk',
      fromDirectExperience: false,
      bodyMarkdown:
        `The biggest risk I see isn't logistical — it's legal. We have a verbal indication from the building owner, but verbal is worth nothing if they sell the property or change their mind mid-season. Any decision to expand should be conditional on getting a written lease with at least a 2-year term. I'd feel more comfortable starting small and extending by written agreement than planting extensively on a handshake.`,
      createdAt: d('2026-03-28T11:00:00Z'),
    },
    {
      id: p_garden_priya,
      issueId: gardenIssueId,
      authorId: priyaId,
      taxonomyType: 'relational',
      fromDirectExperience: true,
      bodyMarkdown:
        `The three neighbors Sofia mentioned at the block meeting are exactly the kind of relationship I want us to be building. The co-op has been a bit insular — we make decisions among ourselves without much porousness. A garden that involves people outside the formal membership could change that. I'd like us to think about whether this is a chance to pilot an "associate member" model for people who contribute to a specific commons without joining fully.`,
      createdAt: d('2026-04-02T18:00:00Z'),
    },
    {
      id: p_garden_tomasz,
      issueId: gardenIssueId,
      authorId: tomaszId,
      taxonomyType: 'temporal',
      fromDirectExperience: true,
      bodyMarkdown:
        `We planted a small herb garden last summer with a lot of enthusiasm and by October it was mostly Priya keeping it alive. I'm not against expansion, but I think we should be honest about our track record. Before committing to a larger lot, I'd want to see us successfully complete one full growing season with better participation in the existing herb planters. Can we make that a condition of moving forward?`,
      createdAt: d('2026-04-05T14:00:00Z'),
    },
  ]);

  // -------------------------------------------------------------------------
  // 10. Official summary — garden issue
  // -------------------------------------------------------------------------

  await db.insert(officialSummaries).values({
    id: gardenSummaryId,
    issueId: gardenIssueId,
    version: 1,
    authorMemberId: devonId,
    bodyMarkdown:
      '## What we know so far\n\n' +
      "**Points of agreement:** Members broadly support the idea of expanding the garden. The north lot is available (verbally) and most of the lot is usable. Chen's site assessment confirms the southeast drainage problem can be worked around.\n\n" +
      '**Key unresolved questions:**\n' +
      "1. **Legal**: Marcus's concern about a written lease before committing is gaining traction. No one has objected to making this a precondition.\n" +
      "2. **Access and equity**: Layla's framing of who-has-time-to-tend has resonated. A shared maintenance option alongside individual plots may be the answer, but we haven't worked out what that looks like.\n" +
      '3. **Participation track record**: Tomasz proposes that we require a successful herb garden season before committing to the larger lot. This is a substantive disagreement with members who want to move forward now.\n' +
      "4. **Associate members**: Priya's idea to use the garden as a pilot for a more porous membership model hasn't been explored yet — it may need its own issue.\n\n" +
      `**What's blocking a decision:** We don't yet have a written lease offer or cost estimates for raised beds. Devon (that's me) will follow up with the building owner this week about a formal lease term.`,
    publishedAt: d('2026-04-18T16:00:00Z'),
    contentHash: 'a3f2c8d14e7b6059a1d5f3e8c2b4a7d9e6f1c3b5a8d2e4f7c1b3a5d8e2f4c6',
  });

  // -------------------------------------------------------------------------
  // 11. Perspectives — fee issue (open, early stage)
  // -------------------------------------------------------------------------

  await db.insert(perspectives).values([
    {
      id: p_fee_anika,
      issueId: feeIssueId,
      authorId: anikaId,
      taxonomyType: 'values',
      fromDirectExperience: true,
      bodyMarkdown:
        `I'm raising this because I've been absorbing small costs quietly for about eight months — zip ties, spray paint for the shed, a new padlock — and I noticed I was starting to resent it. That's not a healthy dynamic for a commons. But I also set this co-op up because I believe in access-first. Any fee structure that makes it harder for someone with less money to participate is a structural failure, not an inconvenience. We need both sustainability and access, and I don't want to trade one off against the other.`,
      createdAt: d('2026-04-28T10:45:00Z'),
    },
    {
      id: p_fee_chen,
      issueId: feeIssueId,
      authorId: chenId,
      taxonomyType: 'feasibility',
      fromDirectExperience: false,
      bodyMarkdown:
        `Before we can design a fee structure, we need a budget. Do we know what our actual annual costs are? I'd volunteer to put together a simple cost tracker — even just a shared spreadsheet for three months would give us real numbers to design around. Right now we're having a values argument about fees without knowing if we're talking about $20/year or $200/year per member. Those are very different conversations.`,
      createdAt: d('2026-04-29T14:00:00Z'),
    },
  ]);

  // -------------------------------------------------------------------------
  // 12. Timeline Events — Civic Memory
  // -------------------------------------------------------------------------

  // Tool library issue: full arc
  await db.insert(timelineEvents).values([
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'issue_created',
      actorMemberId: priyaId,
      payload: { title: 'How should we govern the shared tool library?' },
      occurredAt: d('2026-02-01T09:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'perspective_added',
      actorMemberId: priyaId,
      payload: { perspectiveId: p_tool_priya, taxonomyType: 'values' },
      occurredAt: d('2026-02-06T09:30:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'perspective_added',
      actorMemberId: marcusId,
      payload: { perspectiveId: p_tool_marcus, taxonomyType: 'feasibility' },
      occurredAt: d('2026-02-08T18:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'perspective_added',
      actorMemberId: sofiaId,
      payload: { perspectiveId: p_tool_sofia, taxonomyType: 'risk' },
      occurredAt: d('2026-02-10T11:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'perspective_added',
      actorMemberId: laylaId,
      payload: { perspectiveId: p_tool_layla_reply, taxonomyType: 'risk', isReply: true },
      occurredAt: d('2026-02-11T09:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'delegation_granted',
      actorMemberId: priyaId,
      payload: { delegationId: toolDelegationId, granteeMemberId: marcusId, capability: 'facilitation' },
      occurredAt: d('2026-02-05T12:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'perspective_added',
      actorMemberId: devonId,
      payload: { perspectiveId: p_tool_devon, taxonomyType: 'equity' },
      occurredAt: d('2026-02-12T17:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'perspective_added',
      actorMemberId: tomaszId,
      payload: { perspectiveId: p_tool_tomasz, taxonomyType: 'temporal' },
      occurredAt: d('2026-02-15T08:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'issue_status_changed',
      actorMemberId: marcusId,
      payload: { from: 'open', to: 'exploring' },
      occurredAt: d('2026-02-16T10:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'decision_record_drafted',
      actorMemberId: marcusId,
      payload: { decisionRecordId: toolDrId },
      occurredAt: d('2026-03-10T11:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'decision_record_finalized',
      actorMemberId: marcusId,
      payload: { decisionRecordId: toolDrId, method: 'consent' },
      occurredAt: d('2026-03-15T14:00:00Z'),
    },
    {
      id: ulid(),
      issueId: toolIssueId,
      eventType: 'issue_status_changed',
      actorMemberId: marcusId,
      payload: { from: 'exploring', to: 'decided', decisionRecordId: toolDrId },
      occurredAt: d('2026-03-15T14:00:00Z'),
    },
  ]);

  // Garden issue: active arc
  await db.insert(timelineEvents).values([
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'issue_created',
      actorMemberId: sofiaId,
      payload: { title: 'North lot expansion — community garden' },
      occurredAt: d('2026-03-20T11:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'delegation_granted',
      actorMemberId: sofiaId,
      payload: { delegationId: gardenDelegationId, granteeMemberId: devonId, capability: 'facilitation' },
      occurredAt: d('2026-03-21T10:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'issue_status_changed',
      actorMemberId: devonId,
      payload: { from: 'open', to: 'exploring' },
      occurredAt: d('2026-03-21T10:30:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'perspective_added',
      actorMemberId: anikaId,
      payload: { perspectiveId: p_garden_anika, taxonomyType: 'values' },
      occurredAt: d('2026-03-22T10:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'perspective_added',
      actorMemberId: laylaId,
      payload: { perspectiveId: p_garden_layla, taxonomyType: 'equity' },
      occurredAt: d('2026-03-24T15:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'perspective_added',
      actorMemberId: chenId,
      payload: { perspectiveId: p_garden_chen, taxonomyType: 'feasibility' },
      occurredAt: d('2026-03-26T09:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'perspective_added',
      actorMemberId: marcusId,
      payload: { perspectiveId: p_garden_marcus, taxonomyType: 'risk' },
      occurredAt: d('2026-03-28T11:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'perspective_added',
      actorMemberId: priyaId,
      payload: { perspectiveId: p_garden_priya, taxonomyType: 'relational' },
      occurredAt: d('2026-04-02T18:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'perspective_added',
      actorMemberId: tomaszId,
      payload: { perspectiveId: p_garden_tomasz, taxonomyType: 'temporal' },
      occurredAt: d('2026-04-05T14:00:00Z'),
    },
    {
      id: ulid(),
      issueId: gardenIssueId,
      eventType: 'summary_published',
      actorMemberId: devonId,
      payload: { summaryId: gardenSummaryId, version: 1 },
      occurredAt: d('2026-04-18T16:00:00Z'),
    },
  ]);

  // Fee issue: early stage
  await db.insert(timelineEvents).values([
    {
      id: ulid(),
      issueId: feeIssueId,
      eventType: 'issue_created',
      actorMemberId: anikaId,
      payload: { title: 'Membership fee structure — access vs. sustainability' },
      occurredAt: d('2026-04-28T10:30:00Z'),
    },
    {
      id: ulid(),
      issueId: feeIssueId,
      eventType: 'perspective_added',
      actorMemberId: anikaId,
      payload: { perspectiveId: p_fee_anika, taxonomyType: 'values' },
      occurredAt: d('2026-04-28T10:45:00Z'),
    },
    {
      id: ulid(),
      issueId: feeIssueId,
      eventType: 'perspective_added',
      actorMemberId: chenId,
      payload: { perspectiveId: p_fee_chen, taxonomyType: 'feasibility' },
      occurredAt: d('2026-04-29T14:00:00Z'),
    },
  ]);

  console.log([
    `seeded space=${spaceId}`,
    `  8 members: priya=${priyaId} marcus=${marcusId} sofia=${sofiaId} devon=${devonId}`,
    `             anika=${anikaId} tomasz=${tomaszId} layla=${laylaId} chen=${chenId}`,
    `  issue[decided]=${toolIssueId}  (tool library — DR=${toolDrId})`,
    `  issue[exploring]=${gardenIssueId}  (garden expansion)`,
    `  issue[open]=${feeIssueId}  (fee structure)`,
  ].join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
