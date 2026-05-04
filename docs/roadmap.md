# Integral Commons — Development Roadmap

**Version:** 1.0
**Date:** 2026-05-03
**Status:** Living document. Phases are gated — each phase begins only when the decision criteria for the previous phase are met.

---

## Current State

CommonGround (Layer 5 — Governance) is in active development. The following is built and operational:

| Area | What exists |
|---|---|
| Auth | Magic link email authentication |
| Spaces | Group containers with configurable governance profiles |
| Issues | 5-phase deliberation objects (open → exploring → decided) |
| Perspectives | Structured perspective taxonomy |
| Delegations | Per-issue and space-wide capability grants; structurally irrevocable |
| Referenda | Bounded referendum process for delegation changes and governance |
| Decision Records | Finalized, supersedeable outcome records |
| Civic Memory | Timeline event log covering full governance history |
| Quorum | Participation tracking and stall detection |
| Constitutional tests | CR-001 through CR-012 — blocking test suite |

**Stack:** Next.js · TypeScript · PostgreSQL · Drizzle ORM · Tailwind · Fly.io

---

## Phase 1 — Foundation

**Goal:** Two to three pilot neighborhoods using Local Commons for real coordination and real governance decisions. CommonGround proven at neighborhood scale. Data model validated for forward compatibility with Phase 2 layers.

**What remains to build:**

### CommonGround completion
- [ ] Official summary / AI sense-making (manual summaries Phase 1; AI-assisted Phase 2)
- [ ] Digest delivery system (daily/weekly/monthly email)
- [ ] Export: full data export in Markdown/JSON (Civic Memory, Decision Records, member data)
- [ ] Governance profile UI — neighborhoods configure quorum thresholds, deliberation windows, decision method defaults

### Local Commons (neighborhood coordination layer)
- [ ] Resource Registry — member-contributed inventory of what the neighborhood has (skills, tools, space, materials)
- [ ] Needs & Offers — mutual aid board; time-bounded exchange requests; gift-first default
- [ ] Stewardship Record — non-evaluative participation history; descriptive, no scores
- [ ] Time credits — opt-in coordination mechanism; gift-first; 1 hour = 1 credit; neighborhood-local
- [ ] Neighborhood Launch Protocol — three-part onboarding (pre-seed, Launch Kit event, CSV import)
- [ ] Commons Charter — neighborhood-authored document governing shared infrastructure
- [ ] Steward role — coordinating member with Steward-level alerts and emergency action capability; no permanent authority; revocable by governance
- [ ] Anonymous membership tier — vouched, participation-enabled, name not held by platform
- [ ] Boundary definition — plain-language description (Phase 1); map polygon deferred to Phase 2
- [ ] Offline/low-tech access — printable summaries; proxy-assisted participation

### EIL integration (in parallel — independent)
- [ ] EIL data schema compatibility verified with governance layer
- [ ] Ecological scope flag on governance Decisions — triggers EIL data attachment as deliberation artifact
- [ ] Community annotation layer — Stewards can annotate EIL data with local knowledge

### Pre-launch prerequisites
- [ ] WCAG 2.1 Level AA baseline audit
- [ ] English only at launch; Spanish as fast-follow
- [ ] Security hardening pass
- [ ] Data retention and deletion policy implemented
- [ ] Legal review: time credits (are they regulated in pilot jurisdictions?)
- [ ] Care coordinator recruitment for each pilot neighborhood (CIP prerequisite — see Phase 2 gate)

**Phase 1 success metrics:**

| Metric | Target |
|---|---|
| Pilot neighborhoods active | 2–3 |
| Governance decisions completed with Decision Records | ≥ 5 per neighborhood |
| Exchange completions (Needs & Offers) | ≥ 20 per neighborhood |
| Member retention at 90 days | ≥ 40% |
| Steward burnout rate | 0 at end of Phase 1 |

---

## Phase 1 → Phase 2 Decision Gate

**All of the following must be true before Phase 2 build begins:**

