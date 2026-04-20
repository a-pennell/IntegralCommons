# Feature Specification: CommonGround v1 (Governance MVP)

## Metadata
- Feature ID: 001-commonground
- Source PRD: docs/commonground-prd.md (v2.0)
- Status: Draft
- Date: 2026-04-19

---

## Problem Statement

Groups that govern shared resources — housing and worker co-ops, land trusts, nonprofit boards, community assemblies, commons governance organizations — cannot reliably think together well enough to govern themselves. They struggle to make sense of complex, value-laden issues; to hold collective memory across decisions; to distinguish disagreement from misunderstanding; to evolve decisions over time without re-litigating everything; and to avoid domination by the loudest or most available voices.

Existing tools make the problem worse. Voting platforms reduce complex issues to binary choices. Comment-thread tools are unstructured and dominated by volume. Meetings and minutes are ephemeral and exclude asynchronous participants. None of these modalities support **ongoing collective reasoning**. Groups accumulate fatigue, lose institutional memory, and drift toward either paralysis or informal power capture.

CommonGround replaces the comment-thread-and-voting model with a structured deliberation system built on three first-class objects — Issues, Perspectives, and Decision Records — and a constitutional governance framework of 11 principles organized in a two-tier hierarchy. Authority is delegated per-Issue by the group and can be recalled at any time through referendum. Every decision is persistent, iteratively refined, and resolved through a transparent process; every rationale is preserved in Civic Memory so the group can remember "why we think what we think."

CommonGround is the foundation layer of the broader Integral Commons OS (ICOS) vision. It is the focused MVP — the governance primitive that later modules (Personal Vault, Conflict Repair, Knowledge Commons, Stewardship, Ecological Commons, Federated AI Guide) depend on. The constitutional framework and the deliberation system must prove themselves here first.

---

## Goals & Non-Goals

### Goals

- Improve the quality of a group's collective understanding of the issues it faces.
- Reduce the cognitive and emotional load of governance for members and facilitators.
- Preserve decision memory — the reasoning, evidence, and unresolved objections behind every decision — so groups can remember why they think what they think.
- Make disagreement legible rather than adversarial, by giving it structure and taxonomy.
- Enable groups to adapt their governance over time without fragmenting, through in-system referenda, revocable delegations, and revisable Decision Records.

### Non-Goals

- Maximizing engagement, time-on-platform, or any attention metric.
- Replacing formal legal processes (incorporation, contracts, statutory compliance).
- Enforcing real-time consensus or pushing the group toward live synchronous decisions.
- Gamification of participation (points, badges, leaderboards, streaks).
- Serving national elections, mass social debate, or anonymous crowds.

---

## User Scenarios & Testing

### User Story 1 — Founder bootstraps a new Space (Priority: P1)

**As a** founder of a small governing group (e.g., a housing co-op)
**I want to** create a CommonGround Space, invite members, and establish our initial governance through a structured first Issue
**So that** our group has legitimate, consent-ratified rules before any real decision is made

**Why P1:** Nothing else in the system has legitimacy until the group has ratified its governance profile. Bootstrap is the gateway to every other capability.

**Independent Test:** A founder with an empty Space can complete the Bootstrap process — name the Space, invite members, have the system open the first Issue "How should we make decisions?", propose an initial governance profile, and drive it to a Decision Record via the hardcoded consent meta-method — without any other feature being exercised.

**Acceptance Scenarios:**
- Given a new Space with no governance profile, When the founder invites members and completes Bootstrap, Then the Space's first Issue is opened automatically with the title "How should we make decisions?" and the founder's proposed profile attached.
- Given the first Issue is Open, When members add Perspectives and no paramount objections remain, Then the system produces the Space's first Decision Record and the governance profile becomes active.
- Given Bootstrap is incomplete, When a member attempts to open a second Issue, Then the system prevents it and surfaces the pending Bootstrap as the next action.

---

### User Story 2 — Member joins a Space and orients (Priority: P1)

**As an** invited member of an existing Space
**I want to** accept the invitation, see the Space's governance profile and active Issues, and read the Civic Memory before I contribute
**So that** I can contribute from shared context rather than re-litigating decided questions

