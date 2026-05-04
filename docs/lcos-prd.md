# Local Commons — Product Requirements Document

**Version:** 1.2
**Date:** 2026-05-03
**Status:** Draft
**Category:** Hyper-local civic infrastructure

---

## Executive Summary

Local Commons is a digital and social operating system for neighborhoods that want to act as a commons. It replaces the fragmentation of group chats, spreadsheets, and informal trust networks with a single, integrated platform where neighbors can see what exists around them, coordinate mutual aid, make collective decisions, and exchange value — without becoming a social media platform.

The product bundles five interdependent layers — Resource Registry, Needs & Offers, Lightweight Governance, Stewardship Record, and Local Economy — into a cohesive system. Each layer is useful alone; together they form a civic infrastructure stack. Local Commons is the neighborhood-scoped product within the broader Integral Commons vision. Where CommonGround (the Integral Commons governance module) serves any group governing shared resources, Local Commons is the place-based deployment: a configured bundle for neighborhoods, housing clusters, community land trusts, urban gardens, and mutual aid networks rooted in a specific geography.

**What Local Commons is and isn't:** Local Commons is infrastructure, not community. It can make existing relationships more visible and coordination less costly. It cannot create trust where none exists, heal historical divisions, or substitute for the slow work of human relationship. A neighborhood that installs Local Commons without human investment will have an empty database. A neighborhood with strong relational culture will find Local Commons useful. The platform should serve the community — not define it, not replace it, and not make anyone dependent on it.

Local Commons is also built on an honest acknowledgment of who communities actually contain: people who are exhausted, grieving, in survival mode, distrustful of institutions, living with disability, providing invisible care, or simply not interested in participating. These are not edge cases. They are most people, most of the time. This document holds those realities as design constraints, not afterthoughts.

---

## Problem Statement

**Current situation:** Neighborhoods that want to operate as a commons lack the infrastructure to do so. The knowledge and capacity are often present — neighbors have tools to lend, skills to share, and willingness to help — but the coordination layer is missing.

What exists today:

- **Facebook Groups / Nextdoor** — social media mechanics (engagement-maximizing, ad-driven, identity-distorting) wrapped in a local label. Designed for attention, not action.
- **Signal / WhatsApp groups** — good for urgent coordination, terrible for institutional memory, resource tracking, or structured decisions.
- **Spreadsheets and Airtables** — adequate for single use cases, siloed, not composable.
- **Loomio / similar governance tools** — useful for decisions but not connected to the resource, need, or economic layers.

No tool addresses the full coordination stack. Residents and organizers patch things together and lose capacity to the overhead of maintaining the patchwork.

**Root causes:**

*Coordination failures (the visible layer):*
- No shared map of what exists (resources, skills, land, capacity)
- No structured way to surface needs or offers without being social media
- Governance that collapses into meetings, WhatsApp threads, or informal power
- No economic layer that values non-market exchanges

*Human and social failures (the invisible layer — equally important):*
- Asking for help carries shame. Most people would rather go without than post a Need.
- Receiving care is not recognised as contribution — only giving is.
- Unpaid organizer labor is invisible and eventually collapses. Communities run on the exhaustion of a small number of people who eventually burn out.
- Power asymmetries make "coordination" feel unsafe for some neighbors. Not everyone in a neighborhood has equal standing to participate in decisions about shared resources.
- Care work — childcare, elder care, emotional support, illness management — is already undervalued by the market. Platforms that ignore it replicate that devaluation.
- Many neighbors are in survival mode: managing precarious housing, irregular income, chronic illness, caregiving. Participation is a luxury they cannot always afford.
- Historical harm — between longtime residents and newcomers, between communities and institutions, between different ethnic or economic groups within the same geography — doesn't disappear because a platform is well-designed.

*Ecological failures (the overlooked layer):*
- Neighborhoods exist within ecosystems — watersheds, soil systems, urban tree canopies, wildlife corridors — that are degraded when treated purely as backdrop. Local commons governance that ignores the non-human commons it depends on will eventually govern its own depletion.

**Proposed solution:** A single, integrated platform that layers these capabilities — starting with what's already present in the neighborhood and building toward collective self-governance and exchange.

**Primary competitors:**

| Competitor | Failure Mode |
|---|---|
| Nextdoor | Ad-driven, engagement-optimized, not designed for collective action |
| Facebook Groups | Same structural problems, plus surveillance capitalism |
| Loomio | Governance only, no resource/aid/economy integration |
| Sharetribe | Resource sharing only, marketplace framing |
| Open Food Network | Domain-specific (food), not generalized |

Local Commons differentiates by being: non-social-media, not ad-driven, place-based, contribution-valued, and designed for the full coordination stack rather than a single slice.

---

## Product Goals

### Core Goals

1. Make visible what's already present in the neighborhood (resources, needs, skills, capacity)
2. Enable structured mutual aid without the social overhead of social media — and reduce the shame of asking for help
3. Give neighborhoods a governance layer that doesn't collapse into meetings or group chats
4. Build a reputation system based on what people contribute, not how popular they are
5. Create a local economy layer that values non-market exchange — including care work and receiving, not just giving
6. Protect and name the local ecosystem as part of the commons, not merely a backdrop to it
7. Reduce the coordination burden on unpaid organizers and distribute it across the community
8. Make participation safe for people with reasons to distrust institutions, platforms, and neighbors

### Non-Goals

- Maximizing engagement, time-on-platform, or DAUs
- Replacing legal governance structures or formal tenancy/ownership arrangements
- Building a general-purpose social network
- Serving neighborhoods larger than ~500 households in Phase 1
- Real-time communication or messaging (other tools do this better)
- National or municipal civic infrastructure (Local Commons is hyper-local by design)
- Creating community where none exists — Local Commons supports relationships, it does not manufacture them
- Solving for equity without accompanying human work — the platform can reduce barriers but cannot address historical harm or structural inequality on its own

---

## Success Metrics

### Primary Metrics

| Metric | Definition | Phase 1 Target |
|---|---|---|
| Neighbor interaction rate | % of registered members with ≥1 meaningful interaction (aid exchange, resource use, decision participation, or platform access) in a rolling 30-day window | 40% |
| Mutual aid exchange volume | Number of completed needs/offers exchanges per month per active neighborhood | 15/month |
| Resource utilization rate | % of registered resources accessed ≥1 time in a 90-day window | 50% |
| Governance participation rate | % of eligible members who add a perspective or vote in at least one active decision per quarter | 35% |
| Passive presence rate | % of members who accessed the platform ≥1 time in 30 days (including read-only) | 65% |
| Retention | % of active neighborhoods (≥5 interactions/month) still active at 6 months | 60% |

**On passive participation:** Lurking is a legitimate form of neighborhood presence. Reading a Decision counts toward awareness quorum — a member has "viewed" a Decision when they have loaded the Decision detail page and remained on it for ≥20 seconds, or scrolled past the first structured section. Browsing the Registry has value. The passive presence rate tracks this explicitly — a neighborhood where 65% of members check in, even silently, is a healthy neighborhood.

### Signals of Failure

- Neighborhoods use the platform to broadcast, not coordinate (posts without responses)
- Resource Registry sits dormant (registrations with no checkouts)
- Governance used only by founders or organizers (participation < 15%)
- No first-contribution conversion — members join but never post a resource, need, or offer

### Anti-Metrics (explicitly not tracked)

- Page views, session length, post volume, reaction counts
- Virality / growth rate (quality over scale in Phase 1)

### What Cannot Be Measured (and shouldn't be)

Some of what Local Commons is trying to support cannot be quantified — and attempting to do so would damage it.

- The quality of a relationship built through an exchange. Two neighbors who become friends through a tool loan are not captured in any metric.
- The decision a neighbor made not to post a Need because they felt safe enough not to. Absence of distress is invisible.
- The informal care that happens beside the platform — the check-in, the meal left at the door, the conversation that happens because two people met through the Registry.
- The grief and loss that a neighborhood moves through together. Collective mourning is governance of a kind, and no platform should try to track it.
- Whether the neighborhood's relationship to its land deepened. Ecological health is measurable, but the quality of human relationship to place is not.

These unmeasured things are not gaps in the data model. They are the actual goal. The metrics exist to indicate whether conditions for these things are present — not to substitute for them.

---

## People This Serves (And How)

The "default user" assumption in most civic tech is a digitally literate, time-available, English-speaking person who is willing and able to engage. That person is real and Local Commons should serve them well. But they are not most people in most neighborhoods. The following personas are all first-class users — not edge cases, not future roadmap items.

### Active Contributors

**Residents who want to give** — People with tools, skills, time, or space they're willing to share. They are the most visible users. Local Commons should make contributing easy and visible without making non-contributors feel like second-class members.

**Community organizers** — Often running mutual aid networks, gardens, repair cafés, or block associations on top of their own lives. Need: tools that *reduce* their coordination overhead, not add to it. Risk: they are the most exploited users — the platform must not make it easier to dump more work on them.

**Land and space stewards** — People or groups managing shared or communal land. Need: scheduling, access control, stewardship logs, decision tools. They often have a deep relationship with the land that goes beyond logistics — that relationship deserves recognition in governance.

**Small local groups** — Tool libraries, seed swaps, food co-ops, repair cafés, childcare collectives. Need: resource management and lightweight governance without formal org overhead.

### Care Receivers and Partial Participants

**People in need** — Neighbors who need help more than they can give, at least right now: people in acute crisis, neighbors managing illness, single parents with no margin, elderly residents on fixed incomes. Receiving help is not a deficit. The design must make asking for help feel safe, not shameful. A neighborhood where only net-contributors participate is not a commons — it is a marketplace.

**People in survival mode** — Neighbors managing precarious housing, irregular income, chronic illness, or caregiving that consumes all available time. They may not be able to post Needs, attend governance decisions, or even open the app regularly. Local Commons should be useful to them through the proxy of others (Stewards, trusted neighbors) without requiring their active engagement.

**Low digital literacy users** — Neighbors who don't use smartphones regularly, find apps confusing, or have cognitive barriers to digital interfaces. The platform must not require digital fluency to receive value. The printable summary, organizer-as-proxy, and SMS fast-follow are designed for them. They are a design constraint, not a later consideration.

**Non-participating members** — Some neighbors will join and never do anything. This is acceptable. Membership is not a commitment to activity. The platform should not guilt, nudge repeatedly, or remove people for inactivity. Their presence in the neighborhood is real even if their platform presence is absent.

### Digitally Excluded Neighbors

**Neighbors without internet or smartphone access** — Elderly residents, low-income households, recent immigrants without a data plan. They may never touch the platform directly. They are still members of the community the platform serves. The printable summary, Steward proxy, and SMS path are the mechanisms. Their exclusion from the platform must not mean exclusion from the commons.

### Ecological and Place-Based Stakeholders

**The local ecosystem** — The watershed, soil, urban tree canopy, and wildlife present in the neighborhood are not just background. They have stakes in governance decisions about land, water use, pesticides, construction, and shared outdoor spaces. They cannot advocate for themselves. Local Commons treats them as stakeholders by requiring ecological impact to be a named consideration in relevant Decisions (see Ecological Stakeholders section).

