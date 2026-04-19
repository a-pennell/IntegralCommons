# CommonGround — Product Requirements Document

**Version:** 2.0
**Date:** 2026-04-14
**Quality Score:** 88/100

---

## Executive Summary

CommonGround is a modular, open-source collective sense-making system for groups that govern shared resources. It replaces the comment-thread-and-voting model of existing governance tools with a structured deliberation process built on three core objects: Issues, Perspectives, and Decision Records.

The product embeds a constitutional governance framework — 11 principles with a two-tier hierarchy — that ensures power remains visible, contextual, and revocable. There are no fixed roles. Authority is delegated per-issue by the group and can be recalled at any time through referendum.

CommonGround is the focused MVP product within the broader Integral Commons OS (ICOS) vision. ICOS envisions a federated ecosystem spanning personal vaults, ecological stewardship, mutual aid, and more. CommonGround delivers the foundation: a system where groups can think together well enough to govern themselves.

---

## Problem Statement

**Current situation:** Groups that govern shared resources — co-ops, land trusts, collectives, boards, community organizations — struggle to:

- Make sense of complex, value-laden issues
- Hold collective memory across decisions
- Distinguish disagreement from misunderstanding
- Evolve decisions over time without re-litigating everything
- Avoid domination by the loudest or most available voices

**Existing tools fail because they focus on:**

- Voting (reduces complex issues to binary choices)
- Comment threads (unstructured, dominated by volume)
- Meetings and minutes (ephemeral, excludes asynchronous participants)

None support **ongoing collective reasoning**.

**Proposed solution:** A structured deliberation system where every issue is persistent, iteratively refined, and resolved through transparent process — with a constitutional framework that prevents power capture and ensures the group retains sovereignty over its own governance.

**Primary competitor:** Loomio and similar governance tools. CommonGround differentiates through structured perspective taxonomy, constitutional governance primitives, liquid delegation, civic memory, and (in Phase 2) AI-assisted sense-making.

---

## Product Goals

### Core Goals

1. Improve quality of collective understanding
2. Reduce cognitive and emotional load of governance
3. Preserve decision memory ("why we think what we think")
4. Make disagreement legible, not adversarial
5. Enable adaptation without fragmentation

### Non-Goals

- Maximizing engagement
- Replacing formal legal processes
- Real-time consensus enforcement
- Gamification
- National elections, mass social debate, or anonymous crowds

---

## Success Metrics (Qualitative)

Success looks like:

- Fewer meetings
- Shorter meetings
- Less re-litigation of past decisions
- Increased perceived fairness
- Reduced burnout among facilitators and stewards

**Not measured by:** DAUs, time on platform, engagement rates.

**Proof of concept:** People keep coming back to use it (retention as signal of genuine value).

---

## Target Users

### Primary Users

Small-medium groups (5-200 people) with real decision power:

- Housing and worker co-ops
- Land trusts
- Nonprofit boards
- Community assemblies
- Commons governance organizations

### Secondary Users

- Facilitators
- Governance designers
- Community organizers

### Not Designed For

- National elections
- Mass social debate
- Anonymous crowds

---

## CommonGround Constitutional Framework (v2)

The system enforces 11 governance principles organized in a two-tier hierarchy. The first tier is inviolable — no group decision can override these. The second tier is deliberable — groups can adjust these through their own governance process.

### Tier 1: Inviolable Principles

These cannot be overridden by any decision. They protect the commons, individual rights, and the group's ability to self-govern.

**Principle 8 — Removal Due Process**
Members subject to removal may participate in deliberation, may not block final decisions, and are entitled to a transparent process with defined criteria and thresholds.

**Principle 10 — Commons Protection**
No decision may privatize shared infrastructure, restrict exit rights (data, identity, participation), or undermine the revocability of governance. This principle is supreme — when it conflicts with any other principle, it wins.

**Principle 11 — Forkability**
Any group may fork the system and its governance, provided interoperability standards are maintained.

### Tier 2: Deliberable Principles

These are defaults that groups can adjust through CommonGround's own governance process, building precedent in Civic Memory.

**Principle 1 — Bootstrap**
The initial governance method is established via consent.

**Principle 2 — Revocability**
All delegations are revocable. No delegation may be made irrevocable.

**Principle 3 — Bounded Referendum Right**
Any member may initiate a referendum if supported by a minimum threshold of members or stake relevant to the decision's scope. Prevents spam and introduces signal.

**Principle 4 — Scope and Subsidiarity**
Decisions should be made at the lowest level competent to address them. Only those materially affected participate in referenda.