**Why P1:** "Read-first, write-second" is a core UX principle. A member who cannot orient cannot contribute meaningfully.

**Independent Test:** A newly invited member can accept, land on the Space, read the active governance profile, browse Issues by status, and view any Issue's Civic Memory timeline — without needing any delegation or admin intervention.

**Acceptance Scenarios:**
- Given a valid invitation, When the member accepts, Then they have equal base capabilities (view, add Perspective, initiate referendum subject to thresholds) with no special role assigned.
- Given an Issue exists, When the member opens it, Then they see its status, structured sections, Perspectives, and Civic Memory timeline before any input affordance.
- Given a Decision Record exists on an Issue, When the member views the Issue, Then the Decision Record is surfaced above re-deliberation prompts.

---

### User Story 3 — Member creates an Issue (Priority: P1)

**As a** member of an active Space
**I want to** open a new Issue with a title, scope, and structured sections (problem framing, constraints, stakeholders, known facts, open questions)
**So that** the group has a persistent, navigable place to reason together about a shared concern

**Why P1:** The Issue is the central object. Without the ability to create one, nothing downstream matters.

**Independent Test:** A member with base capabilities can create an Issue, fill the required fields (title, scope, status=Open), populate any structured sections, and have it appear in the Space's Issue list.

**Acceptance Scenarios:**
- Given a member is in a Space, When they create an Issue with title and scope, Then the Issue is created in status "Open" and added to Civic Memory as an opening event.
- Given required fields are missing, When the member attempts to save, Then the system blocks creation and identifies the missing field.
- Given the Issue is created, When any member views the Space, Then the Issue appears in Issue navigation (not as a feed item).

---

### User Story 4 — Member adds a Perspective with a taxonomy tag (Priority: P1)

**As a** member
**I want to** add a Perspective to an Issue, tagged with one of the six default taxonomy types (Values, Risk, Equity, Feasibility, Relational, Temporal), optionally flagging "speaking from direct experience"
**So that** my contribution is legible as a specific kind of reasoning rather than a comment in a thread

**Why P1:** Perspectives (not comments) are the primary input modality. Taxonomy tagging is what makes disagreement legible.

**Independent Test:** A member can add a Perspective to an Issue, manually select its taxonomy type, optionally set the experience flag, and have it appear as a first-class object on the Issue (not a threaded reply).

**Acceptance Scenarios:**
- Given an Issue is Open or Exploring, When a member submits a Perspective with a required taxonomy tag, Then it is stored as a first-class object attached to the Issue.
- Given a Perspective exists, When another member responds to it, Then the response is allowed only at one level of depth (no deep threading).
- Given the Space has customized its taxonomy via configuration, When a member submits a Perspective, Then the available tags reflect the Space's configured list.

---

### User Story 5 — Delegated facilitator writes a Decision Record (Priority: P1)

**As a** member holding per-Issue facilitation delegation
**I want to** transition an Issue to "Decided" by authoring a Decision Record that captures what was decided, how, key rationales, unresolved objections, and a review date
**So that** the decision is preserved with its reasoning and the group can revisit it on its own terms

**Why P1:** Without the enforced Decision Record, "Decided" is meaningless and Civic Memory collapses. This closes the end-to-end P1 slice.

**Independent Test:** A member with facilitation delegation on a specific Issue can draft and publish a Decision Record, which the system requires before allowing the status transition to "Decided."

**Acceptance Scenarios:**
- Given an Issue has met awareness and participation quorums, When the delegated facilitator attempts to move it to "Decided," Then the system requires a Decision Record before the transition.
- Given a Decision Record is authored with all required fields, When the facilitator publishes it, Then the Issue moves to "Decided" and the Decision Record is logged in Civic Memory.
- Given a non-facilitator member attempts the transition, When they try to write or publish a Decision Record, Then the system rejects the action and surfaces the current delegation.

---

### User Story 6 — Member initiates a referendum against a delegation (Priority: P2)

**As a** member concerned about how a delegation is being exercised
**I want to** initiate a referendum to revoke or adjust that delegation, subject to the Space's thresholds and rate limits
**So that** power remains visible, contextual, and revocable