1. **Operational pilots.** At least 2 neighborhoods have been using Local Commons for real decisions for at least 90 days.
2. **Forkability verified.** At least one community has successfully performed a full data export, stood up their own instance from it, and confirmed that their governance history, Civic Memory, and Stewardship Records are intact. This is a test, not just a capability.
3. **Governance proven.** At least 10 Decision Records completed across pilots. Constitutional rules have held — no CR violations observed in production.
4. **Steward sustainability confirmed.** No Steward in any pilot neighborhood has burned out or departed due to platform load. If Stewards are overloaded, Phase 2 does not begin until the problem is addressed.
5. **Care coordinator infrastructure ready.** Before CIP pilots begin, 1–2 care coordinators per pilot neighborhood must be recruited and a peer support channel must exist for them. Care coordinators begin carrying load at Phase 2 launch; support infrastructure cannot be deferred past that point.
6. **EIL schema compatibility confirmed.** Phase 1 data models for governance Decisions are forward-compatible with EIL integration and Synapse (Phase 2). No rebuilds required.
7. **Legal review complete.** Time credit and Commons Fund legal review has concluded for pilot jurisdictions.

---

## Phase 2 — Depth and Care

**Goal:** Relational care layer operational. Resource flow layer (Kindred-first) operational. MCS pilots in 1–2 municipalities. CommonGround AI sense-making layer.

**Build order within Phase 2:**

### CIP — Care Integration Platform (Layer 4)
First Phase 2 priority. Depends on Local Commons being operational and care coordinators being recruited.

- [ ] Support Circles — private, invitation-only care circles (2–8 people); deleted 30 days after close
- [ ] Care Holds — coordinator-held awareness that a neighbor needs a care circle; anonymous or named
- [ ] Repair Threads — 4-phase conflict repair process; harmed party controls pace
- [ ] Care Coordination View — aggregate signals only; no member detail visible to anyone
- [ ] CIP ↔ Local Commons boundary — circles can use Local Commons Exchange Requests for material logistics without making the care relationship visible
- [ ] Care coordinator well-being check — expanded from Phase 1 baseline

### Flow Engine — Kindred (Layer 2, component 1)
Second Phase 2 priority. Depends on Local Commons exchange infrastructure.

- [ ] Attestation-based gift ledger — mutual attestation required; both parties opt in
- [ ] Time credit recording — opt-in, per-act; gift-first default
- [ ] Demurrage — credits expire at 12 months (configurable shorter, never longer)
- [ ] Flow-over-stock UI — circulation visible; personal totals private
- [ ] No aggregate scores, no gating, no comparison mechanics (Kindred design principles — architecturally enforced, not policy)
- [ ] Individual data redaction on request

### CommonGround — AI sense-making (Phase 2 of CommonGround)
- [ ] AI-assisted Integration Summary (editability required; manual override always available)
- [ ] Perspective auto-classification (manual override always available)
- [ ] AI transparency: all AI contributions are labeled and attributable; no silent AI

### MCS — Modular Civic Stack (Layer 5, civic)
After CommonGround is proven at group scale (Phase 1 success criteria met).

- [ ] Decision Authority Contract — required before any process opens
- [ ] Core policy modules: Budget Participation, Land Use, Policy Review, Community Priority Setting
- [ ] Demographic representativeness tracking for quorum
- [ ] Pilot deployment: 1–2 municipalities
- [ ] Accessibility: WCAG 2.1 Level AA; multilingual from day one in pilot jurisdictions
- [ ] Accountability layer — tracks whether DACs were honored

### Flow Engine — Equip (Layer 2, component 2)
After Local Commons Registry is stable.

- [ ] Cross-neighborhood asset inventory and check-out
- [ ] Item lifecycle: available → checked out → maintenance → repair → retired
- [ ] Durability tracking on items (not users)
- [ ] Repair fund governance via CommonGround/Local Commons governance
- [ ] Manual check-out confirmation (IoT hardware deferred to Phase 2+)

---

## Phase 2 → Phase 3 Decision Gate

