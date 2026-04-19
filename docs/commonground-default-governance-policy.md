# CommonGround Default Governance Policy

**Version:** 1.0
**Date:** 2026-04-14
**Status:** Draft
**Governed by:** The CommonGround Constitution v2.0

---

## Purpose

This document defines the operational mechanisms that implement the CommonGround Constitution. These are smart defaults — designed for groups of 5-200 people, tested through adversarial deliberation, and adjustable through the group's own governance process.

Everything in this document can be changed by the group through standard decision-making (consent by default, or whatever method the group has adopted). The Constitution defines what must be true. This policy defines how.

---

## Membership

### Liveness Window

Active membership requires any meaningful platform interaction within a **90-day rolling window**. Qualifying interactions include (by default): posting, commenting, reacting, voting, participating in deliberation, or standing aside.

The group may redefine qualifying interactions through supermajority vote, subject to the constitutional constraints (no resource requirements, grace period preserved).

### Reactivation Grace Period

When a referendum is called, inactive members receive notification and a **7-day grace period** to reactivate by participating in the deliberation phase. This grace period is constitutionally protected and cannot be removed.

### Admission

New members require **vouching by one existing active member**.

**Growth rate cap:** Membership cannot more than double within any 30-day window. This prevents coordinated capture through rapid onboarding.

### Ratification Threshold

The founder's constitution becomes ratifiable when the group reaches **10 active members**. Ratification uses a 2/3 supermajority of active members. If ratification fails, the group has 30 days to propose amendments and re-vote. The founder's version remains in effect during this period. If ratification fails twice, the group enters an open constitutional convention.

---

## Deliberation

### Time Floors

| Decision type | Minimum deliberation period |
|---|---|
| Standard issues | 72 hours |
| Tier 2 constitutional amendments | 14 days |
| Tier 1 constitutional amendments | 30 days |
| Decision method changes | 14 days |
| Membership liveness redefinition | 14 days |

### Extensions

Any member may request **one extension** per issue if they believe a significant perspective has not been heard. An extension adds 50% of the original deliberation period (e.g., 72 hours becomes 108 hours). Each member may trigger at most one extension per issue.

### Facilitator Selection

1. The issue initiator is the default facilitator
2. Any member may nominate an alternative; if seconded, a consent check is held (no paramount objections = new facilitator stands)
3. If the initiator declines and no volunteer emerges, the system assigns by **sortition** from active members
4. Mid-deliberation facilitator challenges require support from **3 members or 25% of the affected group** (whichever is smaller)

### Facilitator Powers

The facilitator may:
- Extend the deliberation period (but never shorten it below the floor)
- Signal "deliberation closing in 48 hours" to prompt final perspectives
- Draft the Decision Record for Civic Memory
- Manage issue status transitions

The facilitator may not:
- Vote with extra weight
- Unilaterally close deliberation before the time floor
- Exclude members from participation

---

## Quorum

### Default Thresholds

| Quorum type | Default | Measured against |
|---|---|---|
| Awareness | 60% | Active members in the affected scope |
| Participation | 30% | Active members in the affected scope |
| Decision | Method-dependent | Participants (consent: all non-stand-asides; majority: 50%+1) |

Quorum is always calculated against the **scoped affected group**, not the entire membership, per the subsidiarity principle.

### Stake-Scaled Quorum

Certain decision types automatically trigger elevated quorum thresholds:

| Decision type | Awareness | Participation |
|---|---|---|
| Standard issues | 60% | 30% |
| Removal proceedings | 75% | 50% |
| Constitutional amendments | 80% | 50% |
| Delegation of broad authority | 75% | 40% |

Additionally, if a decision attracts opposition from more than **25% of participants** during deliberation, quorum requirements automatically elevate to the next tier. This allows the system to respond to actual tension, not just predicted tension.

### Stall Mechanism

If awareness quorum is not met within the deliberation period:
1. The period is extended and the issue is highlighted to the affected group
2. If still unmet after extension, the issue is marked "Stalled — insufficient participation"
3. Stalls are recorded in Civic Memory
4. The initiator may request a **scope reduction** — narrowing the affected group to resolve the stall — subject to the scope challenge mechanism

---

## Referenda and Rate Limiting

### Initiation Threshold

A referendum requires support from a **minimum threshold of affected members** before proceeding. Default: **2 supporters or 10% of the affected group** (whichever is greater).