**Why P2:** The referendum right is constitutionally required (Principles 2, 3, 5, 6) but is not part of the minimum slice to govern one issue end-to-end.

**Independent Test:** A member can initiate a referendum against an existing delegation; the system verifies the member meets the threshold and rate-limit requirements; the referendum enters a structured deliberation phase before any vote.

**Acceptance Scenarios:**
- Given an active delegation exists, When a member initiates a referendum with sufficient supporting members/stake, Then the system opens it into a deliberation phase.
- Given a member has exceeded their rate limit for referenda in the current window, When they attempt a new referendum, Then the system declines and explains the limit.
- Given a referendum resolves in favor of revocation, When the result is recorded, Then the delegation ends immediately and the change appears in Civic Memory.

---

### User Story 7 — Facilitator writes and revises a manual summary (Priority: P2)

**As a** delegated facilitator on an Issue
**I want to** write and revise an official summary of the Issue's state, visible in the timeline
**So that** the group has a legible synthesis without depending on AI (Phase 1 baseline)

**Why P2:** Manual summaries are the Phase 1 fallback for sense-making, essential for a facilitator's workflow but not required to prove a single decision can move end-to-end.

**Independent Test:** A facilitator can write a summary, revise it, and have each version appear in Civic Memory with authorship and timestamp.

**Acceptance Scenarios:**
- Given facilitation delegation on an Issue, When the facilitator publishes a summary, Then it becomes the Issue's current official summary and is entered in the timeline.
- Given an earlier summary exists, When the facilitator revises and publishes again, Then both versions are preserved and viewable.
- Given a non-facilitator member attempts to publish an official summary, When they try, Then the system declines.

---

### User Story 8 — Member reads a rhythm-based digest (Priority: P2)

**As a** member who does not want to be pinged or badged
**I want to** receive a single digest at a group-configured cadence (default weekly) summarizing what's active, what needs my perspective, and what's approaching a decision point
**So that** I participate at my own pace without urgency cues

**Why P2:** Rhythm is the governance-appropriate alternative to notifications. Important for sustainable participation but not on the critical path to a first decision.

**Independent Test:** A member with no activity for a week receives exactly one digest at the configured cadence; the system produces no badges, counts, or push notifications.

**Acceptance Scenarios:**
- Given the Space's default digest cadence, When the cadence elapses, Then each member receives one digest covering active Issues, pending perspective requests, and upcoming decision points.
- Given a member adjusts their own digest frequency, When the next cadence fires, Then they receive at their chosen frequency and never more often.
- Given no activity warrants a digest for a given member, When the cadence elapses, Then no digest is sent.

---

### User Story 9 — Any member initiates a governance-profile change via Issue (Priority: P3)

**As a** member who wants to adjust the Space's governance profile (e.g., change a quorum threshold, rename a perspective type)
**I want to** open an Issue that treats the change as a normal decision subject to the Space's own rules
**So that** the group's governance evolves through its own process, not through an admin panel

**Why P3:** Critical to the system's integrity but reached only after the group has governed at least one substantive issue. Default thresholds from the initial profile are adequate for early use.

**Independent Test:** A member can open a "governance change" Issue, run it through the standard deliberation and Decision Record process, and — upon decision — see the Space's active governance profile update accordingly.

**Acceptance Scenarios:**
- Given an active governance profile, When a member opens an Issue proposing a specific change, Then the Issue flows through the Space's configured decision method, not an admin path.
- Given the Issue reaches a Decision Record in favor of the change, When the decision is recorded, Then the governance profile updates and the change is entered in Civic Memory.
- Given the change would violate an inviolable (Tier 1) principle, When the Issue attempts resolution, Then the system blocks the change regardless of group consent and explains which principle is implicated.

---

### User Story 10 — Admin-equivalent member exports Space data (Priority: P2)

**As a** member (no admin class exists, but typically an elected facilitator) needing portability or archival
**I want to** export the full Space data — Issues, Perspectives, Decision Records, Civic Memory, governance profile — in open, portable formats
**So that** the group retains sovereignty over its data and can fork or migrate

