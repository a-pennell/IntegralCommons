# The CommonGround Protocol

**Version:** 1.0
**Date:** 2026-04-15
**Status:** Draft — open for community review
**License:** Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)

---

## What This Document Is

This is a protocol — not in the legal sense, but in the network sense. TCP/IP doesn't tell you what to say. It tells you how to connect so that saying becomes possible. This document describes how collective sense-making works: how perspectives connect, how shared understanding is built, how collective memory persists, and how the protocol itself adapts.

A constitution says what must be true. A protocol says how things connect. The CommonGround Constitution defines principles and provisions. This protocol defines the *dynamics* — the flows of attention, perspective, understanding, and memory that make collective sense-making work in practice.

This protocol is directly implementable in software. Where the constitution has an awkward relationship with code ("the software enforces Tier 1 in code" treats the software as a cop), the protocol *is* what the software implements. CommonGround the software is to this protocol what a browser is to HTTP: one implementation of the connection pattern.

---

## Protocol Overview

Collective sense-making follows a cycle. Not a rigid sequence — the phases overlap, loop back, and run in parallel — but a recurring pattern:

```
    ┌──────────────┐
    │   ATTENTION   │  Something enters the group's awareness.
    │               │  The group directs shared attention.
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ PERSPECTING  │  Members contribute partial views of reality.
    │               │  Different ways of seeing the situation are surfaced.
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │ INTEGRATION  │  Perspectives encounter each other.
    │               │  Shared understanding is constructed.
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │   DECISION   │  Understanding crystallizes into action.
    │               │  The group commits to a course.
    └──────┬───────┘
           │
    ┌──────▼───────┐
    │   MEMORY     │  The decision and its context are recorded.
    │               │  The group's collective understanding is updated.
    └──────┬───────┘
           │
           └──────────→ (next cycle)
```

Each phase has a protocol: what flows in, what flows out, what conditions must be met, and what failure modes to detect.

---

## Phase 1: Attention

**What it is:** Something enters the group's field of awareness. A member raises an issue. A pattern is detected in Civic Memory. An external event creates pressure. The group must now direct collective attention to it.

**Protocol:**

- Any member may create an **issue** — a named claim on the group's attention
- The issue specifies an initial **scope**: who is affected, and therefore who should attend
- Scope is challengeable: any member may argue they are materially affected and petition for inclusion
- The system tracks **attention distribution** — what fraction of the group's active issues are receiving engagement, and whether attention is concentrated on a few issues or distributed across many

**Outputs:**
- An issue with a defined scope
- An initial participant set (all members within scope)
- Awareness quorum tracking: what percentage of the participant set has engaged

**Failure modes to detect:**
- *Attention flooding:* So many issues are open that none receive meaningful engagement. The system surfaces an attention health warning when open issues exceed a threshold relative to active membership.
- *Attention capture:* A small number of members or a single faction consistently controls which issues reach the group's attention. The system detects when issue creation is concentrated and surfaces a framing warning.
- *Scope avoidance:* Issues that should be platform-wide are scoped narrowly to avoid broader scrutiny. The system tracks scope challenges and detects when challenges are disproportionately successful (indicating systematic under-scoping).

---

## Phase 2: Perspecting

**What it is:** Members contribute their partial views of the situation. This is not opinion-gathering — it is the surfacing of different ways of perceiving the same reality. A co-op member who uses the shared laundry at 6am sees the water issue differently than one who gardens. A downstream community perceives the watershed differently than an upstream one. These are not disagreements to be resolved. They are partial truths to be brought into contact.

**Protocol:**

- Any member within scope may contribute a **perspective** — a structured account of how they perceive the situation, what they believe is at stake, and what they think matters
- Perspectives are first-class objects in the system, not comments on a thread. They persist, can be referenced, and form part of the decision record
- The system tracks **perspectival coverage**: how many substantially different viewpoints have been surfaced. "Substantially different" is not algorithmic — it is a facilitator judgment supported by system heuristics (clustering by language, framing, and proposed action)
- Members may contribute perspectives asynchronously over the full deliberation period
- Stand-asides are recorded as a perspective type: "I see this, I have no objection, I choose not to engage further"

**Outputs:**
- A set of perspectives attached to the issue
- A perspectival coverage assessment: are we hearing from different vantage points, or are we hearing the same view expressed multiple ways?
- Participation quorum tracking: what percentage of the participant set has contributed a perspective or stood aside