### Rate Limits

| Limit | Default |
|---|---|
| Initiations per member | 1 per 30-day rolling window |
| Concurrent active referenda (system-wide) | 3 (additional referenda enter a queue) |

Co-signing another member's referendum does **not** count against your initiation limit.

The initiation limit can never be set to zero — this would violate the constitutional right to initiate referenda (Principle 6).

---

## Delegation

### Auto-Expiring Delegations

Research on liquid democracy shows that participants systematically over-delegate — delegating 2-3x more than is optimal, and substantially overestimating the accuracy of their delegates. To counteract this cognitive bias, all delegations in CommonGround auto-expire.

| Delegation type | Default expiry |
|---|---|
| Per-issue facilitation | Expires when the issue is resolved |
| Topic-area delegation | 90 days, requires explicit renewal |
| Broad governance delegation | 60 days, requires explicit renewal |
| Stewardship delegation | 180 days, requires explicit renewal |

**Renewal** is a lightweight consent check (not a full referendum). The delegate signals intent to continue, and the delegation renews unless a paramount objection is raised.

**Delegation visibility:** The system makes delegation patterns visible to all members — who has delegated to whom, how many decisions a delegate is making on others' behalf, and how the delegate's votes compare to the delegator's expressed positions on past issues. This transparency allows delegators to make informed decisions about renewal.

The goal is for delegation to be the exception, not the default. Direct participation is the healthiest mode; delegation exists for when members genuinely lack time, context, or expertise.

---

## Temporal Stability

### Stability Periods

Decisions have defined stability periods during which they cannot be relitigated:

| Decision type | Default stability period |
|---|---|
| Standard issues | 30 days |
| Policy changes | 90 days |
| Constitutional amendments | 180 days |
| Delegation grants | 90 days |

### Exceptional Override

A stability period may be overridden early if:

1. **Material new information** emerges that was not available during deliberation
2. **Active demonstrable harm** is occurring as a result of the decision
3. **A Tier 1 principle violation** is discovered
4. **The affected scope has changed significantly** (e.g., new members materially impacted who were not part of the original decision)

Overriding a stability period requires a **2/3 supermajority** of the affected group, except for Tier 1 violations, which any member may flag for immediate review.

---

## Decision Methods

### Consent (Default)

- Objections block only if paramount (reasoned structural concern, not personal preference)
- Stand-aside: acknowledged disagreement that does not block
- **Legitimacy check circuit breaker:** If a paramount objection is raised and challenged, any member may call for a 2/3 supermajority vote on whether the objection is truly paramount. If 2/3 say it is not, the objection is overridden and the override is recorded in Civic Memory.

### Method Changes

Changing the group's default decision method **always uses supermajority vote (2/3)**, regardless of the current method. This prevents deadlock when transitioning away from a method that is no longer serving the group.

### Governance Health Checks

The system automatically opens a governance health check issue when the group crosses membership thresholds: **10, 25, 50, 100, 200**. The health check prompts the group to evaluate:

- Whether the current decision method still serves the group
- Whether quorum thresholds need adjustment
- Whether the facilitator selection process is working
- Whether rate limits and stability periods need tuning

Health checks are prompts, not mandates. The group can dismiss them.

---

## Operational Stewardship

### Separation of Powers

Operational stewardship (infrastructure, safety, moderation, onboarding) is a **delegation**, not a rank. Stewards are appointed through the normal governance process and are revocable like any other delegate.

### Emergency Powers

Stewards may take immediate action for:
- Infrastructure failures
- Security breaches
- Active harassment or safety threats
- Data integrity emergencies

### Emergency Accountability

- All emergency actions are **automatically logged** with timestamp, action taken, and rationale
- Emergency actions must be **ratified or reversed** within **72 hours** through a fast-track deliberation
- Repeated unratified emergency actions are grounds for reconsidering the stewardship delegation

### Role Rotation

Governance roles accumulate informal power over time — even when formally revocable, long-serving delegates become de facto authorities through experience, relationships, and institutional knowledge. Rotation prevents entrenchment while preserving competence.

| Role | Default maximum term | Renewable? |
|---|---|---|
| Steward | 6 months | Yes, up to 2 consecutive terms (then must rotate out for at least one term) |
| Standing facilitator | 3 months | Yes, up to 3 consecutive terms |
| Federation representative | 6 months | Yes, up to 2 consecutive terms |