**Why P2:** Data export is constitutionally load-bearing (Commons Protection, Forkability) but not exercised on the path to a first decision. It must be available from day one, not deferred.

**Independent Test:** Any member with the appropriate delegation can trigger a full export and receive all Space data in open, portable formats suitable for reading without the system.

**Acceptance Scenarios:**
- Given a Space with Issues, Perspectives, and Decision Records, When an authorized member triggers an export, Then all data is produced in open portable formats.
- Given the export has completed, When an external reader opens the output, Then Issues, Perspectives, Decision Records, and Civic Memory are legible without proprietary tooling.
- Given a member attempts to export without authorization, When they request it, Then the system declines and the attempt is logged in Civic Memory.

---

### User Story 11 — Group unstalls an Issue below awareness quorum (Priority: P2)

**As a** facilitator
**I want to** see an Issue flagged "Stalled — insufficient participation" when awareness quorum is not reached even after the extension period
**So that** the group does not decide on behalf of members who never saw the Issue

**Why P2:** Stall mechanism is a core protection against silent-majority decisions but is only triggered by the absence of a happy-path outcome.

**Independent Test:** Given an Issue that fails to reach awareness quorum within its deliberation period and extension, the system marks it "Stalled" and blocks the transition to "Decided."

**Acceptance Scenarios:**
- Given awareness quorum is unmet at the end of the deliberation period, When the extension period elapses without meeting quorum, Then the Issue is marked "Stalled — insufficient participation."
- Given a Stalled Issue, When a facilitator attempts to move it to "Decided," Then the system refuses and explains the unmet quorum.
- Given a Stalled Issue subsequently reaches awareness quorum, When the condition is met, Then the Stalled flag is cleared and normal progression resumes.

---

## Requirements

### Functional Requirements

**Spaces and Membership**

- FR-001 [US1; PRD §Spaces]: The system MUST allow a founder to create a Space with a name and stated purpose.
- FR-002 [US2; PRD §Spaces]: The system MUST allow members to be invited via link or email and to join with equal base capabilities.
- FR-003 [US2; PRD §Authentication and Access]: The system MUST provide all members the same baseline capabilities; no global admin role MAY exist as a permanent class.
- FR-004 [US9; PRD §Spaces]: The system MUST require all Space-level configuration changes to be resolved through Issues, not through an admin panel.

**Bootstrap**

- FR-005 [US1; PRD §Bootstrap Process]: The system MUST automatically open the Space's first Issue titled "How should we make decisions?" upon Bootstrap initiation.
- FR-006 [US1; PRD §Bootstrap Process]: The system MUST allow the founder to propose an initial governance profile as the first Issue's proposal.
- FR-007 [US1; PRD §Bootstrap Process]: The system MUST resolve the Bootstrap Issue via a hardcoded consent-based meta-method regardless of any group configuration.
- FR-008 [US1; PRD §Bootstrap Process]: The system MUST record the Bootstrap outcome as the Space's first Decision Record and activate the resulting governance profile.
- FR-009 [US1]: The system MUST prevent creation of non-Bootstrap Issues until Bootstrap has been completed.

**Issues**

- FR-010 [US3; PRD §Issue Creation and Structure]: The system MUST allow any member to create an Issue with required fields: title, scope, and status.
- FR-011 [US3; PRD §Issue Creation and Structure]: The system MUST support structured sections on each Issue: problem framing(s) (multiple allowed), constraints, stakeholders, known facts/evidence, and open questions/unknowns.
- FR-012 [US3, US5, US11; PRD §Issue Creation and Structure]: The system MUST support the Issue statuses Open, Exploring, Decided, Reopened, and Archived.
- FR-013 [US5; PRD §Issue Creation and Structure]: The system MUST restrict status transitions to the Issue's delegated facilitator.
- FR-014 [US5; PRD §Decision Records]: The system MUST require a Decision Record before allowing an Issue to transition to "Decided."
- FR-015 [US2; PRD §Issue Creation and Structure]: The system MUST require a stated, visible reason when an Issue is Reopened.
- FR-016 [US2; PRD §UX Principles]: The system MUST present Issues via navigation, not a feed stream.

