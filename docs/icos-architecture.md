# Integral Commons — System Architecture

**Version:** 1.0
**Date:** 2026-05-03
**Status:** Living document

---

## What This System Is For

Most technology systems optimize for three things: efficiency, engagement, and profit. These are not bad goals in isolation. The problem is that maximizing them — making systems maximally efficient, maximally engaging, maximally profitable — produces systems that extract value from social and ecological systems rather than regenerating them. The platforms built on these goals are not neutral infrastructure. They have made specific choices about what counts, who matters, and what growth means. Those choices are legible in what the platforms track, what they reward, and what they make invisible.

Integral Commons is built around a different optimization target: **coherence, care, and regeneration**.

- **Coherence** — systems that hold together across scales without losing their essential nature at each level. A neighborhood governance process and a city governance process are coherent when they share principles, honor each other's sovereignty, and can interoperate without one subsuming the other.
- **Care** — infrastructure that values what markets ignore: emotional labor, receiving help, vulnerability, the quality of relationships, the texture of belonging. Care is not a feature. It is the point.
- **Regeneration** — systems that restore rather than deplete the social and ecological commons they depend on. Every exchange, every decision, every care act that passes through Integral Commons should leave the commons at least as healthy as it found it.

These are aspirations, not guarantees. Integral Commons cannot produce coherence, care, or regeneration by itself. It can create conditions for them — or it can undermine them. Everything in this document is about creating conditions.

---

## The Layer Model

Integral Commons is not a single application. It is a system of six interdependent layers, each of which is independently useful and together forms a commons operating system.

```
╔══════════════════════════════════════════════════════════════════╗
║   LAYER 6: INTELLIGENCE                                          ║
║   AI sensemaking · Pattern recognition · Synthesis               ║
║   Making collective complexity legible without replacing judgment ║
╠══════════════════════════════════════════════════════════════════╣
║   LAYER 5: GOVERNANCE                                            ║
║   CommonGround (group scale) · MCS (civic/municipal scale)       ║
║   Participatory decision-making · Constitutional accountability  ║
╠══════════════════════════════════════════════════════════════════╣
║   LAYER 4: RELATIONAL CARE                                       ║
║   CIP — Care Integration Platform                                ║
║   Care relationships that cannot and should not be quantified    ║
╠══════════════════════════════════════════════════════════════════╣
║   LAYER 3: ECOLOGICAL AWARENESS                                  ║
║   EIL — Ecological Impact Layer                                  ║
║   Real-time impact data · Uncertainty · Non-human stakes         ║
╠══════════════════════════════════════════════════════════════════╣
║   LAYER 2: RESOURCE FLOW                                         ║
║   Flow Engine — Synapse · Equip · Kindred                        ║
║   Matching needs to capacity · Commons exchange · Care credits   ║
╠══════════════════════════════════════════════════════════════════╣
║   LAYER 1: LOCAL COORDINATION                                    ║
║   Local Commons                                        ║
║   Neighborhood: Resource Registry · Mutual Aid · Governance      ║
╚══════════════════════════════════════════════════════════════════╝
```

These layers are not a hierarchy. They are nested holons — each contains elements of the others, each is shaped by the others, and no layer is more fundamental than any other. The vertical diagram is a reading convenience, not an ontological claim about which layer matters more.

### What each layer optimizes

| Layer | Component(s) | Core optimization | What it makes visible |
|---|---|---|---|
| 1 · Local coordination | Local Commons | Neighbor relationships, mutual aid, place-based governance | What the neighborhood already has |
| 2 · Resource flow | Flow Engine (Synapse, Equip, Kindred) | Movement of materials, skills, time, and care credits through the commons | How capacity and need can meet |
| 3 · Ecological awareness | EIL | Decisions made with ecological consequences visible and contested | What decisions cost the non-human world |
| 4 · Relational care | CIP | The health of care relationships, support for vulnerability, repair after harm | What cannot and should not be tracked |
| 5 · Governance | CommonGround, MCS | Collective sense-making, constitutional integrity, accountability for power | How decisions are made and by whom |
| 6 · Intelligence | AI layer | Pattern recognition and synthesis across the system | What no single layer can see alone |