**Land stewards with relational obligations** — Some members — particularly Indigenous neighbors or those with deep generational relationships to the land — understand their relationship to place in ways that exceed "resource management." The platform should not reduce stewardship to logistics. Land care categories in the Registry acknowledge this.

### Existing Community Structures

**Existing governance bodies** — Many neighborhoods already have decision-making structures: Indigenous councils, faith community governance, tenant associations, cultural societies. Local Commons does not replace these. Where they exist, Local Commons should be configured to support and defer to them, not compete with or supplant them.

### Secondary Users

**Governance designers and facilitators** — People who design how the neighborhood makes decisions. Need: configurable decision methods, participation tracking, deliberation tools.

**Researchers and commons practitioners** — People studying neighborhood commons models. Need: exportable data, open standards.

### Explicitly Not Designed For

- Neighborhoods larger than ~500 households without federation tooling (Phase 3+)
- Property managers or real estate interests seeking to use community infrastructure for commercial purposes
- Advertising-supported or surveillance-based use cases
- Full anonymity without any accountability link
- Actors seeking to use the platform to extract value from the neighborhood (data brokers, commercial researchers, predatory lenders targeting low-income members)

---

## User Stories

### Resident

- As a resident, I want to browse what's available in the Registry so I can access tools and skills without buying or hiring.
- As a resident, I want to post a Need so my neighbors know I need help and can respond.
- As a resident, I want to post an Offer so neighbors know what I can contribute.
- As a resident, I want to confirm a completed exchange so my time credits are updated and the contribution is recorded.
- As a resident, I want to see my contribution history so I understand my standing in the neighborhood.
- As a resident, I want to receive a gentle nudge toward my first contribution so I know what the easiest way to get started is.

### Anonymous Member

- As a vulnerable neighbor, I want to be vouched in by a Steward so I can post Needs and access resources without the platform holding my identity.
- As an anonymous member, I want to contact a Need poster in-platform so I can respond to requests without exposing my contact details.
- As an anonymous member, I want to browse the Registry so I know what the neighborhood has available.

### Steward

- As a Steward, I want to vouch a new member so they can access the neighborhood without platform-held identity verification.
- As a Steward, I want to walk my neighborhood through the Launch Kit so members have used all three primary layers before the event ends.
- As a Steward, I want to pre-seed the Registry before inviting members so the platform feels alive on day one.
- As a Steward, I want to import resources and Needs from a CSV so we can migrate from our existing spreadsheet without re-entering everything.
- As a Steward, I want to see unmet Needs over time so I can identify persistent gaps in our neighborhood's capacity.
- As a Steward, I want to receive a private alert when a conflict pattern emerges so I can intervene before it escalates publicly.
- As a Steward, I want to act as proxy for a non-digital neighbor so they can participate without a smartphone.
- As a Steward, I want to generate a printable weekly summary so I can post it for neighbors who aren't online.
- As a Steward, I want to log an emergency action so it enters Civic Memory and triggers the 72-hour ratification window.

### Governance

- As a member, I want to open a Decision and frame its scope so the neighborhood knows what's being deliberated and who is affected.
- As a facilitator, I want the 5-phase wizard to guide me through Attention, Perspecting, Integration, Decision, and Memory so I can run a fair process without prior governance experience.
- As a member, I want to add a Perspective typed by lens so my view is heard in a structured way before resolution.
- As a member, I want to read a Decision and have it count toward awareness quorum so passive engagement is recognised.
- As a member, I want to request a secret ballot so I can vote my conscience without social pressure.
- As a member, I want to challenge the scope of a Decision so that affected parties who were initially excluded can participate.

### Local Economy

- As a member, I want to offer a skill in exchange for time credits so my contribution has tangible value in the neighborhood.
- As a member, I want to check my credit balance so I know what I can draw on from the commons.
- As a member, I want to confirm a completed time credit exchange so credits transfer and the contribution is logged.
- As a Steward, I want to propose a Commons Fund allocation so the neighborhood can deliberate on how to use overflow credits.

---

## Core Conceptual Model

Local Commons is built on five interdependent human layers, situated within a sixth layer that they depend on and are accountable to.

```
╔═════════════════════════════════════════════════╗
║            PLACE & ECOSYSTEM GROUND             ║
║  Watershed · Soil · Canopy · Non-human life     ║
║  (The commons that all other commons depend on) ║
╠═════════════════════════════════════════════════╣
│               LOCAL ECONOMY LAYER               │
│         Time credits · Alternative exchange     │
├─────────────────────────────────────────────────┤
│              STEWARDSHIP RECORD                  │
│    Participation history · Non-evaluative        │
├──────────────────┬──────────────────────────────┤
│  RESOURCE        │   NEEDS & OFFERS              │
│  REGISTRY        │   (Mutual Aid)                │
│  Tools · Land    │   Requests · Offers           │
│  Skills · Care   │   Giving & Receiving          │
├──────────────────┴──────────────────────────────┤
│            LIGHTWEIGHT GOVERNANCE               │
│    Decisions · Consent · Delegation · Memory    │
└─────────────────────────────────────────────────┘
```

The Place & Ecosystem Ground is not a layer the platform manages — it is the layer the platform must be accountable to. Governance decisions that affect land, water, outdoor space, or non-human life within the neighborhood require ecological impact to be named as a scope consideration. This is enforced in the governance wizard.

### The Neighborhood (top-level object)

A Neighborhood is the bounded unit. It has:

- A geographic boundary (fuzzy by design — see below)
- A membership (residents, groups, stewards — verified as belonging to the place)
- A governance profile (established through the bootstrap process)
- A Commons Charter (a living document of what the neighborhood has agreed to)

Neighborhoods can federate with adjacent neighborhoods in Phase 3.

### Boundary Definition

Neighborhood boundaries are **fuzzy by design**. Local Commons does not enforce a hard geographic perimeter. Membership is determined by organizer invitation or peer vouching — not by whether someone's address falls inside a polygon.

This is intentional: neighborhoods are social constructs, not cadastral units. Hard boundaries create exclusion edge cases that undermine the commons ethos ("these are my neighbors but those people aren't"). A neighbor who lives one block outside the drawn area but actively participates in the community garden belongs. A resident inside the boundary who never engages does not meaningfully belong.

**Phase 1 boundary format: text description only.** During onboarding, the founding Steward writes a plain-language description of the neighborhood's approximate extent (e.g. "The blocks around Oak Street from 1st to 8th Ave, including Riverside Park"). This is displayed to members as orientation context — not enforced as a gate. Map polygon drawing is deferred to Phase 2. Membership is always the real boundary.

### Identity and Membership

Members have lightweight identities: name (or pseudonym), approximate location within the neighborhood (zone or area, not address), and roles they self-assign (resident, steward, organizer, group member).

**Membership tiers:**

| Tier | Verification | Access |
|---|---|---|
| **Full member** | Organizer invitation or peer vouching | All layers: Registry, Needs/Offers, Governance, Credits |
| **Anonymous member** | Organizer-vouched only (organizer holds the identity link; platform holds none) | Post Needs, claim Offers, browse Registry. Cannot earn/spend time credits, cannot vote in governance, cannot post credit-rated Offers |

Note: postal mail address verification is not supported in Phase 1. Verification = organizer invitation or peer vouching only.

**All membership requires vouching** — both tiers. No one joins without being vouched by an active member. This is not a formality: it is the verification gate. The neighborhood's resource inventory, open Needs, and membership list are only visible to verified members. An unverified visitor sees nothing — not the Registry, not the Needs board, not the member list. This protects the neighborhood from bad-faith actors scoping resources.

**Growth rate cap:** Membership cannot double within a 30-day period, regardless of how many vouches are submitted. This prevents coordinated capture — a bad-faith group joining en masse to take over governance. Vouches submitted during a rate-cap lockout are queued and processed when the window clears.

**Anonymous membership** exists to protect vulnerable neighbors — domestic violence survivors, undocumented residents, people in housing disputes with landlords who are also in the neighborhood. These are not edge cases in many urban neighborhoods. An organizer vouches for the person's neighborhood belonging without any address or name entering the platform. The accountability link is human (the voucher), not digital. What changes between tiers is what the platform records — not whether verification happened.

Pseudonyms are allowed for all tiers. True anonymity (no vouching, no accountability link) is not supported — the commons requires that someone is accountable for every member, even if that accountability is held by a human rather than a database.

---

## Layer 1: Resource Registry

### Overview

A structured inventory of what's available in the neighborhood: shared tools, spaces, land, and skills. The Registry makes the invisible visible — the drill that six neighbors would buy separately, the backyard that could host a garden bed, the neighbor who knows how to fix a bike.

### Resource Types

| Type | Examples | Key Fields |
|---|---|---|
| **Tool / Object** | Drill, ladder, sewing machine, cargo bike | Owner/steward, availability, condition, pickup/return instructions |
| **Space** | Garage bay, yard, meeting room, kitchen | Capacity, access notes, scheduling constraints |
| **Land** | Garden bed, fruit tree access, composting area | Steward, use rules, seasonal availability |
| **Skill** | Bicycle repair, tax filing, language tutoring, plumbing | Skill holder, availability windows, how to request |

### Functional Requirements

**Registry entry:**
- Required: type, title, description, availability status (available / on loan / not available), steward/owner contact method
- Optional: photo, condition notes, access instructions, scheduling constraints, time credit rate (if applicable)
- Every entry is linked to its contributor's Stewardship Record

**Availability and scheduling:**
- Lightweight scheduling: open slots or "request to arrange"
- For Phase 1: no calendar integration; availability is communicated through the Exchange Request protocol (see below)
- Steward can mark items unavailable without removing them from the registry

**Checkout and return:**
- Members request access via a structured Exchange Request (see Exchange Coordination Protocol)
- Steward approves, counters, or opens a conversation — no unstructured message required
- Completed exchanges are logged in both parties' Stewardship Records
- Condition notes at return (optional but encouraged)

**Discovery:**
- Browse by type, proximity zone, or availability
- Search by keyword
- "What's nearby" view showing resources by neighborhood zone
- Filter: available now / available by arrangement / accepting requests

**Acceptance Criteria:**
- A member can register a tool in under 3 minutes
- A member can find and request access to a tool without leaving the platform
- Steward receives an Exchange Request notification and can approve in one tap — no message composition required
- Resource is automatically marked "on loan" upon approval and restored to "available" upon completion confirmation
- Exchange is logged and reflected in both parties' contribution records within 24 hours of completion

---

## Layer 2: Needs & Offers (Mutual Aid)

### Overview

A structured layer for surfacing mutual aid requests and offers. Not a feed. Not a chat. A structured system for posting what you need and what you're offering, with time bounds and local context — designed for completion, not engagement.

**On asking for help:** The hardest design problem in this layer is not technical. It is social and psychological. Most people would rather go without than post a Need. Asking for help publicly — even in a trusted community — carries shame, fear of judgment, and anxiety about reciprocity. The design must work against this actively. Needs must be framed as contribution to the community's self-knowledge, not as admissions of weakness. A neighbor who posts an honest Need is giving the community a gift: they are making real what was invisible.

**On receiving as contribution:** Receiving help graciously, confirming exchanges, and providing feedback on what was useful are forms of contribution. The platform should make this legible — not by awarding badges for receiving, but by treating the act of allowing a neighbor to help you as a meaningful part of the commons cycle. A community where no one is willing to receive is not a mutual aid community.