**Perspectives**

- FR-017 [US4; PRD §Perspectives]: The system MUST allow any member to submit a Perspective as a first-class object attached to an Issue.
- FR-018 [US4; PRD §Perspectives]: The system MUST require the member to manually tag each Perspective with one of the Space's configured taxonomy types.
- FR-019 [US4; PRD §Perspectives]: The system MUST provide as defaults the six taxonomy types Values, Risk, Equity, Feasibility, Relational, and Temporal.
- FR-020 [US4; PRD §Perspectives]: The system MUST support an optional "speaking from direct experience" flag on any Perspective.
- FR-021 [US4; PRD §Perspectives]: The system MUST limit Perspective responses to one level of depth (no deep threading).
- FR-022 [US9; PRD §Perspectives, §Customization and Modularity]: The system MUST allow a Space to rename, add, or remove taxonomy types via configuration.

**Decision Records**

- FR-023 [US5; PRD §Decision Records]: The system MUST capture in every Decision Record: what was decided, how it was decided, key rationales, unresolved objections, and a review date.
- FR-024 [US5; PRD §Decision Records]: The system MUST treat Decision Records as first-class, revisable objects that remain part of Civic Memory.

**Civic Memory**

- FR-025 [US2, US5; PRD §Civic Memory / Issue Timeline]: The system MUST maintain a per-Issue timeline recording major reframings, evidence changes, status transitions, decisions, reopenings, and delegation changes.
- FR-026 [US5, US7; PRD §Civic Memory / Issue Timeline]: The system MUST preserve version history of Decision Records and summaries as Civic Memory entries.

**Liquid Delegation**

- FR-027 [US5; PRD §Authority Model]: The system MUST treat facilitation as a capability delegated per-Issue by the group (not a fixed role).
- FR-028 [US5; PRD §Authority Model]: The system MUST grant to the delegated facilitator on an Issue the authority to perform status transitions, author summaries, and draft Decision Records for that Issue.
- FR-029 [US6; PRD §Authority Model]: The system MUST make every delegation visible, time-bounded, and revocable.
- FR-030 [US6; PRD §Authority Model]: The system MUST allow any member to initiate a referendum on any delegation at any time, subject to threshold and rate-limit rules.

**Referenda**