**Failure modes to detect:**
- *Perspectival monoculture:* All contributed perspectives share the same framing. The system detects low variance in perspective framing and surfaces a diversity warning — not to mandate diversity, but to ask "are we sure we're seeing the whole picture?"
- *Silenced perspectives:* Members within scope who haven't contributed and haven't stood aside. Absence is not consent — it may indicate that the issue's framing excludes certain viewpoints, or that social dynamics discourage dissent. The system nudges non-participants without pressuring them.
- *Epistemic dominance:* A single member or faction's perspectives receive disproportionate engagement while others are ignored. The system tracks cross-perspective engagement (responses that reference or engage with a different perspective) and detects when engagement is asymmetric.

---

## Phase 3: Integration

**What it is:** The core of collective sense-making. Perspectives are not just collected — they encounter each other. Members engage with viewpoints different from their own. Shared understanding is constructed: not agreement, but mutual intelligibility. After integration, participants should be able to articulate not just their own view, but the views of others — and should understand *why* those views make sense from a different vantage point.

**Protocol:**

- The facilitator synthesizes perspectives into a **situation map**: a structured representation of what the group collectively perceives, where perceptions converge, and where they diverge
- The situation map is itself a deliberative artifact — members may challenge its accuracy and propose amendments
- Integration has a **minimum time floor** that the facilitator cannot shorten. This prevents rushing through the phase that matters most
- Any member may request an extension if they believe a significant perspective has not been adequately engaged with — not just surfaced, but *engaged with* by other perspectives
- Integration is complete when participation quorum has been met AND the facilitator (or the group) determines that perspectives have been brought into sufficient contact. "Sufficient contact" means: divergent perspectives have been acknowledged and engaged with, not merely listed

**Outputs:**
- A situation map showing areas of convergence and divergence
- A decision-readiness assessment: has the group built enough shared understanding to make a decision it will live with?
- If the assessment is negative, the issue can loop back to Perspecting (new perspectives needed) or remain in Integration (existing perspectives need more engagement)

**Failure modes to detect:**
- *Parallel monologue:* Perspectives are surfaced but never engage with each other. Members respond only to aligned perspectives and ignore divergent ones. The system detects low cross-perspective engagement and surfaces a legibility warning: the group is talking but not building shared understanding.
- *False convergence:* The group appears to agree, but the agreement masks unexamined assumptions or suppressed dissent. The system detects when convergence happens faster than expected (below historical norms for issues of similar complexity) and flags it for facilitator review.
- *Integration fatigue:* The process has been open so long that participants disengage. The system tracks engagement decay over time and alerts the facilitator when active engagement drops below a threshold.

---

## Phase 4: Decision

**What it is:** Shared understanding crystallizes into a commitment to action. The group moves from "we see the situation together" to "we will do this." The decision method is configurable (consent, majority, supermajority, etc.), but the decision always follows integration, never replaces it.

**Protocol:**

- The facilitator formulates a **proposal** based on the integration phase — or any member may offer an alternative proposal
- The proposal is processed through the group's chosen decision method (consent-based by default)
- Under consent: objections block only if paramount (a reasoned claim that the proposal would harm the commons or the conditions for collective sense-making). Paramount objections may be challenged through a legitimacy check (2/3 supermajority)
- Secret ballots are available on request
- Decision quorum must be met for the outcome to be binding

**Outputs:**
- A binding decision with defined scope
- A rationale: why this decision, given what the group perceives
- Dissenting views: perspectives that did not prevail but remain part of the record
- An implementation path if the decision requires action

**Failure modes to detect:**
- *Decision without understanding:* The group votes without having built shared understanding. The system tracks whether integration actually occurred (not just whether time elapsed) and flags decisions that bypassed meaningful integration.
- *Perpetual deliberation:* The group is unable to move from understanding to commitment. This is distinct from integration fatigue — the group may be deeply engaged but unable to crystallize a decision. The facilitator may invoke a decision-forcing mechanism defined in group policy.
- *Quorum gaming:* The decision is timed or scoped to exclude likely dissenters. The system tracks quorum patterns and flags anomalies.

---

## Phase 5: Memory