1. **CIP validated.** At least 3 support circles completed in pilot neighborhoods. Care coordinators have not burned out. The platform did not instrumentalize any care relationship.
2. **Kindred anti-social-credit audit.** Independent review of Kindred data model confirming no per-person aggregate scores exist in any form — not computed, not cached, not derivable. This is an architectural audit, not a policy review.
3. **Forkability at Phase 2 scale.** A community that has used both CommonGround and Local Commons has successfully forked. CIP data is properly excluded from the fork (privacy requirement).
4. **Phase 3 federation architecture investigated.** The open question flagged in the architecture doc (what are the coordination primitives at federated scale? what must be in Phase 1/2 data models?) has a documented answer before federation work begins.
5. **MCS pilot completed.** At least one Decision Authority Contract has been honored and the outcome documented in the accountability layer.

---

## Phase 3+ — Federation and Intelligence

**Goal:** Neighborhoods can federate. Local Commons Decision Records can feed into MCS Civic Processes. Intelligence Layer has real data to synthesize.

These are directions, not scoped features — design happens closer to build.

### Federation (cross-neighborhood coordination)
- Local Commons → MCS: neighborhood Decision Records become structured inputs to municipal Civic Processes
- Cross-neighborhood Kindred: gift ledger spanning multiple Local Commons instances
- Synapse (Flow Engine, component 3): participatory need/capacity matching at regional scale; ZKP for household privacy; EIL ecological constraints as hard limits
- Phase 3 requires a different coordination architecture than Local Commons at neighborhood scale — not just more capacity

### Intelligence Layer (Layer 6)
Last to build. Requires operational data from all other layers.

- Cross-layer pattern synthesis: governance-care correlations, resource-need mismatches at scale, ecological-governance clustering
- Eight hard constitutional constraints enforced architecturally (see `intelligence-layer-prd.md`)
- CIP data excluded from all synthesis
- All outputs are legibility artifacts — never recommendations, never predictions, never scores
- Public methodology; all outputs editable and contestable by communities

### Governance of the framework
- Transition of constitutional framework governance from founding team to federated community body
- Framework Accountability principle (Principle 7) requires a documented transition timeline before Phase 3 begins — governance rights retained "for now" tend to stay retained

---

## Deliberately Deferred (Not On the Roadmap)

These are not future roadmap items. They are design decisions that will not be built:

- Reputation scores, trust ratings, or contribution rankings for members
- Predictive models for governance outcomes or member behavior
- Recommendation engine of any kind (governance decisions, exchanges, connections)
- Social media mechanics (feeds, likes, follower counts, engagement metrics)
- Advertising or behavioral data monetization
- Blockchain or smart contract execution (hosted Postgres is the architecture)
- Native mobile app in Phase 1 (mobile-responsive web only)
- IoT hardware integration in Phase 1 (Equip manual check-out only)
- Full participatory economic planning (Synapse Phase 3; beyond current planning horizon)

---

## Open Items Requiring Resolution Before Phase 2

1. **Pilot neighborhood identification.** Phase 1 requires real pilots — not internal testing, but actual neighborhoods. Pilot agreements, onboarding support, and feedback mechanisms need to be in place before Phase 1 can complete.

2. **Care coordinator recruitment.** Phase 2 cannot begin without care coordinators in place and peer support infrastructure ready. This is a human and organizational task, not a technical one.

3. **Governance transition timeline.** Phase 1 concentrates some authority in the founding team. A documented, binding timeline for transitioning constitutional framework governance to the communities using the system must exist before Phase 3 begins. "We'll do it later" is not acceptable — later tends to stay later.

---

## Business Model

**Resolved: open source / commons, not SaaS.**

- All code is AGPL-licensed. Any community can self-host at no cost, always.
- No feature gating, no subscription tiers, no premium plans.
- Hosted option available on contribution basis, not mandatory subscription.
- Sustainability: institutional services revenue (municipalities and organizations paying for implementation support, not per-seat access) + grants + public funding + voluntary community contributions.
- Commons Fund: a portion of institutional services revenue held for low-income communities and under-resourced organizations. Structural commitment, not discretionary.
- Long-term goal: recognition and funding as public digital infrastructure.

The SaaS model (neighborhoods pay monthly subscription) is explicitly off the table. Charging communities to access civic infrastructure contradicts the "not a platform" principle.

---

*This roadmap supersedes `ICOS_Roadmap.md` (the original pre-design roadmap, now deleted). It is derived from the layer PRDs, architecture document, and Kindred design principles. When individual PRD phase sections conflict with this document, raise it as a governance question — do not resolve silently.*