---

## The Holonic Principle

Integral Commons instances are **holons** — each is whole in itself and part of something larger.

A neighborhood (Local Commons instance) is a coherent whole: it has its own governance, its own resource commons, its own care relationships. It is also part of a city (MCS layer), which is part of a bioregion (EIL layer), which is part of the global commons (Phase 3+ federation).

Each level of the holon retains its sovereignty. A neighborhood's Decisions cannot be overridden by municipal governance. A municipality cannot override bioregional ecological data. Higher-level holons inform lower-level holons; they do not command them. The relationship is consultative, not hierarchical.

What makes this coherent — rather than just decentralized — is a shared constitutional layer. The six Tier 1 inviolable principles from the CommonGround Constitution apply to every Integral Commons layer and every holon within them:

1. **Revocability** — All delegations of authority are revocable. No delegation may be made permanent at any level.
2. **Due Process** — Members subject to removal are entitled to transparent criteria, participation in deliberation, and defined thresholds.
3. **Commons Protection** — No decision may privatize shared infrastructure, restrict exit rights, or undermine the conditions for collective sense-making. This principle is supreme.
4. **Forkability** — Any holon may fork its governance profile and leave with its data.
5. **Holonic Nesting** — Higher-level holons cannot override the Tier 1 principles of lower-level holons. Sovereignty flows downward; accountability flows upward.
6. **Deliberation** — No decision proceeds without structured deliberation. Voting without deliberation is constitutionally prohibited.

These six principles are the grammar of the system. Individual layers add vocabulary; none may contradict the grammar.

---

## Layer Interactions

Layers are designed to interoperate, not to be fused into a monolithic application. Integration is opt-in and bilateral — no layer can be integrated without the consent of both parties. The data flows below are the designed interoperability, not mandatory coupling.

### Local Commons ↔ EIL

Neighborhood governance Decisions with ecological scope automatically request EIL impact data as a deliberation artifact, visible to all participants alongside Perspectives. Community annotations from Local Commons Stewards — local knowledge that corrects or contextualizes EIL metrics — feed back into EIL's Annotation Layer for that territory. The relationship is bidirectional: Local Commons informs EIL's ground truth; EIL informs Local Commons's governance.

### Local Commons ↔ CommonGround

Local Commons's Lightweight Governance layer is CommonGround configured for neighborhood context — not a fork, a profile. Changes to the CommonGround constitutional framework propagate to Local Commons governance profiles. Neighborhood governance experiments that prove out in Local Commons can be contributed back as governance profile templates for the CommonGround community.

### EIL → Flow Engine

EIL provides ecological capacity constraints — carbon budget, water availability, biodiversity thresholds for a bioregion — that shape what the Flow Engine can route. These are not suggestions; they are constraints that bound what "optimal" resource matching means. A resource flow that exceeds a bioregional water threshold is not optimal regardless of what other metrics say.

### CIP ↔ Local Commons

Care relationships held in CIP are not visible to Local Commons's Stewardship Record — by design. But CIP's support circles can use Local Commons coordination infrastructure (Exchange Requests, Steward alerts, Registry access) when a care need requires material resources. The care layer and the resource layer talk; they don't merge. A support circle coordinating care for a neighbor going through cancer treatment can request a casserole dish from the Registry without making the care relationship visible to the neighborhood.

### CommonGround ↔ MCS

Neighborhood-level Decisions in CommonGround/Local Commons can feed into city-level Civic Processes in MCS as named inputs. A neighborhood's deliberation on a zoning change becomes a structured community input to the municipal process, with full Decision Record documentation. The relationship is consultative and unidirectional in authority: city governance cannot override neighborhood governance, but neighborhood deliberation can formally inform municipal governance in a way that the city must acknowledge.

### AI layer → all other layers

The intelligence layer receives structured outputs from all other layers and surfaces cross-layer patterns: resource utilization trends, governance participation gaps, ecological data contests clustering in the same territories, care load concentrating on specific Stewards. It does not recommend; it makes visible. The output of the AI layer is always a legibility artifact — a structured summary of what the data shows — not a decision or a score.

### EIL → CommonGround/MCS

