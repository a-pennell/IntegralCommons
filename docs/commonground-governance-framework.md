# The CommonGround Governance Framework

**Version:** 1.0
**Date:** 2026-04-14
**Status:** Draft — open for community review

---

## Purpose

This document defines the constitutional principles that govern any CommonGround instance. These principles are embedded in software but exist independently of it — they describe how groups can govern shared resources while ensuring power remains visible, contextual, and revocable.

The framework is designed for small-medium groups (5-200 people) that make real decisions together: co-ops, land trusts, collectives, boards, and commons governance organizations.

---

## Core Premise

Groups are sovereign. They can delegate authority but can never permanently surrender it. All governance is visible, all power is contextual, and the infrastructure that enables governance cannot itself be captured.

---

## Constitutional Principles

### Tier 1: Inviolable

These principles cannot be overridden by any group decision. They protect the commons, individual rights, and the group's capacity for self-governance.

---

**Principle 8 — Removal Due Process**

Members subject to removal:
- May participate in deliberation
- May not block final decisions
- Are entitled to a transparent process with defined criteria and thresholds

*Rationale: Without due process, the governance system becomes a tool of exclusion rather than inclusion. The right to be heard before removal is foundational.*

---

**Principle 10 — Commons Protection**

No decision may:
- Privatize shared infrastructure
- Restrict exit rights (data, identity, participation)
- Undermine the revocability of governance

This principle is supreme. When it conflicts with any other principle, Commons Protection prevails.

*Rationale: The greatest risk to any commons is enclosure — gradual capture by private interests. This principle exists to make enclosure structurally impossible, not merely discouraged.*

---

**Principle 11 — Forkability**

Any group may fork the system and its governance, provided interoperability standards are maintained.

*Rationale: The right to exit and rebuild is the ultimate check on governance failure. If a group cannot fork, it is captive. Forkability ensures that CommonGround instances remain accountable to their members.*

---

### Tier 2: Deliberable

These principles are defaults that groups can adjust through their own governance process. Adjustments are recorded as Decision Records in Civic Memory, creating visible precedent.

---

**Principle 1 — Bootstrap**

The initial governance method is established via consent. The founder proposes a governance profile, the system opens it as the group's first Issue, and members deliberate. The consent-based meta-method is the one rule that precedes all others.

*Rationale: Every governance system faces the bootstrap paradox — you need rules to decide, but deciding on rules is itself a decision. Consent resolves this by requiring only the absence of paramount objections, not unanimous enthusiasm.*

---

**Principle 2 — Revocability**

All delegations are revocable. No delegation may be made irrevocable.

*Rationale: Irrevocable delegation is a transfer of sovereignty. If authority cannot be recalled, the group has created a ruler, not a delegate.*

---

**Principle 3 — Bounded Referendum Right**

Any member may initiate a referendum if supported by a minimum threshold of members or stake relevant to the decision's scope.

The threshold requirement:
- Prevents frivolous or bad-faith referenda
- Introduces signal (a referendum with support carries weight)
- Is configurable by the group (subject to Principle 10)

*Rationale: Unlimited referendum rights enable disruption. Eliminated referendum rights enable capture. The threshold balances stability with accountability.*

---

**Principle 4 — Scope and Subsidiarity**

Decisions should be made at the lowest level competent to address them. Only those materially affected participate in referenda.

*Rationale: Without subsidiarity, the system collapses. Every decision becomes everyone's decision, creating gridlock and fatigue. Subsidiarity respects both competence and affected interest.*

---

**Principle 5 — Temporal Stability**

Delegations and decisions have defined stability periods during which they cannot be challenged except under exceptional conditions.

*Rationale: Without stability periods, governance becomes a permanent campaign. Decisions must have time to be implemented and evaluated before they can be relitigated.*

---

**Principle 6 — Rate Limiting**

Members are subject to limits on how frequently they may initiate referenda or governance actions within a given time window.

*Rationale: Governance overload is a denial-of-service attack on collective attention. Rate limiting protects the group's capacity to deliberate meaningfully.*

---

**Principle 7 — Deliberation First**