Per-issue facilitation is not subject to rotation — it ends when the issue resolves.

Rotation periods are long enough to develop competence (months, not the Zapatistas' 2-3 weeks) but short enough to prevent entrenchment (not years). The mandatory rotation gap ensures that no individual becomes irreplaceable.

### Knowledge Distribution

Stewardship creates knowledge asymmetry that can make delegation irrevocable in practice — you can revoke a steward's authority but not their knowledge, and you can't replace them if nobody else knows how to run the system.

To prevent knowledge monopoly:

- Stewards must maintain **operational documentation** sufficient for a replacement to take over
- Stewardship should involve periodic **co-stewardship or shadowing**, so operational knowledge is distributed across at least two active members
- Documentation is reviewed during governance retrospectives for completeness

---

## Removal Proceedings

### Code of Conduct

The group maintains a code of conduct defining categories of behavior that may trigger removal proceedings. At minimum:

- Persistent bad-faith use of governance mechanisms
- Introducing knowingly false information into deliberation
- Harassment or threats toward other members
- Coordinated manipulation of governance processes

The code of conduct is a living document, amendable through standard governance.

### Graduated Sanctions

Removal is the most severe response and should not be the first. The system uses graduated sanctions that escalate in proportion to the behavior:

| Level | Action | Initiated by | Reversible |
|---|---|---|---|
| 1. **Notice** | A formal notice that specific behavior has been identified as problematic. No restrictions. | Any member, with one co-signer | Automatically after 30 days |
| 2. **Cooling period** | Temporary suspension of referendum initiation rights (not participation rights). | Referendum with standard threshold | After the defined period (default: 30 days) |
| 3. **Restricted participation** | Temporary suspension of voting rights on specific issues related to the problematic behavior. | Referendum with elevated threshold | After the defined period (default: 60 days) |
| 4. **Removal** | Full removal from the group. | Referendum with standard threshold | Readmission requires standard admission process |

Each level requires that the previous level has been applied first, except in cases of immediate safety threats (harassment, threats of violence), where stewards may act under emergency powers and escalate directly to temporary restriction pending a full deliberation.

### Removal Process

1. Removal is initiated through the standard referendum process (requires threshold support)
2. Rate limiting applies — the same member cannot be targeted for removal more than once per stability period
3. The member subject to removal may participate in deliberation but may not block the final decision (Constitution, Principle 2)
4. The process, criteria, and outcome are recorded in Civic Memory
5. Prior graduated sanctions and their outcomes are included in the Decision Record as context

---

## Civic Memory

### Decision Records

Every governance decision produces a Decision Record containing:

- The issue as stated
- All perspectives surfaced during deliberation
- The decision method used
- The outcome
- The rationale for the decision
- Dissenting views

### Drafting and Review

The facilitator drafts the Decision Record. The draft is open for objection for **48 hours** before finalization. Objections to the record's accuracy trigger revision by the facilitator. If disagreement persists, the objecting member's version is appended as an addendum.

### Immutability

Civic Memory is **append-only**. Records are never deleted or modified after finalization. When a later decision supersedes an earlier one, the earlier record is annotated with a link to the superseding decision.

### Precedent

Civic Memory is **informational, not binding**. Past decisions inform future deliberation but do not constrain it. The group learns from its history but is never trapped by it.

---

## Concentration and Influence Monitoring

The absence of formal hierarchy does not eliminate power — it makes power invisible. The system monitors both participation patterns and influence patterns to keep power legible.

### Participation Concentration

The system surfaces a **concentration warning** when:

- Fewer than **30% of active members** are participating in more than **70% of decisions**

### Influence Patterns

The system also tracks and makes visible:

- **Facilitation concentration** — whether the same members are facilitating a disproportionate share of issues
- **Delegation concentration** — whether a small number of members are accumulating delegated authority from many others
- **Perspective influence** — whether certain members' perspectives are disproportionately reflected in final decisions (measured by alignment between individual positions and outcomes)
- **Agenda-setting concentration** — whether the same members are initiating a disproportionate share of issues

These are signals, not gates. The system surfaces patterns; the group decides what they mean. But making informal power visible is itself a check on its accumulation — power that must be exercised in the open is exercised more carefully than power that operates in the shadows.

---

## Governance Retrospectives

The system opens a **governance retrospective** on a regular cycle (default: quarterly) independent of growth thresholds. Unlike health checks, which ask "do the mechanisms need tuning?", retrospectives ask qualitative questions:

- How is governance *feeling*? What's energizing? What's draining?
- Are decisions landing well in practice? Are any causing unintended harm?
- What structural tensions have recurred? (Surfaced automatically from Civic Memory conflict tracking)
- Is the group's trust level rising, stable, or eroding?
- Are there governance experiments worth trying?

Retrospective outputs are recorded in Civic Memory as **health records**, creating a longitudinal signal the system can learn from. Over time, health records reveal patterns invisible in individual Decision Records.

### Participation Decay Countermeasures

Every participatory system in history — Porto Alegre, Kerala, the kibbutzim — experienced declining participation over time as initial enthusiasm faded. This is not a failure of commitment; it is a structural inevitability that must be designed for.

The system actively counters participation decay through:

- **Low-cost participation options** — not every act of governance requires deep engagement. Quick reactions, stand-asides, and lightweight endorsements lower the barrier
- **Visible impact** — the system connects decisions to outcomes, showing members that their participation produces real results
- **Rotation into governance roles** — sortition and rotation periodically bring new members into active governance, refreshing engagement and distributing civic experience
- **Asynchronous participation** — all deliberation is asynchronous by default, so participation does not require synchronous availability. Governance that requires everyone to be in the same room at the same time systematically excludes people with jobs, caregiving responsibilities, or different time zones
- **Retrospective reflection** — participation trends are surfaced during retrospectives, prompting the group to ask why engagement is declining and what structural changes might help

Retrospectives are prompts, not mandates. The group may adjust the cadence or dismiss any individual retrospective.

---

## Governance Sandbox

Any subgroup may propose a **time-bounded governance experiment** — an alternative mechanism scoped to their subgroup and limited in duration (default maximum: 90 days).

Experiments may vary:
- Decision method (e.g., trying quadratic voting for a quarter)
- Quorum structure
- Deliberation format
- Facilitator selection process
- Any other mechanism in this policy document

**Experiment lifecycle:**
1. Proposal — the subgroup describes the experiment, its scope, duration, and what they hope to learn
2. Consent check — the affected group consents (no paramount objections)
3. Execution — the experiment runs for its defined duration
4. Evaluation — results are assessed against the experiment's stated goals
5. Decision — the mechanism is adopted, adapted, or abandoned
6. Recording — the full experiment (proposal, execution, outcome) is recorded in Civic Memory

Experiments cannot override Tier 1 constitutional principles. The group may run multiple concurrent experiments in different subgroups.

---

## Civic Memory Digests

On a regular cycle (default: annually), the group produces a **Civic Memory digest** — a compressed summary of the precedent, structural tensions, governance experiments, and health records from the period.

Digests serve as the recommended entry point for new members. The raw Decision Records remain for reference, but digests prevent institutional history from becoming an archaeological barrier to participation.

Digests are deliberated artifacts — the group agrees on the summary through its standard decision process, which forces periodic re-examination of whether old precedent still represents the group's values.

---

## Federation Protocol

Two or more CommonGround instances may propose a **federation** — shared governance of specific shared resources while each instance maintains sovereignty over its own affairs.

**Federation principles:**
- **Built upward, not downward** — the federated layer exists to serve the member groups. Authority flows up from autonomous base units by voluntary delegation, not down from a central body. This is the inverse of representative government: the center has only the powers the periphery explicitly grants, and those grants are revocable
- Participation is voluntary — any member instance may exit the federation at any time
- Federated scope is explicitly defined — only the named resources are governed jointly
- Each instance retains full sovereignty over non-federated decisions
- The federation itself operates under CommonGround constitutional principles, including forkability
- No federation may compromise a member instance's exit rights or data portability

**Federation governance** uses the same constitutional framework, with member instances as the participants. Quorum, deliberation, and decision methods apply at the federation level. The federation has no independent sovereignty — it acts only within the scope delegated to it by member instances.

---

## Amendments to This Policy

This policy can be amended through the group's standard decision-making process. No supermajority is required unless the change affects:

- The membership liveness definition (supermajority required)
- The decision method (supermajority required)

All policy amendments are recorded in Civic Memory.

---

*This policy accompanies the CommonGround Constitution v2.0 and provides the operational defaults that implement its principles.*