When a governance Decision or Civic Process is created with ecological scope, EIL data attaches as a deliberation artifact. Proxy statements and territorial annotations from EIL's Annotation Layer appear alongside Perspectives in deliberation, giving non-human stakeholders a structural presence in governance decisions that affect them.

---

## Shared Design Principles

All Integral Commons layers are built on these principles. Individual layers may add constraints; none may remove these.

**No extraction.** No Integral Commons layer monetizes user behavior, attention, or personal data. Every layer's revenue model is stated openly and does not depend on advertising, behavioral data sales, or engagement maximization.

**Slow when it matters.** Speed is not a design goal for decisions with significant consequences. Minimum deliberation windows, uncertainty quantification, ecological consideration requirements, and care-first process design all exist to prevent the velocity of technology from outrunning the judgment of communities.

**Exit is a right.** Every layer supports full data export in open formats. Members can leave any layer without losing their history. No lock-in at any level of the stack.

**Transparency of process.** Governance decisions, methodology choices, and the exercise of delegated authority are visible. Opacity is a design failure.

**Resilience over optimization.** A system that fails gracefully — reverts to human coordination when the platform is unavailable — is more trustworthy than one optimized for a single condition. Integral Commons augments human coordination capacity; it must not become the replacement for it.

**Acknowledge what we cannot do.** Each layer's documentation explicitly names what it cannot achieve: things that require political will, human relationship, or knowledge that no database holds. These are not gaps to be designed away. They are honest boundaries that prevent the platform from overpromising and underdelivering in ways that erode trust.

**The unpaid labor problem.** Each layer depends on human labor that is not compensated by the platform: neighborhood Stewards, community organizers, ecological translators, care circle coordinators, governance facilitators. Integral Commons does not solve this problem — it names it in every layer's documentation, designs to minimize it, and is honest when features require it to exist.

---

## Layer Maturity

Not all layers are equally developed. This is the current state:

| Layer | Component(s) | PRD status | Build status |
|---|---|---|---|
| 1 · Local coordination | Local Commons | v1.2 — mature | Phase 1 planning |
| 2 · Resource flow | Flow Engine (Synapse, Equip, Kindred) | v0.9 — concept PRD written | Phase 2 (after Local Commons) |
| 3 · Ecological awareness | EIL | v2.0 — mature | Phase 1 planning |
| 4 · Relational care | CIP | v1.0 — in progress | Concept stage |
| 5 · Governance (group) | CommonGround | v1.0 — mature | Phase 1 planning |
| 5 · Governance (civic) | MCS | v1.0 — written | Concept stage |
| 6 · Intelligence | Intelligence Layer | v0.8 — concept PRD written | Phase 3 (requires all other layers) |

**Recommended build sequence:** Local Commons and CommonGround first (neighborhood governance is the proving ground for everything else). EIL in parallel (ecological data layer is independent and the most mature technically). CIP and Flow Engine as Phase 2 (depend on Local Commons being operational). MCS after CommonGround is proven at group scale. Intelligence layer last — it requires all other layers to have data worth synthesizing.

---

## A Note on What We Call This

Early documents called this an "OS" — Operating System. The analogy captures modularity and composability. It misleads in one important way: operating systems are deterministic and designed. Communities are emergent and often resistant to design. The "OS" frame imports assumptions about interoperability and control that don't map cleanly to the messy reality of human communities.

A more honest frame: Integral Commons is **civic infrastructure**. Like roads and water systems, it serves communities without defining them, becomes invisible when it's working well, and can be used by people who don't understand how it works. Infrastructure at its best makes what communities already want to do more possible — it doesn't prescribe what they should want.

Or: Integral Commons is a **practice** — like commons governance itself, it's a way of doing things rather than a thing you install. The six constitutional principles are the practice. The platform is one way to embody it.

The name "Integral Commons" replaces the earlier "ICOS." The neighborhood layer is "Local Commons," replacing "LCOS." The abbreviations IC and LC can be used where brevity matters.

## What Integral Commons Is Not

**Not a platform.** Platforms aggregate users to extract network effects. Integral Commons disperses power to the people and communities using it. The goal is to make itself less necessary over time, not more.