**On neighbors who cannot reciprocate:** Some neighbors — elderly, disabled, in crisis, in poverty — may receive more than they give for extended periods, possibly permanently. This is not a problem to solve. It is the point. The Commons Fund, the gift economy option, and the explicit design principle that receiving is legitimate all exist to hold this reality.

### Core Objects

**Need** — A request for help, a resource, or a skill. Time-bounded. Fulfilled or expired. Posting a Need is an act of trust and community contribution.

**Offer** — Something available: a resource, labor, skill, or care. Time-bounded. Claimed or expired.

Both are first-class objects, not posts. Neither generates a feed or a comment thread.

### Functional Requirements

**Posting a Need:**
- Required: title, what's needed, by when (deadline or open-ended)
- Optional: why (context helps neighbors understand urgency), time credit offer, geographic zone, **urgent flag**, external contact info (for members who prefer off-platform coordination)
- Visibility: neighborhood-wide by default; steerable to specific groups
- Responses arrive as structured Exchange Requests — not messages (see Exchange Coordination Protocol)

**Urgent flag:**
A Need can be marked urgent. Urgent Needs surface at the top of the Needs list regardless of deadline, and trigger immediate in-platform notification (not digest) to members in the relevant zone. The bar for "urgent" is intentionally undefined — members self-assess. Abuse of the flag reduces its signal value; the community norm and organizer alerts handle misuse. Urgent Needs are visually distinct but not alarming — no sirens, no red badges, no anxiety cues. The design communicates "this matters now" without "drop everything."

This is Local Commons's emergency coordination primitive for Phase 1. A dedicated Emergency Mode (neighborhood-wide state shift with real-time broadcast) is on the Phase 2 roadmap.

**Posting an Offer:**
- Required: title, what's offered, available until, how to claim
- Optional: conditions, zone, time credit request
- Linked to Registry if the offer involves a registered resource

**Matching:**
- System surfaces potential matches between Needs and related Offers (and vice versa)
- No algorithm optimized for engagement; matching is structural (keyword + type + proximity)
- Organizers can manually connect a Need to an Offer

**Resolution:**
- Needs and Offers are closed when fulfilled, declined, or expired
- Completed exchanges logged in both parties' contribution records
- Expired unfulfilled needs visible to organizers (signal of unmet neighborhood capacity)

**Discovery:**
- Browse open needs and offers (not a feed — navigable list, sorted by deadline)
- Filter by type (material, labor, skill, care, space) and zone
- Organizers have a dashboard showing unmet needs over time

**Acceptance Criteria:**
- Posting a Need takes under 2 minutes
- Responding to a Need or Offer requires filling in 3 structured fields — no freeform message required
- A simple exchange (no counter needed) is confirmed in 2 touches: request + approve
- A countered exchange resolves in 3 touches maximum before routing to conversation
- Completed exchanges are logged within 1 hour of mutual confirmation
- A resource checked out via Exchange Request is automatically marked "on loan" in the Registry
- Organizers can see a summary of unmet needs over the past 30 days

---

## Layer 3: Lightweight Governance

### Overview

Neighborhoods need to make decisions together: about shared resources, about the Commons Charter, about how to handle a conflict, about what to plant. Local Commons embeds a governance layer — drawn from the CommonGround framework — that is lightweight enough for a neighborhood block but principled enough to prevent power capture.

This layer is the CommonGround deliberation system configured for neighborhood context. It is not a full re-implementation; Local Commons ships with a neighborhood-appropriate default governance profile.

### Core Objects

**Decision** — A persistent, structured question the neighborhood needs to resolve. Flows through the 5-phase protocol: **Attention → Perspecting → Integration → Decision → Memory**. Can be reopened after closure.

**Perspective** — A structured contribution to a Decision, typed by lens (Values, Risk, Equity, Feasibility, Relational, Temporal). Not a comment. Not a vote. First-class object — not threaded, not ranked.

**Decision Record** — A structured capture of what was decided, how, why, and what dissent remains. Required to close a Decision. Drafted by the facilitator, open to objection during a review window before finalisation.

**Commons Charter** — The neighborhood's living constitutional document, derived from the CommonGround Constitution. It has named sections (e.g. "How we make decisions," "How we share resources," "How we handle conflict," "How we protect the commons"). Each section is free-text with full version history. Closed Decisions may append a summary to a relevant section, proposed by the facilitator and confirmed by Stewards. The Charter is visible to all members and exportable.

### The 5-Phase Decision Protocol

Decisions are not forms to fill out — they are the crystallisation of a collective sense-making process. The platform guides members through five phases:

1. **Attention** — Issue is framed: title, scope (what is and isn't included), affected parties. Scope can be challenged during deliberation. Any member may petition for inclusion if they are materially affected.
2. **Perspecting** — Members add Perspectives using the 6 lens types. The platform tracks perspectival coverage: are different viewpoints being heard, or is the discussion clustering?
3. **Integration** — Perspectives encounter each other. The facilitator produces an integration summary: where is there shared understanding? Where does genuine disagreement remain? What is still unknown? The platform surfaces a legibility warning if contributions are not cross-engaging (parallel monologue signal).
4. **Decision** — Resolution via the group's configured method (default: consent-based). Objections must be reasoned and paramount, not preferential. Secret ballot available for any decision on request.
5. **Memory** — Decision Record is drafted, reviewed, and finalised. Civic Memory timeline is updated. Relevant Charter sections may be amended.

A Decision may not skip Perspecting or Integration and proceed directly to a vote. Deliberation is a Tier 1 constitutional requirement.

### Governance Profile (Neighborhood Default)

The default profile is lighter than CommonGround's co-op defaults, reflecting neighborhood participation realities:

- **Decision method:** Consent-based (objections must be paramount — reasoned claims of harm, not preferences)
- **Awareness quorum:** 40% of **affected members** (not all members) must have viewed the Decision before closure. Quorum is scoped to the affected group per the Subsidiarity principle — a decision about the community garden requires quorum from garden participants, not the whole neighborhood.
- **Participation quorum:** 20% of affected members must have added a Perspective or explicitly stood aside
- **Deliberation window:** 7 days minimum (configurable per Decision; facilitator may extend, not shorten)
- **Facilitation:** Defaults to the opener. If any member challenges, a consent check determines the facilitator. Sortition (random selection from willing members) is the fallback if consent check fails.
- **Secret ballot:** Available for any decision on any member's request — social pressure in small groups is real.

Sub-groups within the neighborhood (garden, tool library, etc.) may define their own tighter governance profiles through a governance Decision. Their quorum is calculated against their own membership, not the full neighborhood.

### Membership and Liveness

Membership is the **active exercise of participation**, not account possession.

- **Active members** have governance rights: vote, add Perspectives, count toward quorum. Liveness = any meaningful platform interaction within a rolling 90-day window.
- **Inactive members** retain their history and accounts but do not count toward quorum and cannot vote until they reactivate. Reactivation is automatic upon any qualifying interaction.
- When a referendum is called, inactive members receive notification and a **7-day grace period** to reactivate by participating in deliberation — this window is hardcoded and cannot be removed.
- **Growth rate cap:** Membership cannot double within a 30-day period. This prevents coordinated capture — a bad-faith group joining en masse to take over governance.

### What Local Commons Governance Is Not

- **Not a voting machine.** Votes exist but are a last resort, not the first tool. The 5-phase protocol must be completed first.
- **Not a meeting replacement.** It supports asynchronous deliberation but doesn't prohibit or replace in-person process.
- **Not anonymous.** Perspectives are attributed (pseudonymity allowed, anonymity is not — governance requires minimal accountability).
- **Not a forum.** No open-ended comment threads. Perspectives are structured contributions.

### Constitutional Constraints (inherited from Integral Commons Constitution)

Six Tier 1 inviolable principles apply to all Local Commons neighborhood governance regardless of profile:

1. **Revocability** — All delegations are revocable. No delegation may be made permanent.
2. **Due Process** — Members subject to removal may participate in deliberation, may not block the final decision, and are entitled to transparent criteria and thresholds.
3. **Commons Protection** — No decision may privatize shared infrastructure, restrict exit rights, or destroy the conditions for collective sense-making. Supreme among all principles.
4. **Forkability** — Any member or group may fork their governance profile or leave with their data.
5. **Holonic Nesting** — Local Commons neighborhoods are holons within the Integral Commons ecosystem. They share Tier 1 principles with sibling and parent holons; their Tier 2 choices are their own.
6. **Deliberation** — No decision proceeds without structured deliberation. Voting without deliberation is prohibited.

### The 5-Phase Facilitation Wizard

The wizard guides a first-time facilitator through all five phases without prior governance experience. It is not a form — it is a process guide that enforces the constitutional protocol while making each step clear.

---

**Phase 1 — Attention**

*Goal: frame the issue and identify who is affected.*

Facilitator fills in:
- Title
- Scope: what is included, and what is explicitly not included
- Affected parties: self-identified (any member may add themselves) or Steward-nominated

System shows:
- Current affected member count
- Resulting quorum thresholds (awareness and participation) calculated against that group
- A scope challenge prompt: *"Any member who believes they are materially affected and not listed may petition to be included during this phase."*

Phase closes when the facilitator confirms scope. Scope challenges are surfaced as inline comments before confirmation.

---

**Phase 2 — Perspecting**

*Goal: surface multiple partial views of the issue.*

System prompts affected members via the next digest cycle. Members submit Perspectives using the 6 lens types (Values, Risk, Equity, Feasibility, Relational, Temporal).

Facilitator sees a **coverage dashboard**:
- Which lens types have been heard
- Which are silent (prompts facilitator to actively invite those perspectives)
- Whether awareness quorum has been reached among affected members

Platform surfaces a **parallel monologue warning** if contributions are clustering without cross-engagement — perspectives responding only to aligned views and ignoring divergent ones. This is a signal for the facilitator to prompt direct engagement, not a gate.

Phase cannot close until the minimum deliberation window has elapsed (7 days default). Facilitator may extend; cannot shorten.

---

**Phase 3 — Integration**

*Goal: make shared understanding and remaining disagreement legible.*

The facilitator authors an **Integration Summary** — manually written in Phase 1, no AI assist:
- Where is there shared understanding?
- Where does genuine disagreement remain?
- What is still unknown or unresolved?

The summary is visible to all affected members, who may flag it as incomplete or request a revision. One round of revision is built into the phase before the facilitator can close it.

Platform surfaces the parallel monologue signal again here if it was present in Perspecting and not resolved.

---

**Phase 4 — Decision**

*Goal: reach a resolution through the group's configured method.*

Facilitator proposes a resolution based on the Integration Summary. Affected members respond:
- **Consent** — no paramount objection
- **Stand aside** — acknowledged, non-blocking
- **Paramount objection** — must be a reasoned claim of harm to the commons or to the conditions for collective sense-making; not a preference. If another member challenges whether an objection is truly paramount, a 2/3 legitimacy check vote is triggered.
- **Process refusal** — a member may formally refuse to participate in a deliberation process as a political act rather than through apathy or absence. Process refusal requires a brief public reason and is recorded differently from non-participation. A decision with 40% participation and 15% active process refusal is a different political situation than one with 40% participation and 60% silence. The platform makes this distinction legible to the facilitator and to the neighborhood. Process refusal does not block a decision from proceeding once quorum is otherwise met — it is a political signal, not a veto. Its presence in the Decision Record is permanent: any future governance revisiting related questions must acknowledge the prior refusal.

**Secret ballot:** available for any decision on any member's request. The request is visible; the vote is not.

**Quorum check:** system enforces awareness and participation quorum against the affected group before the Decision phase can close. If quorum is not met within the deliberation window, the Decision is marked "Stalled — insufficient participation" and cannot proceed until quorum is reached. If active process refusals account for more than 20% of affected members, the stall reason is recorded as "Stalled — active process refusal" rather than "Stalled — insufficient participation," and the Decision Record must address this before the Decision can be reopened.

---

**Phase 5 — Memory**

*Goal: record the decision in a form the neighborhood can learn from.*

System pre-populates a Decision Record draft from the Decision data:
- Issue title and scope
- Summary of perspectives (facilitator may edit)
- Decision method used
- Outcome
- Dissenting views (any paramount objections that were overridden)
- Review date (optional — when should this decision be revisited?)

Facilitator edits and publishes. The record enters a **24-hour review window** during which any affected member may flag a factual error. After the window, the record is finalised and appended to Civic Memory.

Facilitator is prompted: *"Does this decision update the Commons Charter?"* If yes, they select the relevant section and propose an amendment. Stewards confirm the addition.

---

### Functional Requirements

- Any member can open a Decision
- Facilitation defaults to the opener; consent check + sortition fallback if challenged
- Scope can be challenged by any materially-affected member during the Attention phase
- Perspectives support the 6 default lens types (configurable per neighborhood)
- Platform detects and surfaces parallel monologue signal when perspectives are not cross-engaging
- Minimum deliberation window enforced — facilitator cannot advance from Perspecting to Integration before 7 days (default)
- Integration Summary is manually authored — no AI generation in Phase 1
- Decision Records required for closure (system-enforced); 24-hour review window before finalisation
- Secret ballot available for any decision on request
- Civic Memory timeline for each Decision (reframings, status changes, key evidence)
- Inactive member 7-day grace period notification triggered when any referendum is called
- Growth rate cap enforced: membership cannot double within 30 days
- No real-time notifications; digest-based rhythm (configurable: daily, weekly)
- Full data export of all Decisions and Records in Markdown and JSON

**Acceptance Criteria:**
- A member with no governance experience can open and facilitate a Decision through the 5-phase wizard without external support
- A Decision cannot reach the Decision phase without a completed Integration Summary
- A Decision cannot close without meeting awareness and participation quorum against the affected group
- Quorum calculation against affected group (not full membership) must be verifiable in the Decision detail view
- Parallel monologue signal is surfaced during Perspecting if cross-engagement drops below threshold
- Decision Records are exportable and human-readable outside the platform
- The Commons Charter reflects facilitator-proposed amendments within 24 hours of Steward confirmation
- Secret ballot requests are fulfilled without revealing the requester's identity to other members

---

## Layer 4: Stewardship Record

### Overview

The Stewardship Record is the neighborhood's collective memory of what members have been part of. It is descriptive, not evaluative. It records what happened — resources stewarded, exchanges completed, Decisions participated in — without translating those happenings into a score, a rank, or a signal of a person's worth to the community.

This is a deliberate departure from "Trust Graph" or "contribution scoring" models. Making human behavior legible to a system changes the behavior. When people know that contributions are scored, they contribute in ways the system can see — which may not be the same as contributing in ways the neighborhood needs. The most important work in any community (emotional labor, informal care, the conversations that hold relationships together) is invisible to any platform and should remain so. The Stewardship Record records platform-visible activity without claiming that platform-visible activity is what matters.

**The platform takes no position on what a good community member looks like.** There is no score, no threshold, no recognition earned by crossing a metric. The record holds history. The community holds judgment.

### What the Stewardship Record Holds

Platform activity is logged as a historical record — Civic Memory for the individual, analogous to how the governance timeline is Civic Memory for a Decision.

| Activity | Recorded |
|---|---|
| Resources registered in the Registry | Yes |
| Resource loans completed (as lender) | Yes |
| Needs fulfilled | Yes |
| Offers claimed | Yes |
| Perspectives added to a Decision | Yes |
| Decisions facilitated to closure | Yes |
| Exchanges completed (any type) | Yes |

This is a record of participation, not a measure of value. It answers "what has this member been part of?" — not "how much are they worth to the neighborhood?"

### What the Stewardship Record Does Not Hold

The following are deliberately outside the record, because tracking them would either damage them or misrepresent their nature:

- Emotional support, listening, accompaniment through grief or crisis
- Informal relationship-building (the conversations that happen beside the platform)
- Spiritual or cultural stewardship of place
- The labor of making people feel welcomed and included
- Advocacy or conflict resolution that happens off-platform
- Care given to neighbors who are not Local Commons members
- The quality of any exchange or relationship

These are not gaps. They are the most important things a neighborhood does. The platform acknowledges its own blindness to them.

### Who Can See What

- **Members** see their own full record and can export it at any time
- **Other members** see a summary of platform participation on a member's profile — not a score or rank, just a brief history ("Member since April, facilitated 2 Decisions, 14 exchanges completed")
- **Stewards** see the same summary view as other members; they have no elevated access to contribution data. Steward access to behavioral patterns is for conflict detection only (see below), not for general member evaluation.

### Recognition (Optional, Neighborhood-Configured)

Neighborhoods may choose to enable recognition signals — named acknowledgements for specific contributions. These are an **opt-in feature** at the neighborhood level, not a shipped default.

When enabled, they are community-configured: the neighborhood decides what to recognize and what to name it. The platform does not ship a default set of recognition thresholds. There is no "Active Contributor" badge from the platform. If a neighborhood wants to celebrate that someone has facilitated their tenth Decision, they can configure that — with language that reflects their culture, not the platform's assumed values.

Recognition signals, where configured, are celebratory and contextual. They do not gate features or governance. Their absence is neutral.

### Participation Equity Audit (Steward-Only)

When governance participation is systematically skewed — with the majority of Perspectives on Decisions coming from a structural subset of the neighborhood — the Steward dashboard surfaces a **participation equity alert**. This does not require demographic tracking beyond what the neighborhood already holds. It uses neighborhood-defined attributes (zone, membership tenure, full vs. anonymous tier, active vs. inactive status) to identify structural patterns.

The alert fires when: ≥80% of Perspectives on a Decision come from members sharing a single attribute value (e.g., all from one zone, all with >1 year tenure, all full members rather than anonymous members). It is informational — a prompt for facilitators to actively reach out to underrepresented members before the Integration phase closes, not an automatic gate on the process.

This addresses the reality that "structured deliberation" can systematically advantage members with time, cultural fluency, and platform comfort — and that governance appearing healthy by participation-rate metrics may still be functionally dominated by a structural subset.

### Conflict and Issue Alerts (Steward-Only)

When patterns emerge that may warrant attention — a resource repeatedly returned damaged, a member with multiple unresolved exchanges, a Need fulfilled but disputed — the system sends a **private alert to neighborhood Stewards only**. No public flag. No notation on the member's record.

This is a signal, not an accusation. The Steward's job is to check in informally, not to adjudicate. Resolution happens outside the platform or through the CIP conflict repair process. Local Commons is a coordination layer, not a court.

### Vouching (Phase 2)

Members can vouch for a new member who lacks neighborhood-verification documentation. Vouching creates a human accountability link — the voucher's identity is associated with the new member in Steward-visible records only. If the vouched member causes harm, the voucher is notified and involved in resolution.

### Functional Requirements

- Activity logging is automatic — no manual endorsements, no likes, no peer ratings
- Members see their own full record; other members see a summary view with no score or rank
- Stewards see the same summary view as other members; behavioral pattern alerts are for conflict detection only
- Recognition signals are disabled by default; neighborhoods opt in and configure their own
- Conflict alerts go only to Stewards, never to the broader membership
- Members can export their full record at any time in Markdown and JSON

---

## Layer 5: Local Economy Layer

### Overview

The Local Economy Layer enables alternative exchange within the neighborhood: time banking, skill swaps, and resource credits. It makes visible and valuable the contributions that market economies ignore — childcare, elder care, teaching, labor, care work — and creates a local circulation that reduces dependence on cash for within-neighborhood exchange.

Phase 1 ships a simple time credit system. Phase 2 adds richer exchange models.

**Honest tensions this layer must hold:**

*Time is not fungible.* One hour from a single parent with two sick children, an unstable housing situation, and a night-shift job is not the same as one hour from a retired professional with savings and no dependents. A flat time credit system treats them as equal. This is both its strength (radical non-hierarchy) and its blindness (it ignores survival constraints). The Commons Fund and the gift option exist partly to address this — neighbors who cannot trade time equitably can still receive from the commons without accumulating debt.

*Quantifying care may harm it.* When care work enters a credit system, it becomes legible and valued — which is good. It also becomes transactional — which may be bad. Some forms of care should be offered as gifts, not as credits. The platform supports both. Exchanges can be explicitly marked as gifts (no credits requested or offered), which does not log a credit transaction but does log a contribution.

*Some people should receive without giving.* Elderly neighbors, members with disabilities, neighbors in acute crisis — their right to receive from the commons is not conditional on their ability to contribute. The Commons Fund is explicitly designed to resource this. No neighbor should be made to feel that they are a burden on the system for receiving more than they give.

### Time Credits (Phase 1)

Time credits are an **opt-in, neighborhood-configured coordination mechanism**. They are not the default mode of exchange — gift exchange is. A neighborhood that prefers to operate entirely on gift economy can disable credits entirely. A neighborhood that wants a coordination mechanism for managing access to high-demand shared resources can enable them.

**The default is gift.** Every exchange begins as a gift unless one or both parties explicitly request credit tracking. This is not just a UI default — it reflects a design commitment: the platform does not presume that reciprocal accounting is the right frame for community exchange.

**What time credits are for:** When they are used, credits are a functional coordination mechanism for managing access to things that need scheduling or that have genuine capacity constraints. Think of them less as a currency reflecting your worth to the community and more as a reservation token for shared resources. A credit balance tells you what you can request; it does not tell you who you are.

**When a neighborhood enables time credits:**

The base unit is the **hour**. One hour = one credit, regardless of contribution type — this is a deliberate equality, not a market rate.

*Using credits:*
- Requesting labor or skills from others (when the other party requests credit)
- Accessing resources registered with a credit rate
- Drawing on the Commons Fund (see below)

*Accumulating credits:*
- Completing exchanges where the other party offered credit
- Facilitating governance Decisions (optional credit, Steward-configured)
- Credits are neighborhood-local — non-transferable to other neighborhoods in Phase 1

*Credit rules:*
- Credits cannot be bought with money (this is not a market; it is a commons)
- No minimum credit balance required to participate in any platform layer — credits never gate access
- Credits support half-increment precision: 0.5 credit = 30 minutes
- Credits do not accumulate indefinitely: a neighborhood-configured ceiling (default: 40 hours) prevents hoarding. Credits above the ceiling are automatically contributed to the Commons Fund, not lost.
- No credit expiry in Phase 1 below the ceiling

**On gift exchanges:** Any exchange can be marked as a gift — no credits requested or offered, by either party. Gift exchanges are logged in both parties' Stewardship Records as a distinct category (gift, not credited exchange). This supports cultural traditions of giving without transactionality, honors the reality that not all care should be metered, and is the default for all exchanges in neighborhoods that haven't enabled credits.

**Architectural separation of gift and credit:** Gift exchanges and credit-tracked exchanges are architecturally separate — different data objects with no foreign keys between them. A gift exchange cannot be "upgraded" to a credit exchange through any platform pathway. This separation is enforced in the data model, not just the interface. The goal is to ensure that the accounting logic of the credit system cannot creep into the gift economy as the platform evolves. If a future developer can trivially link a gift exchange to a credit balance, the firewall has failed.

**Commons Fund:**
- Credits above the neighborhood ceiling and voluntary credit donations go to a Commons Fund
- The Fund can be drawn on through a governance Decision to support neighborhood projects, cover costs for low-capacity neighbors, or seed new resources
- Anonymous members cannot vote in governance Decisions, including Commons Fund allocations. To ensure their interests are represented: Stewards may submit a Perspective on behalf of anonymous members in any Fund allocation Decision, with the anonymous member's consent. This is the designated channel for their input.
- The Commons Fund balance and all allocation Decisions are visible to all members

### Exchange Coordination Protocol

All coordination between parties — whether for a Registry resource, a Need, or an Offer — uses a structured **Exchange Request** rather than a message thread. The goal is to resolve most exchanges in one or two touches, not a conversation.

**Exchange Request fields (submitted by the requesting party):**
- When do you need it? — date/time or "flexible"
- For how long? — duration or "open-ended"
- Any details? — short free text, optional (e.g. "I'll pick up from your porch" or "I need help moving a sofa")

**Receiving party has three options:**

1. **Approve** — one tap. Exchange is confirmed. Both parties are notified. Completion confirmation is queued (see below).
2. **Counter** — sends back a structured response with adjusted terms (*"I have it logged out until Thursday, available from Friday"*, *"I can do 2 hours but not 3"*). Maximum one counter per exchange before it routes to conversation. Counters use the same structured fields, not free text.
3. **Start a conversation** — opens a scoped, purpose-bound thread tied to this specific exchange. The thread exists only while the exchange is active and closes when the exchange is confirmed, declined, or expires. No general inbox. No persistent DMs. No use outside this exchange.

**Anonymous members** use the same protocol. Their pseudonym appears to the other party; their identity link is never exposed.

**Exchange completion:**
1. The initiating party marks the exchange complete in the platform
2. The receiving party confirms (or disputes within 48 hours)
3. On mutual confirmation: credits transfer (if applicable), exchange is logged in both parties' Stewardship Records
4. If one party confirms and the other doesn't respond within 48 hours: the system sends a reminder. After a further 48 hours of no response, a Steward alert is triggered. Credits are not auto-transferred without mutual confirmation.

**Registry-specific:** When a resource is checked out via Exchange Request, it is automatically marked "on loan" in the Registry until the exchange is confirmed complete. This prevents double-booking and keeps the Registry accurate without manual Steward intervention.

### Functional Requirements

- Members can view their current balance and full transaction history
- Exchange completion requires confirmation from both parties (no auto-crediting)
- Commons Fund balance and allocation decisions are visible to all members
- Commons Fund drawdown requires a governance Decision (using Layer 3)
- Credit methodology (1 hour = 1 credit, no market rate differentiation) is published and non-configurable in Phase 1

**Acceptance Criteria:**
- A member can complete a time credit exchange with 3 or fewer steps after the in-person exchange occurs
- Credit balances are updated within 1 hour of mutual confirmation
- Commons Fund balance is visible on the neighborhood dashboard at all times

---

## UX Principles

These principles override individual feature decisions when there is tension.

- **Slow UX.** No urgency cues, no red badges, no engagement hooks. The platform respects that neighbors have lives outside it.
- **Action over expression.** Every interaction should move toward a concrete outcome (a resource accessed, an aid exchange completed, a decision made). Not toward a post or a reaction.
- **Invisible-first design.** The platform exists to surface what's already present in the neighborhood, not to create new content. It reveals; it doesn't generate.
- **Contribution over popularity.** No like counts, no follower counts, no engagement metrics exposed to users. Status comes from doing, not from being visible.
- **Lurking is legitimate.** Most members will read more than they post. This is normal and healthy. The platform does not treat passive presence as a problem to solve, a streak to break, or an engagement gap to close. Silent members who read Decisions, browse the Registry, or check open Needs are participating. Quorum rules reflect this.
- **Non-participation is legitimate.** Some members will join and never do anything. This is their right. The platform does not pursue, guilt, or remove them. Their presence in the neighborhood is real even if their platform presence is absent.
- **Gentle first-contribution on-ramps.** For members who have never posted, the platform surfaces a single, specific, low-friction nudge: *"You haven't added a resource yet — here's one thing you could add in 2 minutes."* One nudge. No guilt mechanics, no streak counters, no "you haven't logged in in 7 days." The on-ramp is an invitation, not a demand.
- **Shame reduction by design.** Posting a Need is the hardest action in the platform. The UI frames Needs as community contributions, not admissions of weakness. The language throughout is neutral and warm — not transactional. There are no public metrics that expose who is a net receiver. Receiving is never surfaced as a deficit.
- **Design for distrust.** Some neighbors will arrive with legitimate reasons not to trust platforms, institutions, or their neighbors. The design earns trust incrementally: no data is requested before it's needed, privacy controls are visible and immediate, and members can participate meaningfully before they are asked to be fully identified. The platform does not assume good faith; it creates conditions for it to develop.
- **Cultural flexibility.** The default framing — contribution, time credits, structured deliberation — reflects certain cultural assumptions. Neighborhoods should be able to configure language, categories, and process to match their own cultural norms. The platform does not impose a single frame for what community looks like.
- **No dark patterns.** No auto-notifications, no FOMO mechanics, no countdown timers, no growth loops embedded in the product.
- **Exit is a right.** Members can export all their data and leave at any time. This is not a lock-in platform.
- **Local and legible.** The platform should be comprehensible to a neighbor who has never used a civic tech tool before. Complexity should live in the back end, not the interface.
- **Offline equivalents exist.** Every core workflow has a documented offline equivalent — a way to accomplish the same coordination without the software. These are provided as physical artifacts to communities at onboarding, alongside the digital platform. The 5-phase governance protocol has a facilitation card deck equivalent. The Registry has a paper format. The Needs & Offers board has a physical analogue. Communities that begin with the offline format and adopt the software as an augmentation when they are ready will have a fundamentally different (and healthier) relationship to the platform than those who start from the software. The offline equivalents are not fallbacks — they are proof that the platform is augmenting human capacity, not replacing it.

---

## Technical Requirements

### Architecture

- **Web-based SPA** — mobile-responsive; native app consideration deferred to Phase 2
- **Self-hostable** — open-source (AGPL), documented deployment for neighborhood groups with technical capacity
- **Hosted deployment** — Local Commons-managed instance for Phase 1 pilot neighborhoods (no self-hosting required for pilots)
- **PostgreSQL** — relational model for registry, exchanges, stewardship records, and governance objects
- **Text-first** — low compute requirements; no recommendation algorithms or engagement models in Phase 1

### Data Model (Key Entities)

```
Neighborhood
  ├── Members
  │     ├── StewardshipRecord
  │     └── CreditBalance
  ├── Resources (Registry)
  │     └── CheckoutLog
  ├── NeedsOffers
  │     └── ExchangeLog
  ├── Decisions
  │     ├── Perspectives
  │     ├── DecisionRecord
  │     └── CivicMemoryTimeline
  ├── CommonsCharter
  └── CommonsFund
```

### Identity and Authentication

- Magic link authentication (email) for Phase 1 — no passwords created at join time
- No third-party OAuth (Google, Facebook) — reduces data leakage and platform dependency
- Pseudonyms allowed for all membership tiers; full unaccountable anonymity is not supported

### Member Joining Flow

All membership — regardless of path — requires a vouch from at least one active member. No one joins without a voucher. The neighborhood's Registry, Needs board, and member list are invisible to unverified visitors.

**Self-initiated (primary path):**

1. Person discovers the neighborhood via a shareable join link (neighborhood-specific URL, not publicly indexed — shared by members, posted at events, printed on the weekly summary)
2. Enters a name or pseudonym
3. Searches for and selects one or more existing members they already know as their voucher(s)
4. Chooses their visibility level:
   - **Full member** — name or pseudonym visible to the neighborhood; full access to all layers
   - **Anonymous** — platform records no identifying information; only the voucher holds the identity link out-of-band
5. If anonymous: platform prompts — *"Let [voucher name] know you've requested to join so they can confirm your identity with you directly. Local Commons will not hold this information."* Confirmation happens outside the platform (in person, by phone).
6. Selected vouchers receive an in-platform alert and email: *"[Name/pseudonym] says they know you and would like to join [Neighborhood]. Can you vouch for them?"*
7. One confirmed vouch admits them. If no one vouches within 7 days, the request expires with a notification to the requester.
8. Growth rate cap check: if accepting would double membership within 30 days, the invite is queued. Requester is notified: *"Your request is confirmed — you'll be added once the neighbourhood's onboarding window opens."*

**Steward-initiated (outbound outreach):**

For people who haven't found the platform yet. Steward shares the join link directly (by message, in person, or via the Launch Kit). The recipient follows the same self-initiated flow from step 2 and makes their own anonymity choice. The Steward is pre-selected as the voucher if the link was sent personally; otherwise the person selects their own.

**First login onboarding (3 screens):**

1. Confirm name or pseudonym
2. Read and acknowledge the Commons Charter
3. First-contribution nudge: one specific, low-friction action based on what the neighborhood currently needs most (e.g. *"The Registry has 12 tools but no skills listed — do you have a skill you'd share?"*)

### Privacy and Data

- All neighborhood data is scoped to the neighborhood — no cross-neighborhood data sharing in Phase 1
- Trust scores and contribution records are not shared outside the neighborhood
- Members can export their full data at any time (Markdown and JSON)
- No advertising, no analytics sold, no behavioral data monetized
- GDPR-compliant data handling; right to deletion supported

### Notifications

- No real-time push notifications in Phase 1
- In-platform notification center (checked by the user, not pushed)
- Optional email digest: configurable cadence (daily / weekly / off); default weekly
- Email digest contains: new resources in Registry, open Needs in zone, active Decisions approaching deadline, Credit balance summary

### Internationalisation

- Phase 1 ships in English only
- Spanish language support is a fast follow (Phase 1 post-launch)
- i18n architecture is built from day one: no hardcoded strings, locale-aware date/number formatting, translation-ready component structure
- Community-contributed translations are the scaling model — neighborhoods that need a language maintain it via a community translation layer (Weblate or equivalent)
- Local Commons is never the bottleneck on translation quality or coverage

### Offline and Low-Tech Access

Not all neighbors have reliable smartphone access or digital literacy. Local Commons bridges this gap without requiring SMS infrastructure in Phase 1.

**Phase 1:**
- **Organizer-as-proxy** — Stewards can act on behalf of members: registering resources, posting needs, confirming exchanges. The platform is digital; the access layer is human.
- **Printable weekly summary** — The Registry and open Needs auto-generate a printable one-page summary that Stewards can post physically (community board, laundromat, garden gate). Contents: top 10 most recently added Registry items + all open urgent Needs + remaining open Needs sorted by deadline, truncated to fit one page. Stewards can pin specific items to always appear. Read-only, but keeps non-digital members informed and able to participate via organizer proxy.

**Fast follow (Phase 2):**
- **SMS interface** — Lightweight SMS layer for highest-frequency actions: claiming an open Need, confirming an exchange, checking credit balance. No smartphone required.

### Performance Targets

- Page load < 2s on 4G mobile for core views (Registry, Needs/Offers, Decisions)
- Exchange confirmation flow < 5 steps end-to-end
- Neighborhood onboarding (first 5 members + first resource registered) achievable in < 30 minutes with no technical support

---

## Neighborhood Launch Protocol

The cold start problem kills neighborhood platforms. Local Commons addresses it with a structured, three-part launch protocol that gives every new neighborhood a functional-feeling system on day one.

### Part 1: Organizer Pre-Seeding

Before inviting anyone, the founding Steward pre-populates the Registry with 10-15 resources — their own tools, spaces, skills, and any they've confirmed with close neighbors in advance. The Registry should feel alive before the first member joins. An empty Registry signals abandonment; a seeded Registry signals possibility.

Local Commons provides a **Pre-Seed Checklist** during onboarding: a guided list of the most commonly shared resource categories to prompt the organizer ("Do you have a drill? A ladder? A sewing machine? A spare room for meetings?").

### Part 2: Structured Launch Event

Local Commons provides a **Neighborhood Launch Kit**: a facilitated 90-minute in-person event format for the first gathering. The event structure:

1. **Why we're here** (15 min) — Organizer explains the commons model and what Local Commons is for
2. **What we have** (20 min) — Each attendee registers one resource on their phone while together
3. **What we need** (20 min) — Each attendee posts one open Need or Offer
4. **First Decision** (20 min) — The group opens their first governance Decision: "What are our shared agreements?" — beginning the Commons Charter
5. **What's next** (15 min) — Organizer explains the weekly digest and how to invite remaining neighbors

Outcome: every attendee has used all three primary layers before they leave. The neighborhood has a seeded Registry, live Needs, and an open Decision. Critical mass is structural, not hoped for.

### Part 3: Import from Existing Tools

For neighborhoods migrating from existing tools (a shared spreadsheet, a WhatsApp group's pinned resources, an Airtable), Local Commons provides:

- **CSV import** for the Registry (fields: type, title, description, steward name, availability)
- **Bulk Need import** from a CSV (for mutual aid networks with existing request logs)

Import is available during onboarding and at any time after. It converts existing data into Local Commons objects rather than requiring manual re-entry.

---

## Business Model

Local Commons is sustained by the neighborhoods and organizations that use it — not by advertising, data monetization, or grant dependency.

### Revenue Model

**Hosted SaaS — neighborhood tier**
Individual neighborhoods pay a modest monthly subscription for the Local Commons-hosted instance. Pricing is sliding scale based on neighborhood size and self-reported capacity. A free tier exists for low-income communities and pilot neighborhoods.

Indicative pricing (to be validated with pilots):
- Free tier: up to 30 members, 90 days full feature access, then prompt to upgrade. Governance and Credits are included — these are core to the product, not premium add-ons.
- Standard: $20-40/month, full feature access, up to 150 members
- Community: $40-80/month, up to 500 members, printable exports, SMS fast follow

**Institutional licensing — organizational tier**
Housing co-ops, community land trusts, mutual aid networks, and similar organizations pay an organizational rate that covers multiple neighborhoods or internal working groups. Individuals within these organizations never pay directly.

Indicative pricing: $150-400/month depending on member count and feature tier.

### Grant Strategy

Grants are used as runway — to fund the Phase 1 build and first pilot cohort — not as a primary revenue model. Grant dependency is a documented failure mode of civic tech; Local Commons plans to be grant-seeded and SaaS-sustained.

Target grant sources: commons infrastructure funds, civic tech foundations, housing cooperative networks, municipal innovation programs.

### On Unpaid Steward Labor

Local Commons runs on the labor of neighborhood Stewards — the organizers who seed the Registry, run the Launch Kit, act as proxies for non-digital neighbors, manage conflicts, and keep the community alive. This labor is not compensated by the platform. That is worth naming honestly.

The platform is designed to reduce this burden, not increase it. Every feature that allows members to self-serve — self-initiated joining, direct Exchange Requests, self-facilitated Decisions — is one fewer task for a Steward. But organizing has irreducible human elements — the relationship-building, the hard conversations, the showing up — that no platform can automate away.

The institutional pricing tier exists partly in recognition of this: organizations using Local Commons at scale should pay for the value it creates, and that value includes the labor of the people making it work locally. In Phase 3, the roadmap includes exploring whether Commons Fund credits or organizational stipends can provide at least symbolic compensation for Steward labor. This is not a solved problem. It is a named one.

### What Local Commons Will Never Do

- Sell behavioral data or analytics
- Run advertising of any kind
- Accept funding from property developers, real estate interests, or surveillance technology companies
- Make the platform functionally unusable without payment (free tier is genuinely functional)

---

## Legal Considerations

Local Commons facilitates real-world exchanges of physical objects, labor, and value. This creates legal exposure that must be addressed before launch.

### Platform Posture: Facilitator, Not Party

Local Commons is a coordination layer. Exchanges happen between members; the platform is not a party to them. Terms of Service make this explicit: Local Commons does not own, store, insure, or guarantee any resource, exchange, or service listed on the platform. Disputes are between members, not between members and Local Commons.

### Community Liability Covenant

The Commons Charter — which every member agrees to on joining — includes a mutual liability agreement: members participating in exchanges accept shared community risk, consistent with how tool libraries, food co-ops, and community gardens have operated for decades. This is not legally airtight, but it establishes intent, norms, and community-level accountability.

### Legal Review Required Before Launch

Two areas require legal counsel before Phase 1 launches:

1. **Time credits and the Commons Fund** — In some jurisdictions, alternative currency systems or community funds may trigger financial regulation (money transmission, securities, taxation). The credit system must be reviewed by a lawyer familiar with alternative economy models before launch.

2. **Data protection** — GDPR compliance is stated; it must be verified by legal review, particularly for the organizer-held anonymous membership model and cross-border data handling.

### High-Risk Resource Guidance (Phase 2)

For high-value or high-risk resources (power tools, vehicles, shared spaces), Phase 2 will provide guidance for neighborhoods that want to establish a legal entity (unincorporated association, cooperative) as a liability wrapper. Local Commons provides templates and guidance; it does not provide the entity.

---

## Distributed Stewardship

Local Commons has no single organizer role. The platform distributes stewardship from day one to prevent the single-point-of-failure that collapses most neighborhood platforms when a founding organizer moves, burns out, or has a falling out.

### Steward Role

Any neighborhood can have multiple **Stewards** — members with elevated operational visibility and responsibilities. Stewards:

- Receive organizer-only conflict and issue alerts
- Can act as proxy for non-digital members
- Have access to the organizer dashboard (unmet needs, resource utilization, participation data)
- Can vouch for new members and manage membership

Stewards have **no elevated governance authority**. They cannot make decisions on behalf of the neighborhood, override the Commons Charter, or close Decisions unilaterally. Their additional access is operational, not political.

**Emergency actions:** Stewards may take emergency actions (removing a resource from the Registry, suspending a member's access, escalating a conflict) when immediate harm is at stake. All emergency actions are automatically logged in Civic Memory with a timestamp and the acting Steward's identity. Every emergency action must be ratified or reversed by the neighborhood through a governance Decision within 72 hours. An unratified emergency action that expires automatically triggers a Decision to review it. This prevents Steward authority from expanding through accumulated emergency precedent.

### Steward Succession

Stewardship is a platform role, not a person. When a Steward leaves:

- The neighborhood is notified via digest that Steward capacity has changed
- Any full member can be nominated as a new Steward through a governance Decision
- If a neighborhood drops to zero Stewards, the system prompts the most active member(s) to consider taking on the role. "Most active" = highest logged actions in the past 90 days per the contribution ledger; if tied, both are prompted.

There is no "founder lock" — the person who created the neighborhood has no permanent authority that cannot be revoked through normal governance.

### Power Dynamics and Exploitation Prevention

The Steward role creates a real power asymmetry. Stewards see more, know more, and have more platform access than regular members. In a neighborhood with pre-existing social inequalities — by class, race, tenure, disability, or language — the Steward role will tend to be filled by the most privileged members unless that tendency is actively counteracted.

Local Commons does not solve this structurally. But it names it:

- Steward access is operational, never political. Stewards cannot make governance decisions unilaterally; the whole neighborhood can.
- Multiple Stewards are required where possible. Single-Steward neighborhoods are fragile and concentrate visibility in one person.
- Any member can initiate a governance Decision to change, add, or remove a Steward at any time.
- The emergency action ratification window (72 hours) means no Steward can act unilaterally without accountability.

**Burnout as structural, not individual.** Steward burnout is the highest-probability failure mode in this platform. It presents as a personal failing — the organizer "couldn't keep up" — but is almost always structural: one or two people absorbing the coordination costs of an entire community's inaction. The mitigation is not resilience training for Stewards. It is designing the platform to distribute load, making member self-service the default, and naming the problem visibly rather than optimizing around it.

The Organizer Dashboard tracks Steward action counts. If one Steward's logged actions in the past 30 days are more than 3× any other active Steward, the dashboard surfaces a load distribution alert: *"One Steward is handling most of the coordination work. Consider redistributing roles or recruiting additional Stewards through a governance Decision."*

---

## Ecological and Non-Human Stakeholders

Neighborhoods exist within ecosystems — watersheds, soil, urban tree canopies, wildlife corridors, native plantings, microclimates shaped by decades of human activity. These systems are not background; they are the commons that all other commons depend on. A neighborhood that depletes its soil, removes its canopy, or poisons its watershed is governing its own future impoverishment.

### Why This Section Exists

Most commons governance frameworks — including most digital platforms — treat the non-human world as a resource to be managed, a backdrop to human activity, or a constraint to navigate. Local Commons is attempting something different: treating the local ecosystem as a stakeholder with interests that must be named in governance decisions that affect it.

This does not mean the platform takes a position on how neighbors should manage their land. It means that decisions affecting the non-human commons — pesticide use in a shared garden, tree removal from common land, construction on a floodplain, water use during drought — cannot be made as if the ecosystem has no stake in the outcome.

### Governance Requirements

All Decisions affecting land, outdoor shared spaces, water use, or non-human life must include **Ecological Impact** as a named scope consideration during the Attention phase. The facilitator is prompted: *"Does this decision affect the local ecosystem — soil, water, tree canopy, wildlife, or shared outdoor space? If so, name it in scope."*

If the facilitator confirms ecological impact, the governance wizard:

1. Adds **"Ecological / Place"** as a seventh Perspective lens type for this Decision (alongside the default six)
2. Prompts for at least one Perspective of this type before the Integration phase can close
3. Includes an ecological impact note field in the Decision Record

This is not a veto. The neighborhood may make decisions that are ecologically harmful. The requirement is that they make those decisions knowingly, with the impact named and recorded in Civic Memory.

### Land Stewardship Categories in the Registry

The Resource Registry includes a **Land** resource type with stewardship-oriented subcategories:

- Shared garden beds
- Fruit tree access / food forest
- Composting areas
- Shared outdoor gathering space
- Habitat patches / wildlife corridors *(awareness-only — cannot be checked out or reserved)*

The "Habitat patches / wildlife corridors" category exists to make non-human claims on space visible to human decision-making. It has no checkout function.

### What the Platform Cannot Do

The platform cannot give the ecosystem a voice. It cannot measure ecological health, surface biodiversity data, or know whether a neighborhood's decisions are causing cumulative harm. These are real limitations.

What it can do:

- Require that ecological impacts be named in governance, not silently assumed
- Provide a category for non-human presence in the Registry
- Create a Civic Memory record of decisions that affected the local ecosystem

Connecting Local Commons to bioregional data (watershed health, urban forest canopies, urban heat island data) is a Phase 3+ consideration requiring partnerships with ecological monitoring organizations.

---

## Conflict and Harm Resolution

Local Commons facilitates real exchanges between real neighbors — and where people interact around material resources, power, and shared space, conflict will occur. The platform does not adjudicate conflict. But it cannot pretend conflict doesn't happen or route it entirely outside the system.

### The Platform's Role

Local Commons is a coordination layer, not a court. Its role in conflict is:

1. **Signal** — surface patterns to Stewards without public accusation
2. **Hold process** — provide a governance path for conflicts that require collective resolution
3. **Not escalate** — avoid creating public confrontations, adversarial ratings, or permanent marks on a member's record

The platform explicitly does not:

- Determine who is right in a dispute
- Publish accusation, flag, or bad-actor labels on member profiles
- Provide a mechanism for one member to publicly rate or negatively review another
- Mediate interpersonal conflict directly

### Steward Role in Conflict

When the system surfaces a conflict alert, Stewards are prompted to check in informally, in person, before any platform action. Most conflicts resolve at this level. The Steward's job is to understand what happened, not adjudicate it.

If the conflict involves a Steward, the alert goes to all other Stewards. If there is only one Steward, the alert goes to the neighborhood's longest-tenured active member who is not a party to the conflict.

### Restorative Process Path

For conflicts the informal check-in does not resolve, Local Commons provides a structured restorative process path through the governance layer, with specific configuration:

- **Decision type: Conflict Resolution** — named and scoped differently from ordinary Decisions
- Affected parties are scoped to the parties involved and any directly affected members (not the whole neighborhood)
- The Perspecting phase uses a modified lens set: **Impact**, **Needs**, **Context**, **Path Forward** — replacing the standard six lenses
- Minimum deliberation window is 14 days (double the standard), giving time for in-person process to develop alongside the platform process
- Decision Records for Conflict Resolutions are visible to all members but summarized at a higher level — specific allegations or personal details are not required in the public record

This process is available but not mandatory. Parties may resolve conflict entirely off-platform. The platform path is an option, not a requirement.

### What Cannot Be Resolved by Platform Governance

- **Safety threats** — A member who poses an immediate safety risk may be suspended by a Steward as an emergency action (see Distributed Stewardship). The 72-hour ratification process still applies.
- **Serious crimes** — Local Commons does not have a role in criminal matters. Stewards are not equipped to investigate allegations of serious harm; attempting to do so would cause harm. The platform's role is limited to access management (suspension, removal) while formal processes are engaged.
- **Historical harm** — Conflicts rooted in pre-existing community trauma, historical discrimination, or structural power imbalances between groups cannot be resolved by platform governance. Local Commons is not a truth and reconciliation process. The most the platform can do is name these dynamics when they affect governance (Equity lens in Perspectives) and ensure the governance process itself does not amplify historical harm through structural exclusion.

### Harm to Anonymous Members

Anonymous members have reduced recourse. They cannot participate in governance Decisions, which means they cannot directly participate in a Conflict Resolution Decision. If an anonymous member is harmed, their recourse is through their voucher — who can participate in the platform on their behalf — or through off-platform process. The voucher relationship was designed partly for this: the voucher is accountable for the member's standing in the neighborhood and is the appropriate contact for anything the anonymous member cannot navigate directly.

### What the Platform Records

All dispute flags, emergency actions, and Conflict Resolution Decisions are logged in Civic Memory. Members who are the subject of a formal Conflict Resolution Decision are named as affected parties in that Decision's record. A member removed through a governance Decision retains their data export right and receives the Decision Record documenting the removal process.

---

## Phased Roadmap

### Phase 1: Foundation (4-5 months)

**Goal:** Prove that neighborhoods will use the coordination stack, and that the stack creates meaningful exchanges.

**Ships:**
- Neighborhood onboarding wizard (fuzzy boundary, charter, governance profile, pre-seed checklist)
- Neighborhood Launch Kit (90-minute event format + facilitation guide)
- CSV import for Registry and Needs migration
- Resource Registry (register, browse, request, checkout, return)
- Needs & Offers (post, claim, confirm, expire, urgent flag)
- Lightweight Governance (Decisions, Perspectives, Decision Records, Civic Memory)
- Stewardship Record (activity logging, optional neighborhood-configured recognition, Steward-only conflict alerts)
- Time Credit system (earn/spend on exchanges, Commons Fund)
- Anonymous membership tier (organizer-vouched, scoped access)
- Distributed Stewardship (multiple Stewards, succession mechanism)
- Organizer-as-proxy + printable weekly Registry/Needs summary
- Gentle first-contribution on-ramp nudge
- In-platform notifications + weekly digest
- i18n architecture (English launch, translation-ready)
- Data export (Markdown / JSON)
- Hosted deployment for 3-5 pilot neighborhoods

**Pilot neighborhoods:** The pilot cohort must include two distinct community types:

1. **Organized community pilots** — community gardens, housing co-ops, and established mutual aid networks with existing coordination habits that Local Commons can augment. These pilots validate core functionality.

2. **Structural barriers pilot** — at least one pilot neighborhood must be a community with no prior digital coordination infrastructure and significant structural barriers to participation: language access challenges, economic precarity, low digital literacy, historical distrust of institutions, or a combination. This is a design constraint, not a diversity add-on. Features that pass organized-community pilots but fail this pilot reveal equity problems that must be caught in Phase 1. A platform calibrated only for communities with existing organizing capacity will underserve the communities that most need better coordination infrastructure, and that failure will be invisible until it is too late to correct without a full redesign.

### Phase 1 Fast Follows (post-launch, pre-Phase 2)

Short-cycle additions once Phase 1 is live and stable:
- Spanish language support (community-contributed translation layer)
- SMS interface for highest-frequency actions (claim Need, confirm exchange, check balance)

### Phase 2: Depth and Trust (3-4 months post-Phase 1 validation)

**Goal:** Deepen the trust and economy layers; add verification, group sub-structures, and emergency coordination.

**Ships:**
- Vouching system (human accountability chain for anonymous members)
- Trust-weighted governance options (configurable per neighborhood)
- Sub-groups within neighborhoods (tool library, garden, etc.) with own Registry sections and governance profiles
- Richer Local Economy: skill-specific credit rates (optional, configurable)
- Emergency Mode — neighborhood-wide state shift with immediate broadcast to all members for acute crises. Spec TBD in Phase 2 planning. Phase 1 urgent flag UI should use a visual treatment that can coexist with a future neighborhood-wide alert state — avoid consuming the full red/alert color palette for urgent Needs.
- Mobile-responsive improvements; PWA for offline-tolerant use
- Organizer dashboard: unmet needs trends, resource utilization, governance participation
- Legal entity guidance and templates for high-risk resource sharing

### Phase 3: Federation and Ecosystem (6+ months post-Phase 2)

**Goal:** Connect neighborhoods; open the platform to the broader Integral Commons ecosystem.

**Ships:**
- Neighborhood federation (adjacent neighborhoods can share resources or run joint decisions)
- Mutual aid network bridges (cross-neighborhood Need/Offer matching for overflow capacity)
- Integral Commons ecosystem integration: CommonGround governance profiles, Personal Commons Vault connections
- Governance profiles library (community-contributed neighborhood profiles)
- API for integration with existing tools (Open Food Network, etc.)

---

## Accessibility

Local Commons targets **WCAG 2.1 Level AA** compliance across all core flows.

Specific requirements:
- All interactive elements are keyboard-navigable and have visible focus states
- Colour is never the sole means of conveying information (applies to recognition signals, urgent Need styling, and quorum indicators)
- Minimum contrast ratio of 4.5:1 for body text, 3:1 for large text and UI components
- All images and icons have descriptive alt text
- Form fields have associated labels; error messages are associated with their field
- Screen reader compatibility tested against VoiceOver (macOS/iOS) and NVDA (Windows) for Phase 1

Accessibility is a Phase 1 requirement, not a Phase 2 retrofit. The printable weekly summary must also meet print accessibility standards (sufficient font size, high contrast, no colour-only encoding).

## Browser and Device Support

**Phase 1 targets:**

| Context | Minimum support |
|---|---|
| Desktop browsers | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ |
| Mobile browsers | Chrome for Android 120+, Safari iOS 16+ |
| Screen size | 320px minimum width (small Android phones) |
| Connection | Functional on 4G; core flows must not require >500KB page weight |

Progressive enhancement: core flows (browse Registry, post a Need, confirm an exchange) must work without JavaScript for resilience on slow or degraded connections.

Native app is explicitly out of scope for Phase 1.

## Data Retention and Deletion

**Retention policy:**
- Active member data: retained while the member is active and for 2 years after last activity
- Deleted accounts: personal identifying information removed within 30 days of deletion request; contribution records are anonymised (not deleted) to preserve Civic Memory integrity
- Neighborhood data (Decisions, Records, Registry, Exchange logs): retained for the life of the neighborhood instance; exported and deleted within 90 days of a neighborhood formally closing
- Backups: retained for 90 days, encrypted at rest

**Right to deletion (GDPR Article 17):**
- Members may request full account deletion at any time via account settings
- Deletion removes: name/pseudonym, email, identity link (if full member), contribution history
- Deletion anonymises but does not remove: Decision Records, Exchange logs, Civic Memory entries the member contributed to — these are the neighborhood's collective record, not the individual's
- Anonymous members' data: only the platform-side pseudonym and access logs are deleted; the identity link held by their voucher is outside platform control and cannot be deleted by Local Commons

**Backup and recovery:**
- Daily automated backups, encrypted at rest, stored in a separate region
- Point-in-time recovery to within 24 hours
- Recovery time objective (RTO): 4 hours; Recovery point objective (RPO): 24 hours

## Security Requirements

Baseline security requirements for Phase 1:

**Authentication:**
- Magic links expire after 48 hours and are single-use
- Sessions expire after 30 days of inactivity
- No passwords stored — magic link only in Phase 1

**Input validation:**
- All user inputs sanitised server-side; no client-side-only validation
- Maximum field lengths enforced for all text inputs
- File uploads (Registry photos): type and size validation server-side; no executable formats accepted

**Rate limiting:**
- Magic link requests: maximum 5 per email address per hour
- Exchange Requests: maximum 20 per member per day (prevents spam)
- Governance actions: maximum 3 new Decisions opened per member per week

**Steward action audit log:**
- All Steward-level actions (emergency actions, proxy submissions, membership changes) are logged with timestamp, actor identity, and action type
- Logs are append-only, visible to all Stewards, and included in data export

**Data in transit:** TLS 1.2+ for all connections; HSTS enforced.

**Dependencies:** Third-party dependencies reviewed before inclusion; no analytics SDKs, advertising pixels, or tracking scripts.

## Notification Specification

### Member Digest (weekly default)
- New resources added to the Registry in your zone
- Open Needs in your zone, sorted by urgency then deadline
- Active Decisions approaching their deliberation deadline
- Your current credit balance and any pending exchange confirmations
- First-contribution nudge (shown only until the member has made their first contribution)

### Member Immediate Notifications (in-platform only, no email push)
- Exchange Request received
- Exchange Request approved, countered, or declined
- Vouch request received
- Urgent Need posted in your zone
- You have been named as a scope-affected party in a new Decision
- Your Decision has reached a quorum milestone

### Steward Digest (weekly, additive to member digest)
- Unmet Needs over the past 30 days (Needs that expired unfulfilled)
- Resource utilisation rate (% of Registry items accessed in past 90 days)
- Governance participation rate for active Decisions
- Growth rate cap status (if approaching the 30-day doubling limit)
- Any pending emergency action ratifications

### Steward Immediate Notifications (in-platform + email)
- Conflict or issue pattern alert (private, not visible to other members)
- Emergency action 72-hour ratification reminder (24 hours before expiry)
- Exchange confirmation dispute unresolved after 48 hours
- Membership request received (self-initiated join)

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Adoption friction — neighbors don't switch from WhatsApp | High | High | Launch alongside, not instead of, existing tools; Neighborhood Launch Kit drives first engagement in-person |
| Cold start — Registry seeded but unused after launch event | High | Medium | Pre-seed checklist; track checkout rates not registration rates; fast follow with organizer dashboard showing dormancy |
| Organizer burnout / departure | High | High | Distributed Stewardship from day one; succession mechanism; no founder lock |
| Governance capture — active minority makes all decisions | Medium | High | Quorum requirements, digest-based rhythm, 40% awareness threshold before closure |
| Trust recognition gamed — members do low-value actions to earn signals | Medium | Medium | Recognition thresholds set by volume, not single actions; organizer visibility into contribution patterns |
| Credit inequality — some neighbors can't earn credits (elderly, disabled, time-poor) | Medium | High | Commons Fund seeded to support low-capacity neighbors; urgent Need flag ensures aid flows regardless of credit balance |
| Anonymous membership abused | Low | Medium | Organizer-vouched only; organizer holds the accountability link and is responsible for the member; abuse affects organizer's standing |
| Time credits attract legal scrutiny as alternative currency | Medium | High | Legal review required before launch; facilitator-not-party posture; community covenant framing |
| Identity verification burden alienates undocumented or vulnerable neighbors | Medium | High | Anonymous membership tier available from day one; organizer vouching bypasses all address verification |
| Platform abandonment — neighborhood stops using it after 3 months | Medium | High | 6-month retention target; onboarding commitment-setting with Stewards; passive presence counts (reduces apparent churn) |
| Digital exclusion — 20-30% of neighbors have no smartphone access | Medium | High | Organizer-as-proxy and printable summary in Phase 1; SMS fast follow |
| Solo dev scope — 5 layers + 3 new sections is a lot | High | High | Phase 1 ships all layers at minimum viable depth; fast follows and Phase 2 absorb the additions; resist expansion until pilot validation |
| Credit hoarding — members accumulate credits and don't spend | Low | Medium | 40-hour cap; excess auto-donates to Commons Fund |
| Federation complexity overwhelms Phase 1 | Low | Medium | Phase 3 deferred; no federation architecture decisions in Phase 1 codebase |
| Systemic exclusion — platform structurally inaccessible to most-vulnerable neighbors | Medium | High | Anonymous tier, organizer-as-proxy, printable summary, SMS fast follow; but acknowledged as partial mitigation only |
| Platform dependency — community governance moves online and becomes unavailable without the platform | Medium | High | AGPL license + self-hostable + full data export means no vendor lock-in; community governance capacity must be maintained offline in parallel |
| Digitally mediated false community — platform activity substitutes for real relationship, creating the appearance of community without its substance | Medium | Medium | Slow UX, action-over-expression design, Launch Kit drives in-person first engagement; no fix available in software — named here as a permanent risk |
| Care commodification backfire — time credit system makes care work transactional in ways that damage it | Medium | Medium | Gift exchange option explicit in design; Commons Fund covers neighbors who cannot trade; cultural flexibility allows neighborhoods to de-emphasize credits |
| Steward burnout as structural failure — platform redistributes to Stewards rather than members, accelerating burnout | High | High | Load distribution alert in Organizer Dashboard; member self-service defaults; multiple Stewards required; burnout named as structural, not personal |

---

## What This System Intentionally Does NOT Do

Design is as much about what you refuse to build as what you build. These are the things Local Commons explicitly does not attempt, and why.

**It does not create community.** Local Commons is infrastructure. Infrastructure does not create the social fabric it supports; it makes existing fabric more functional. A neighborhood without trust, shared culture, or human investment will not become one by installing Local Commons. The platform's job is to lower the coordination cost of communities that are already trying.

**It does not replace organizers.** The platform reduces coordination overhead. It does not eliminate the need for people who hold relationships, navigate conflict, make things happen, and carry institutional memory in their heads. Stewards are not a transitional role on the way to full automation. They are a permanent part of the system. Attempting to remove them would degrade the commons.

**It does not solve equity.** Local Commons is designed with equity considerations embedded throughout — anonymous membership, shame reduction UX, receiving-as-contribution framing, the Commons Fund. None of this addresses structural inequality. A digital commons layer cannot fix housing insecurity, income precarity, racial segregation, or the systematic devaluation of care work. The platform can reduce barriers at the margin; it cannot change the conditions that create the barriers.

**It does not replace legal governance.** Local Commons governance — Decisions, Perspectives, Decision Records — is not legally binding. It is an expressive and deliberative layer. Neighborhoods with real legal authority (incorporated co-ops, legal entities, tenant associations) need their own legal processes. Local Commons can inform and support those processes; it is not a substitute for them.

**It does not maximize engagement.** The metrics in this PRD do not track page views, session lengths, post volume, or return frequency beyond what is needed to measure real coordination outcomes. The platform is not trying to make neighbors more engaged with it — it is trying to make neighbors more effective with each other. If using Local Commons less means the neighborhood is coordinating better through human relationships, that is a success.

**It does not know what's best for the neighborhood.** The platform has no editorial position on how a neighborhood should share resources, make decisions, or structure their commons. The governance profiles are defaults, not mandates. The perspective lenses are prompts, not requirements. The constitutional principles constrain the worst outcomes, not prescribe the best ones. What a healthy neighborhood looks like is the neighborhood's question to answer.

**It does not scale infinitely.** Local Commons is designed for groups of 5–200 people who know each other or could know each other — not for crowds. The features that make it useful at this scale (vouching, quorum based on affected members, Steward conflict alerts, individual exchange coordination) become dysfunctional at mass scale. This is by design. Large-scale civic coordination is a different problem that requires different tools. Local Commons is not trying to be that tool.

**It does not make difficult conversations easy.** Governance exists because people disagree about things that matter. The 5-phase protocol, Perspectives system, and Integration Summary are designed to make difficult conversations *legible* — to structure disagreement rather than suppress it. They do not make those conversations painless. A platform that made conflict comfortable would be one that was resolving it prematurely.

---

## Relationship to Integral Commons Ecosystem

Local Commons is the place-based, neighborhood-scoped product in the Integral Commons ecosystem. It is not a fork or a divergence — it is a configured bundle:

| Local Commons Layer | Integral Commons Module |
|---|---|
| Lightweight Governance | CommonGround (neighborhood profile) |
| Resource Registry | Equip (simplified, no IoT in Phase 1) |
| Needs & Offers | Stewardship and Mutual Aid module |
| Stewardship Record | Integral Commons Participation History |
| Local Economy | Kindred (time banking implementation) |

Local Commons proves the neighborhood use case. CommonGround proves the governance layer. When both have traction, Phase 3 federation bridges them into the broader Integral Commons vision.

---

## Glossary

- **Neighborhood** — The bounded geographic unit. Top-level object. Contains members, resources, decisions, exchanges, and the Commons Charter.
- **Commons Charter** — The living document of what the neighborhood has agreed to. Updated by closed Decisions.
- **Resource** — Any shareable object, space, land, or skill registered in the Registry by a member or group.
- **Need** — A time-bounded request for help, a resource, or a skill.
- **Offer** — A time-bounded offer of labor, a resource, skill, or care.
- **Decision** — A persistent, structured question the neighborhood needs to resolve collectively.
- **Perspective** — A typed contribution to a Decision (Values, Risk, Equity, Feasibility, Relational, Temporal). Not a comment.
- **Decision Record** — A structured capture of what was decided, how, and why. Required to close a Decision.
- **Civic Memory** — The timeline of a Decision's evolution: reframings, evidence, status changes, and records.
- **Stewardship Record** — A member's participation history. Automatically updated by logged exchanges, decisions, and resource activity. Descriptive, not evaluative — holds what a member has been part of, not a score of their worth to the neighborhood.
- **Time Credit** — The unit of local economic exchange. 1 credit = 1 hour of contribution, regardless of type.
- **Commons Fund** — The collective pool of overflow credits and voluntary donations, governed by neighborhood Decision.
- **Steward** — A neighborhood role held by one or more members. Stewards have elevated operational visibility (organizer dashboard, conflict alerts, proxy capabilities) but no elevated governance authority. Multiple Stewards are expected; succession is built into the platform.
- **Anonymous Member** — A member whose identity is held by an organizer, not the platform. Can access Needs & Offers and the Registry; cannot vote in governance or earn time credits without full membership.
- **Neighborhood Launch Kit** — The structured 90-minute in-person event format provided by Local Commons for neighborhood onboarding.
- **Urgent Need** — A Need flagged as time-sensitive. Surfaces at the top of the Needs list and triggers immediate in-platform notification (not digest) to members in the relevant zone.
- **Recognition Signal** — A positive contribution achievement earned by a member and visible on their profile (e.g., Active Contributor, Resource Steward). Absence of a signal is neutral, not negative.
- **Commons Fund** — The collective pool of overflow credits and voluntary donations, governed by neighborhood Decision.
- **Printable Summary** — A weekly auto-generated one-page printout of open Registry items and Needs, for posting in physical community spaces.

---

*PRD v1.2 developed through: user-provided Local Commons concept → brainstorming session (11 gaps addressed) → idea-refine sharpening pass (13 fixes applied) → product-requirements completeness audit (15 gaps resolved). Constitutional model grounded in CommonGround Constitution v3 and governance-spec.md. Next steps: pilot neighborhood identification, Phase 1 technical architecture design, Commons Charter template drafting, legal review engagement (time credits + Commons Fund), security-and-hardening pass.*