All referenda must include a structured deliberation phase before voting. No decision proceeds directly to resolution without the group having the opportunity to understand the issue through multiple perspectives.

*Rationale: Voting without deliberation is preference aggregation, not governance. The deliberation phase is where understanding is built, disagreement is made legible, and the quality of the eventual decision is determined.*

---

**Principle 9 — Participation Integrity**

Decisions require:
- Quorum thresholds (awareness, participation, and decision quorums)
- Diversity of participation (to avoid capture by a small active subset)
- Transparent rationale

*Rationale: A decision made by 4 out of 30 members is not a collective decision — it's a small-group decision wearing collective legitimacy. Quorum and diversity requirements ensure decisions represent the group, not just its most active members.*

---

## Conflict Resolution Between Principles

Principles will conflict under pressure. This is expected and healthy.

**Resolution hierarchy:**

1. **Tier 1 principles always prevail** over Tier 2 principles. Commons Protection (10) is supreme among all principles.
2. **Between Tier 1 principles,** Due Process (8) and Forkability (11) are co-equal. Conflicts between them (rare) are resolved through deliberation with special attention to both.
3. **Between Tier 2 principles,** conflicts become Issues. The group deliberates on the tension using CommonGround itself, and the resolution becomes precedent in Civic Memory.

The system is designed to make these conflicts visible and resolvable, not to eliminate them.

---

## Authority Model: Liquid Delegation

CommonGround has no fixed roles. There is no admin/member class distinction.

- All members have equal base capabilities: create Issues, add Perspectives, participate in decisions
- **Facilitation** is a capability delegated per-Issue by the group
- Facilitation grants: status transitions, summary authorship, Decision Record drafting
- The group can elect an admin through the normal decision process
- The admin holds authority on behalf of the group — it is never theirs
- Any member can call a referendum to challenge any delegation (subject to Principles 3, 5, and 6)
- No decision can make a delegation irrevocable (Principle 2)

Power in CommonGround is always contextual, visible, and revocable.

---

## Decision Methods

The framework supports pluggable decision methods. The default is consent-based process.

### Consent-Based (Default)

- Objections block only if paramount (reasoned concern, not preference)
- Stand-aside is available (acknowledged but non-blocking)
- Consent is also the hardcoded meta-method for the bootstrap process

### Future Methods (Research Roadmap)

The following methods are being researched for inclusion as pluggable modules:

- **Quadratic Voting** (Glen Weyl) — expresses intensity of preference, not just direction
- **Sociocracy** — consent-based variants with governance circle structures
- **Sortition / Citizen Assemblies** — random sampling to avoid self-selection bias (cf. Ireland's constitutional conventions)
- **Liquid Democracy** — delegatable votes per-issue, with transparent delegation chains
- **Deliberative Polling** (James Fishkin) — informed preference after structured deliberation

Groups choose their method per-Issue or set a space-wide default. The method layer is an open module system — communities can contribute additional methods.

---

## Quorum System

Three tiers of quorum prevent decisions from being made without sufficient collective engagement.

**Awareness Quorum** — A percentage of members must have viewed the Issue before it can move to decision. Default: 60%.

**Participation Quorum** — A percentage must have added a Perspective or explicitly stood aside. Default: 30%.

**Decision Quorum** — Determined by the decision method (consent requires all non-stand-asides, majority requires 50%+1 of participants).

**Stall Mechanism:** If awareness quorum isn't met within the deliberation period, the system extends the period and highlights the Issue. If still unmet, the Issue is marked "Stalled — insufficient participation" and cannot proceed. Stalls are recorded in Civic Memory.

---

## Relationship to Software

This framework is a standalone governance design. CommonGround the software is its reference implementation. The framework is:

- Publishable and citable independent of the software
- Implementable in other tools or even on paper
- Open to feedback, critique, and revision by governance practitioners
- Versioned with a public change history

The software enforces Tier 1 principles in code. Tier 2 principles are configurable defaults. The framework evolves through community deliberation — using CommonGround itself where possible.

---

## License

This framework is published under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0). It may be freely used, adapted, and redistributed, provided attribution is maintained and derivative works use the same license.

---

*This framework was developed through structured adversarial deliberation — itself an application of the principles it describes.*