- FR-031 [US6; PRD Principle 3]: The system MUST require a minimum member or stake threshold (relevant to the decision's scope) to initiate a referendum.
- FR-032 [US6; PRD Principle 6]: The system MUST enforce per-member rate limits on referendum initiation within a configured time window.
- FR-033 [US6; PRD Principle 7]: The system MUST include a structured deliberation phase in every referendum before any vote.
- FR-034 [US6; PRD Principle 5]: The system MUST enforce temporal-stability periods during which delegations and decisions cannot be challenged except under exceptional conditions.

**Quorum and Stall**

- FR-035 [US5, US11; PRD §Quorum System]: The system MUST enforce three-tier quorum per Issue: awareness, participation, and decision.
- FR-036 [US5; PRD §Quorum System]: The system MUST apply default thresholds of 60% (awareness) and 30% (participation) unless the Space has configured otherwise.
- FR-037 [US5; PRD §Quorum System]: The system MUST determine decision quorum based on the Issue's selected decision method.
- FR-038 [US11; PRD §Quorum System]: The system MUST extend the deliberation period and highlight the Issue in the next digest when awareness quorum is unmet at the end of the initial period.
- FR-039 [US11; PRD §Quorum System]: The system MUST mark an Issue "Stalled — insufficient participation" if awareness quorum remains unmet after the extension, and MUST block its transition to "Decided."

**Summaries**

- FR-040 [US7; PRD §Manual Summaries]: The system MUST allow a member with facilitation delegation on an Issue to author and edit an official summary of that Issue.
- FR-041 [US7; PRD §Manual Summaries]: The system MUST version every official summary and make prior versions retrievable.

**Notifications and Rhythm**

- FR-042 [US8; PRD §Notifications and Rhythm]: The system MUST NOT emit real-time notifications, badges, pings, counts, or urgency cues.
- FR-043 [US8; PRD §Notifications and Rhythm]: The system MUST provide a quiet, countless indicator of pending items.
- FR-044 [US8; PRD §Notifications and Rhythm]: The system MUST deliver a single rhythm-based digest per member at a cadence configured by the Space (default: weekly).
- FR-045 [US8; PRD §Notifications and Rhythm]: The system MUST allow individual members to lower (but never the system to raise beyond their chosen cadence) digest frequency.

**Decision Methods**

- FR-046 [US1, US5; PRD §Decision Method Architecture]: The system MUST ship with a consent-based decision method as the default.
- FR-047 [US1; PRD §Decision Method Architecture]: The system MUST use the consent-based method as the hardcoded meta-method for Bootstrap.
- FR-048 [US5; PRD §Decision Method Architecture]: The system MUST allow the decision method to be selected per Issue, or set as a Space default, via configuration.
- FR-049 [US5; PRD §MVP: Consent-Based Process]: The system MUST treat objections as blocking only when argued as paramount (reasoned concern, not preference) and MUST support non-blocking stand-aside.

**Data Export**

- FR-050 [US10; PRD §Data Export]: The system MUST support full data export of a Space's Issues, Perspectives, Decision Records, Civic Memory, and governance profile in open, portable formats.
- FR-051 [US10; PRD §Data Export]: The system MUST NOT impose any lock-in preventing a group from migrating or forking with its data intact.

**Configurability**

- FR-052 [US9; PRD §Customization and Modularity]: The system MUST allow a Space to configure perspective taxonomy, Issue fields, quorum thresholds, and decision method via declarative configuration.
- FR-053 [US9]: The system MUST treat changes to a Space's configuration as Issues, not as direct settings operations.

### Non-Functional Requirements

- NFR-001 [PRD §UX Principles]: The interface MUST embody "Slow UX": no urgency cues, streaks, or engagement hooks.
- NFR-002 [PRD §UX Principles]: The interface MUST be organized around navigation rather than feeds.
- NFR-003 [PRD §UX Principles]: The interface MUST default to "read-first, write-second" presentation on every Issue and Space landing view.
- NFR-004 [PRD §UX Principles]: The system MUST prioritize clarity over expressiveness in structured presentation of Issues and Perspectives.
- NFR-005 [PRD §UX Principles]: The system MUST treat silence as a legitimate participation state, surfaced only via quorum tracking, never as a shaming signal.
- NFR-006 [PRD §UX Principles]: The system MUST contain no dark patterns — no hidden scoring, ranking, manipulative defaults, or forced actions.
- NFR-007 [PRD §Customization and Modularity]: The system MUST be available under a copyleft open-source license.
- NFR-008 [PRD §Customization and Modularity]: The system MUST be self-hostable by any group, independent of any single vendor.
- NFR-009 [PRD §Technical Requirements]: The system MUST remain functional without any AI services (Phase 1 baseline fully human-powered).
- NFR-010 [PRD §Data Export]: The system MUST allow full data export in open, portable formats from day one.
- NFR-011 [PRD §Technical Requirements]: The system MUST be text-first and low-compute, such that a self-hosting group can operate without heavyweight infrastructure.
- NFR-012 [NEEDS CLARIFICATION — accessibility]: The system MUST meet a defined accessibility standard (standard to be specified; see Known Clarifications).
- NFR-013 [NEEDS CLARIFICATION — performance]: The system MUST meet defined performance budgets for interaction responsiveness under typical group sizes (targets to be specified).

### Constitutional Requirements

The CommonGround Constitutional Framework (v2) is load-bearing. All eleven principles are enforced by the system; Tier 1 principles are inviolable (no group decision may override them); Tier 2 principles are deliberable (groups may adjust defaults through CommonGround's own governance process, building precedent in Civic Memory).

**Tier 1 — Inviolable**

- CR-001 [Tier 1, Principle 8 — Removal Due Process]: The system MUST guarantee members subject to removal the right to participate in deliberation, forbid them from blocking final decisions on their own removal, and enforce a transparent process with defined criteria and thresholds.
- CR-002 [Tier 1, Principle 10 — Commons Protection]: The system MUST prevent any decision that privatizes shared infrastructure, restricts exit rights (data, identity, participation), or undermines the revocability of governance. When this principle conflicts with any other, it wins.
- CR-003 [Tier 1, Principle 11 — Forkability]: The system MUST allow any group to fork the software and its governance, provided interoperability standards are maintained.

**Tier 2 — Deliberable**

- CR-004 [Tier 2, Principle 1 — Bootstrap]: The system MUST establish initial governance via a hardcoded consent-based meta-method, and MUST record its outcome as the first Decision Record.
- CR-005 [Tier 2, Principle 2 — Revocability]: The system MUST make every delegation revocable and MUST refuse to record any delegation marked irrevocable.
- CR-006 [Tier 2, Principle 3 — Bounded Referendum Right]: The system MUST permit any member to initiate a referendum only when supported by a minimum threshold of members or stake relevant to the decision's scope.
- CR-007 [Tier 2, Principle 4 — Scope and Subsidiarity]: The system MUST route decisions to the lowest competent level and MUST restrict referendum participation to those materially affected.
- CR-008 [Tier 2, Principle 5 — Temporal Stability]: The system MUST enforce stability periods for delegations and decisions during which they cannot be challenged except under exceptional conditions defined by the Space.
- CR-009 [Tier 2, Principle 6 — Rate Limiting]: The system MUST enforce per-member limits on the frequency of referenda or governance actions within a given time window.
- CR-010 [Tier 2, Principle 7 — Deliberation First]: The system MUST include a structured deliberation phase in every referendum before any vote is permitted.
- CR-011 [Tier 2, Principle 9 — Participation Integrity]: The system MUST enforce quorum thresholds, track diversity of participation to avoid capture, and require transparent rationale in every Decision Record.

**Conflict Resolution**

- CR-012 [PRD §Conflict Resolution]: When deliberable principles conflict with each other, the system MUST surface the tension as an Issue that the group resolves through CommonGround, creating precedent in Civic Memory; inviolable principles MUST always take precedence.

---

## Success Criteria

Success is defined qualitatively (groups governing better) with a small number of measurable proofs-of-concept.

**From PRD §Success Metrics (qualitative):**

- SC-001: Pilot groups report fewer meetings after adopting CommonGround relative to their pre-adoption baseline.
- SC-002: Pilot groups report shorter meetings on governance topics.
- SC-003: Pilot groups report reduced re-litigation of past decisions (decisions stay decided, with revisions made through Reopen → Decision Record cycles rather than informal re-argument).
- SC-004: Pilot groups report increased perceived fairness of governance processes.
- SC-005: Pilot groups report reduced burnout among facilitators and stewards.
- SC-006: Retention — members keep coming back voluntarily at their chosen cadence, without engagement prompts.

**Additional measurable criteria (governance-primitive proofs):**

- SC-007: In a pilot group of 10–20 members, at least 80% of Issues that reach "Decided" status do so without re-litigation within 6 weeks of their Decision Record.
- SC-008: In every governed Issue, the Decision Record contains all five required elements (what, how, rationale, unresolved objections, review date) without manual data cleanup.
- SC-009: No pilot group's Space contains a decision that violates a Tier 1 principle (Commons Protection, Removal Due Process, Forkability) — validated by post-hoc audit of Civic Memory.
- SC-010: In at least one pilot group, a delegation is successfully revoked via referendum within the pilot period, demonstrating that the revocability machinery works end-to-end.
- SC-011: Every pilot group can execute a full data export and reconstruct its governance state from the export alone.

**Explicitly NOT success criteria:** daily active users, time on platform, engagement rate, notification open rate, or any attention metric.

---

## Known Clarifications Needed

- [NEEDS CLARIFICATION: Accessibility] The PRD does not specify an accessibility target. Proposed default: a recognized WCAG-level standard appropriate to the group's statutory context. Requires decision before Phase 2 planning.
- [NEEDS CLARIFICATION: Performance targets] The PRD does not specify interaction-latency or digest-delivery latency targets. Requires decision on perceived-responsiveness budgets for Issues list, Issue view, and Perspective submission under typical (5–200 member) group size.
- [NEEDS CLARIFICATION: Authentication architecture] The PRD specifies "standard web authentication" without defining the identity model, account recovery behavior, or whether federated/SSO options are required for Phase 1.
- [NEEDS CLARIFICATION: Business model] The PRD is silent on whether hosted deployment is free, cooperatively funded, subscription-based, or donation-based. Affects Space creation flow and cooperative-hosting partnerships.
- [NEEDS CLARIFICATION: Detailed acceptance criteria per feature] The PRD's functional section is high-level. Each FR above requires a second pass of feature-level acceptance criteria during Phase 2 planning.
- [NEEDS CLARIFICATION: Scope of "materially affected"] CR-007 (Principle 4 — Subsidiarity) requires a rule for determining which members are materially affected by a given decision. Default heuristic and override mechanism are not specified.
- [NEEDS CLARIFICATION: Rate-limit defaults] CR-009 (Principle 6) requires default rate-limit thresholds and time windows. Not yet specified.
- [NEEDS CLARIFICATION: Temporal-stability defaults] CR-008 (Principle 5) requires default stability periods for delegations and decisions, and a definition of "exceptional conditions." Not yet specified.
- [NEEDS CLARIFICATION: Export export-authority rule] FR-050 does not specify which member(s) can trigger an export. Candidate rule: export is itself an Issue (consistent with FR-004), but a fast path may be required for Tier 1 exit rights.
- [NEEDS CLARIFICATION: Removal threshold defaults] CR-001 (Principle 8) specifies "defined criteria and thresholds" but leaves defaults open.
- [NEEDS CLARIFICATION: Diversity-of-participation measurement] CR-011 (Principle 9) requires a measurable definition of diversity-of-participation to detect capture. Not yet specified.

---

## Out of Scope (Phase 1)

The following are explicitly deferred to Phase 2 or Phase 3 per PRD §Phased Roadmap and are NOT part of this specification.

**Deferred to Phase 2 (AI Layer + Decision Methods):**

- AI auto-classification of Perspectives by taxonomy type.
- AI clustering of similar viewpoints.
- AI surfacing of agreement points and typology of disagreement.
- AI labeling of epistemic uncertainty ("what we don't know" surfaced first).
- AI-generated editable summaries alongside manual ones.
- Any AI capability that recommends decisions, ranks people, predicts outcomes, or displays support/oppose ratios (permanently out of scope, not deferred).
- Additional decision methods beyond consent: quadratic voting, sociocracy variants, sortition, liquid democracy, deliberative polling.
- Richer Decision Record rationale capture beyond the five required fields.

**Deferred to Phase 3 (Federation + Ecosystem):**

- Governance profile templates (co-op, board, indigenous governance, consensus-based) as community-contributed presets.
- Delegation visibility dashboards and analytics beyond the per-Issue timeline.
- Federation between Spaces / cross-Space Issues.
- Cooperative hosting partnerships.
- Bridges to other ICOS modules (Personal Commons Vault, Conflict Repair, Knowledge Commons, Stewardship, Ecological Commons, Federated AI Guide).

**Out of scope, not deferred:**

- Real-time notifications, badges, unread counts, or urgency cues (permanently excluded by UX principles).
- Gamification, leaderboards, streaks, points, or any engagement mechanics.
- Anonymous participation at scale / mass social debate.
- Replacing formal legal processes (incorporation, statutory votes, contracts).

---

## Traceability Notes

- Every FR cites the originating User Story and PRD section.
- Every CR cites its constitutional tier and principle number.
- Every SC is either drawn from PRD §Success Metrics or is a new measurable criterion testing a specific governance primitive.
- Known Clarifications map 1:1 to gaps acknowledged in PRD §closing note ("detailed acceptance criteria per feature, accessibility requirements, performance targets, authentication architecture, business model"), plus gaps discovered while deriving Constitutional Requirements.

---

*End of specification. The Phase 2 plan will select technical approaches (architecture, data model, interface technology, deployment, AI adapter pattern) that satisfy these requirements without reopening their WHAT and WHY.*