**Not a social credit system.** No Integral Commons layer scores, ranks, or evaluates community members. Local Commons's Stewardship Record holds history, not grades. Recognition signals are neighborhood-configured and celebratory, not platform-defined metrics. The platform takes no position on what a good community member looks like.

**Not a solution to political problems.** Integral Commons creates infrastructure for communities to govern themselves better. It cannot compel institutions to share power, cannot undo historical harm, and cannot address structural inequality through design alone. The holonic nesting model describes the ideal relationship between governance scales; it does not describe the current political reality, in which cities have real legal authority over neighborhoods. Integral Commons is designed for the direction the world is moving — toward more bottom-up, decentralized governance — while being honest about the constraints of the present.

**Not monolithic.** The layers are interoperable but not interdependent. A neighborhood can run Local Commons without EIL, without CIP, without MCS. Each layer adds value independently. Integration is a choice, not a requirement.

**Not complete.** Several layers exist only as concepts (Flow Engine, AI layer) or early drafts. This architecture is a direction and a commitment, not a finished design.

## Open Question: Phase 3 Federation

*Flagged for investigation before Phase 2 build begins.*

Local Commons is explicitly capped at ~500 households. Integral Commons's Phase 3 vision includes federation between neighborhoods. The features that make Local Commons work at its current scale — vouching-based membership, quorum scoped to affected members, Steward conflict alerts, individual exchange coordination — become architecturally problematic at federation scale. This isn't a simple "add more capacity" problem; it may require fundamentally different coordination mechanisms at the federated layer, not just Local Commons at larger scale.

Before Phase 2 design is finalized, the Phase 3 federation architecture needs investigation: What are the coordination primitives at federated scale? What must be built into Phase 1 data models and schemas to support federation without requiring rebuilds? What does "neighborhood sovereignty" mean when neighborhoods share infrastructure across a federation?

**Not neutral.** Integral Commons makes specific choices about what counts, who matters, and what growth means. Those choices are documented, contestable, and changeable through the governance processes the system itself provides.

---

## Open Questions

1. **Flow Engine scope.** ~~Resolved in flow-engine-prd.md v0.9.~~ Synapse + Equip + Kindred are three components of one layer. The Local Commons/Equip boundary is defined by scope: Local Commons handles neighborhood-scale informal sharing; Equip handles cross-neighborhood asset lifecycle management. Synapse handles participatory economic planning at regional scale. Open questions remain inside the Flow Engine PRD (governance of Synapse parameters, cross-neighborhood trust infrastructure).

2. **Intelligence Layer constraints.** ~~Resolved in intelligence-layer-prd.md v0.8.~~ Eight hard constraints established: no individual profiling, no predictive scores, no optimization targets, no autonomous action, no recommendations, community data ownership, public methodology, CIP data excluded. Open questions remain inside the Intelligence Layer PRD (consent granularity, methodology gaming, null result communication).

3. **Decentralized execution.** Earlier architecture exploration considered smart contracts for governance execution. The current PRDs don't commit to a blockchain model. The choice between decentralized execution and hosted infrastructure has significant implications for accessibility, cost, and governance. This decision needs to be made before Phase 1 build begins.

4. **CIP/Local Commons boundary.** The boundary between relational care (CIP) and coordinated mutual aid (Local Commons Needs & Offers) needs to be precisely defined. The distinction is: Local Commons handles care that can be transacted (I need X, you have X, here is the exchange). CIP holds care that cannot be transacted (ongoing support, grief, repair, presence). Edge cases need explicit handling.

5. **Federation prerequisites.** Phase 3 federation across multiple layers requires technical groundwork in Phase 1. What must be built into the Phase 1 architectures to enable Phase 3 federation without requiring rebuilds?

---

*v1.1. This document establishes the Integral Commons system architecture. Individual layer PRDs (Local Commons, Flow Engine, EIL, CIP, CommonGround, MCS, Intelligence Layer) provide detailed requirements for each layer. This document governs the shared principles and interoperability design that individual layer PRDs must be consistent with. When an individual layer PRD conflicts with this architecture document, the conflict should be raised as a governance question, not resolved silently by either document.*