**What it is:** The decision and its context are recorded in Civic Memory, updating the group's collective understanding. Memory is not archival — it is the process by which the group's sense-making persists and evolves over time.

**Protocol:**

- The facilitator drafts a **Decision Record** containing: the issue, all perspectives, the situation map, the decision method, the outcome, the rationale, and dissenting views
- The record is open for objection during a review window before finalization
- Records are append-only with annotation — never deleted or edited, but annotatable with links to later decisions that supersede them
- Periodically, the group produces **digests** — compressed summaries of precedent that serve as entry points for new members and force re-examination of old understanding

**Outputs:**
- A finalized Decision Record in Civic Memory
- Updated precedent indices
- Periodic Civic Memory digests

**Failure modes to detect:**
- *Memory loss:* Decisions are made but not recorded, or recorded without sufficient context to be useful later. The system tracks record completion rates and flags decisions that haven't been recorded within the review window.
- *Memory ossification:* Old precedent becomes de facto binding because no one challenges it. The system tracks when precedent is cited without re-examination and surfaces it during digest production.
- *Memory inaccessibility:* Civic Memory exists but is impenetrable to new members. The system tracks the age of the most recent digest and prompts production when the gap exceeds a threshold.

---

## Inter-Holon Protocol

When CommonGround instances are nested in holonic structures, the protocol operates across levels with additional dynamics:

### Upward Flow (Child → Parent)

- **Pattern surfacing:** When multiple child holons record similar patterns in their Civic Memory (recurring conflicts, converging experiments, repeated scope challenges), the parent level's protocol includes detection and surfacing of these patterns as structural signals.
- **Escalation:** When a child holon's decision creates effects beyond its boundary, the issue is replicated at the parent level with the child's perspectives as initial input. The child doesn't lose the decision — it gains a broader participant set.
- **Emergence recognition:** When child-level innovations converge independently, the parent level evaluates whether to adopt the pattern at its own scale.

### Downward Flow (Parent → Child)

- **Translation:** When the parent level makes a decision, it is translated into each child holon's operating context. Translation is a governance act: the parent articulates what the decision means for each child's specific situation, and the child may challenge the translation's accuracy.
- **Constraint communication:** When the parent level identifies a Tier 1 violation or boundary-crossing externality at the child level, it initiates the compliance protocol (notification → deliberation → proportionate response → separation if necessary).

### Lateral Flow (Sibling ↔ Sibling)

- **Shared protocols:** Sibling holons may establish direct communication channels and coordination agreements without routing through a parent level. These are lighter than governance — coordination, not jurisdiction.
- **Conflict surfacing:** When sibling holons' decisions conflict at their boundary, the system detects the conflict (often through cross-membership signals at the individual level) and routes it to the encompassing parent level for interstitial governance.

---

## Protocol Health Metrics

The system continuously monitors the health of the collective sense-making process. These are not performance metrics — they are vital signs. A healthy system doesn't optimize for speed. It maintains the conditions for shared understanding.

| Metric | Healthy Signal | Warning Signal |
|--------|---------------|----------------|
| Perspectival diversity | Multiple distinct framings per issue | Monoculture — one framing dominates |
| Cross-engagement | Perspectives engage with divergent views | Parallel monologue — clusters don't interact |
| Attention distribution | Issues spread across membership | Attention concentrated on few issues or few members |
| Integration depth | Time in integration scales with complexity | Rushed integration or perpetual deliberation |
| Memory vitality | Recent digests, precedent re-examined | Stale digests, precedent cited as law |
| Participation breadth | Wide participation across issues | Concentration — few members make most decisions |
| Scope accuracy | Few successful scope challenges | Frequent successful challenges (systematic mis-scoping) |

The system surfaces these as health signals, never as compliance requirements. A group that sees its health metrics degrade can choose to respond — or not. The metrics make the invisible visible. The response remains a governance choice.

---

## Protocol Evolution

This protocol is itself subject to governance. Groups may:

- Modify phase durations and quorum thresholds through governance policy
- Experiment with alternative phase structures through the governance sandbox
- Propose amendments to the protocol itself through the constitutional amendment process

The protocol describes how collective sense-making works. If a group discovers that it works differently for them, the protocol should change — after deliberation.

---

*This protocol describes the dynamics of collective sense-making. It is implementable in software, practicable on paper, and adaptable to any scale from 12 people to 50,000.*