**Principle 5 — Temporal Stability**
Delegations and decisions have defined stability periods during which they cannot be challenged except under exceptional conditions. Prevents governance thrashing.

**Principle 6 — Rate Limiting**
Members are subject to limits on how frequently they may initiate referenda or governance actions within a given time window. Prevents overload and bad-faith actors.

**Principle 7 — Deliberation First**
All referenda must include a structured deliberation phase before voting.

**Principle 9 — Participation Integrity**
Decisions require quorum thresholds, diversity of participation (to avoid capture), and transparent rationale.

### Conflict Resolution

When deliberable principles conflict with each other (e.g., Bounded Referendum vs. Temporal Stability), the tension becomes an Issue that the group resolves through CommonGround, creating precedent in Civic Memory. Inviolable principles always take precedence.

---

## Core Conceptual Model

### Central Object: Issue / Problem Space

An Issue is:

- Persistent over time
- Iteratively refined
- Not resolved by a single vote

Each Issue flows through statuses: **Open > Exploring > Decided > Reopened > Archived**

### Authority Model: Liquid Delegation

There are no fixed roles (no admin/member class distinction). All members have equal base capabilities. Authority is contextual:

- **Facilitation** is a capability delegated per-Issue by the group
- Facilitation grants: status transitions, summary authorship, Decision Record drafting
- Any delegation is visible, time-bounded, and revocable
- The group can elect an admin through the normal decision process, but can never permanently surrender sovereignty
- Any member can call a referendum on any delegation at any time (subject to Principles 3, 5, and 6)
- Space-level actions (invites, governance changes) are resolved through Issues, not admin panels

### Bootstrap Process

1. Founder creates the space, names it, describes its purpose
2. Founder invites members
3. System opens the group's first Issue: "How should we make decisions?"
4. Founder proposes the initial governance profile
5. Members add Perspectives and may object
6. Resolved via hardcoded consent process (the one decision that uses the meta-method)
7. The result becomes the group's first Decision Record — visible, revisable, the foundation of their Civic Memory

---

## Functional Requirements (Phase 1 — MVP)

### Issue Creation and Structure

Each Issue includes:

**Required fields:**

- Title
- Scope (what is and isn't included)
- Status (Open, Exploring, Decided, Reopened, Archived)

**Structured sections:**

- Problem framing(s) — multiple allowed
- Constraints (legal, financial, ecological)
- Stakeholders (self-identified)
- Known facts / evidence
- Open questions / unknowns

**Status transitions:**

- Facilitated by the delegated facilitator for that Issue
- All transitions logged in the Civic Memory timeline
- Moving to "Decided" requires a Decision Record (system-enforced)
- Reopening requires a stated reason, visible on the timeline

### Perspectives (Not Comments)

Users submit Perspectives — first-class objects, not threaded comments.

**Default perspective taxonomy (configurable per-space):**

1. **Values** — "This matters because..."
2. **Risk** — "What could go wrong..."
3. **Equity** — "Who's affected, who's excluded..."
4. **Feasibility** — "Can we actually do this..."
5. **Relational** — "How does this affect us as a group..."
6. **Temporal** — "How does this play out over time..."

**Additional flags:**

- "Speaking from direct experience" — available on any perspective type

**Phase 1 behavior:**

- Users manually tag their perspective type (AI auto-classification comes in Phase 2)
- Each Perspective is a first-class object that can be summarized and responded to
- No deep threading — one level of response only

**Groups can:** rename types, add types, remove types, via YAML/JSON configuration.

### Decision Records

When a decision occurs, the system captures:

- What was decided
- How it was decided (consent, vote, delegation, etc.)
- Key rationales
- Unresolved objections
- Review date

A Decision Record is required to move an Issue to "Decided" status. This is system-enforced.

### Civic Memory / Issue Timeline

Each Issue has a timeline showing:

- Major reframings
- Evidence added or invalidated
- Status transitions
- Decisions
- Reopenings
- Delegation changes

Purpose: preserve "why we think what we think" — the group's institutional memory.

### Quorum System (Three-Tier)

- **Awareness quorum** — percentage of members who must have viewed the Issue before it can move to decision. Default: 60%.
- **Participation quorum** — percentage who must have added a Perspective or explicitly stood aside. Default: 30%.
- **Decision quorum** — determined by the decision method (consent requires all non-stand-asides, majority requires 50%+1 of participants).

**Stall mechanism:** If awareness quorum isn't met within the deliberation period, the system extends the period and the digest highlights the Issue. If still unmet after extension, the Issue is marked "Stalled — insufficient participation" and cannot proceed to decision.

### Manual Summaries

- Any member with facilitation delegation on an Issue can write and edit an official summary
- Summaries are versioned and visible in the Civic Memory timeline

### Notifications and Rhythm

- **No real-time notifications.** No badges, no pings, no urgency cues.
- **Quiet notification signifier** — a simple indicator that something's waiting, no counts, no red badges
- **Rhythm-based digest** — one email per member at a group-configured cadence (default: weekly). Contents: what's active, what's waiting for perspectives, what's approaching a decision point.
- Individual members can adjust digest frequency. The system never pushes beyond what the member chose.

### Spaces

- A group creates a Space, names it, describes its purpose
- Members are invited via link or email
- Governance profile is established through the bootstrap process
- All space-level configuration changes are Issues, not admin actions

### Authentication and Access

- Standard web authentication
- All members have equal base capabilities
- Facilitation is delegated per-Issue
- No global admin role (admin is an elected, revocable delegation)

### Data Export

- Full data export in Markdown and JSON
- Open formats, no lock-in

---

## Decision Method Architecture

### MVP: Consent-Based Process

The MVP ships with one decision method: **consent-based process**.

- Objections block only if they are "paramount" (argued as a reasoned concern, not just preference)
- Stand-aside is available (acknowledged but not blocking)
- The consent method is also the hardcoded meta-method for the bootstrap process

### Pluggable Architecture

The decision method layer is designed as a pluggable module. Groups select their method per-Issue or set a default. The consent method is the default.

### Future Methods (Roadmap)

Research and implementation roadmap for additional decision methods:

- **Quadratic voting** (Glen Weyl) — express intensity of preference, not just direction
- **Sociocracy / consent-based variants** — objections tested for paramountcy
- **Sortition / citizen assemblies** — random sampling to avoid self-selection bias
- **Liquid democracy** — delegatable votes per-issue
- **Deliberative polling** (James Fishkin) — informed preference after structured deliberation

Community can contribute additional methods via the open-source module system.

---

## Customization and Modularity

### Open-Source Architecture

- **License:** AGPL (or similar copyleft)
- **Modular components:** perspective types, decision methods, fields and schemas
- **Configurable via YAML/JSON**

Groups can: add fields, rename concepts, disable features, fork freely.

### Governance Profiles (Phase 3)

Optional starting-point configurations:

- Co-op profile
- Board profile
- Indigenous governance profile
- Consensus-based profile

Fully customizable. Published as community-contributed templates.

---

## UX Principles

- **Slow UX** — no urgency cues, no engagement tricks
- **No feeds** — Issues are navigated, not streamed
- **Read-first, write-second** — understand before contributing
- **Clarity over expressiveness** — structure aids understanding
- **Silence is acceptable** — not participating is a legitimate choice (but visible via quorum tracking)
- **No dark patterns** — no hidden scoring, ranking, or manipulation

---

## Technical Requirements

- **Web-based SPA** (React / Next.js)
- **Self-hostable** (AGPL code is public)
- **PostgreSQL** (or similar)
- **Text-first, low compute**
- **Optional AI services via adapters** (Phase 2+)
- **Exportable data** (Markdown / JSON)
- **Hosted deployment** for MVP (you run the instance)
- **Cooperative hosting** partnerships as medium-term goal

---

## AI Sense-Making Layer (Phase 2)

### Capabilities

- Auto-classify Perspectives by taxonomy type (users can correct)
- Cluster similar viewpoints
- Surface points of agreement
- Identify types of disagreement
- Label epistemic uncertainty ("what we don't know" comes first)
- Generate editable summaries alongside manual ones

### Hard Constraints

AI does NOT:

- Recommend decisions
- Rank people
- Predict outcomes
- Show ratios or counts ("12 support, 3 oppose")

AI outputs are:

- **Editable** — any facilitator can modify
- **Transparent** — methodology is visible
- **Equal weight** — minority positions get the same summary depth as majority positions
- **Uncertainty-first** — every summary leads with unresolved questions before areas of clarity

### Architecture

- Multi-model support (no single AI vendor dependency)
- Adapter pattern — AI services are pluggable
- Fallback: if AI is unavailable, the system works fully on manual summaries (Phase 1 baseline)

---

## Phased Roadmap

### Phase 1: The Human-Powered System (3-4 months)

- Spaces, invitations, equal membership
- Bootstrap wizard with consent-based first Issue
- Issues with full structured sections
- Perspectives with manual tagging (6 default types + experience flag)
- Manual summaries by delegated facilitators
- Decision Records (required for "Decided" status)
- Civic Memory timeline
- Liquid delegation (per-Issue facilitation)
- Three-tier quorum system with stall mechanism
- Quiet notifications + rhythm-based digest
- Hosted deployment, AGPL, data export
- Constitutional framework enforced in software (11 principles, two-tier hierarchy)

### Phase 2: AI Layer + Decision Methods

- AI perspective auto-classification
- AI clustering, agreement surfacing, uncertainty labeling
- AI-assisted editable summaries
- Decision Records with richer rationale capture
- Additional decision methods (quadratic voting, sociocracy, etc.)

### Phase 3: Federation + Ecosystem

- Governance profiles / presets (community-contributed)
- Delegation visibility and analytics
- Federation between groups
- Cooperative hosting partnerships
- Bridges to the broader ICOS ecosystem

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Over-structuring alienates users | Medium | High | Configurable schemas, sensible defaults, Slow UX |
| AI mistrust undermines sense-making layer | Medium | Medium | Full transparency, editability, opt-out, Phase 2 (not launch dependency) |
| Power capture despite constitutional framework | Low | High | Visible delegation, referendum right, Commons Protection principle |
| No pilot user — building in a vacuum | High | High | Publish governance framework first for community feedback, seek design partners actively |
| Adoption friction for non-technical groups | High | Medium | Hosted deployment, governance setup wizard, lightweight defaults |
| Tool becomes symbolic (not tied to real decisions) | Medium | High | Decision Records required for status change, Civic Memory creates accountability |
| Solo dev scope exceeds capacity | High | Medium | Phase 1 is human-powered (no AI dependency), ruthlessly narrow MVP |
| Bootstrap paradox — groups can't agree on initial governance | Low | Medium | Hardcoded consent meta-method, founder proposes, group affirms or adjusts |
| Silent majority — decisions made by small active subset | Medium | High | Three-tier quorum, stall mechanism, awareness tracking |
| Constitutional principle conflicts create gridlock | Low | Medium | Two-tier hierarchy, inviolable principles take precedence, conflicts become Issues |

---

## Two Artifacts

### 1. The CommonGround Governance Framework

A standalone, published, versioned document describing the 11 constitutional principles, the liquid delegation model, the bootstrap process, the two-tier hierarchy, and the decision method architecture.

- Publishable and citable independent of the software
- Open to feedback from governance practitioners, political theorists, and cooperatives
- Serves as thought leadership and community-building asset before software ships
- The governance framework ships first

### 2. CommonGround the Software

The reference implementation of the governance framework.

- Open-source (AGPL)
- Self-hostable
- The code embodies the framework but the framework is not code-dependent

---

## Future Vision: Integral Commons OS (ICOS)

CommonGround is the foundation layer of a broader ecosystem:

- **Personal Commons Vault** — user-controlled local-first storage for reflection and values tracking
- **Conflict Repair / Mediation Module** — perspective mapping, needs identification, guided mediation
- **Knowledge Commons** — linked, versioned, community-curated knowledge system
- **Stewardship and Mutual Aid** — coordination of care, labor, shared responsibilities
- **Ecological Commons** — bioregional awareness, environmental data, restoration tracking
- **Federated AI Guide** — pattern recognition, decision support, conflict synthesis

These modules build on CommonGround's governance primitives and are years away. The constitutional framework and deliberation system must prove themselves first.

---

## Glossary

- **Issue** — A persistent, structured problem space that a group deliberates on over time
- **Perspective** — A first-class contribution to an Issue, typed by lens (Values, Risk, Equity, Feasibility, Relational, Temporal)
- **Decision Record** — A structured capture of what was decided, how, why, and what remains unresolved
- **Civic Memory** — The timeline of an Issue's evolution: reframings, evidence, transitions, decisions
- **Facilitation** — A per-Issue delegation granting process authority (status transitions, summaries, Decision Record drafting)
- **Delegation** — A visible, time-bounded, revocable grant of capability from the group to a member
- **Space** — A group's CommonGround instance with its own governance profile and membership
- **Governance Profile** — The configurable set of rules, thresholds, and decision methods a group operates under
- **Bootstrap** — The process by which a new group establishes its initial governance through a consent-based first Issue
- **Referendum** — A member-initiated challenge to any delegation or decision, subject to threshold and rate-limiting rules
- **Quorum** — Three-tier system (awareness, participation, decision) ensuring sufficient engagement before resolution

---

*This PRD was developed through interactive requirements gathering and adversarial stress-testing. Quality score: 88/100. Remaining gaps: detailed acceptance criteria per feature, accessibility requirements, performance targets, authentication architecture, business model.*
