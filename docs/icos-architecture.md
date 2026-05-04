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

What makes this coherent — rather than just decentralized — is a shared constitutional layer. The seven Tier 1 inviolable principles from the CommonGround Constitution apply to every Integral Commons layer and every holon within them:

1. **Revocability** — All delegations of authority are revocable. No delegation may be made permanent at any level.
2. **Due Process** — Members subject to removal are entitled to transparent criteria, participation in deliberation, and defined thresholds.
3. **Commons Protection** — No decision may privatize shared infrastructure, restrict exit rights, or undermine the conditions for collective sense-making. This principle is supreme.
4. **Forkability** — Any holon may fork its governance profile and leave with its data.
5. **Holonic Nesting** — Higher-level holons cannot override the Tier 1 principles of lower-level holons. Sovereignty flows downward; accountability flows upward.
6. **Deliberation** — No decision proceeds without structured deliberation. Voting without deliberation is constitutionally prohibited.
7. **Framework Accountability** — The constitutional framework is governed by a federated body drawn from active communities, not by the Integral Commons organization. No change to Tier 1 principles is valid without a supermajority of active community holons. The founding organization is steward of the infrastructure, not sovereign over the rules that govern it.

These seven principles are the grammar of the system. Individual layers add vocabulary; none may contradict the grammar.

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

**Convivial by design.** Every platform feature has a documented offline equivalent. Communities must be able to accomplish the same coordination without the software — even if less efficiently. If a feature has no viable offline analogue, it is creating dependency rather than augmenting existing capacity. The goal is to make the platform less necessary over time, not more. Communities that start from the offline format and adopt the software as an augmentation will have a fundamentally different relationship to it than those who start from the software.

**Refusal as legitimate.** Political non-participation is not the same as apathy. Communities and individual members must have a structural path to formally refuse a process, an integration, or a governance framework as a political act — not merely to not-participate. Refusal that is indistinguishable from silence is a governance design failure. Refusal registered as a deliberate act is information the community needs.

**Power-aware integration.** Every integration point, visibility decision, and data flow must be analyzed for who gains power and what the distributional effect is. The system that makes things visible accrues power over what it makes visible — regardless of intent. This applies to the AI layer, to cross-layer data sharing, and to the Integral Commons organization's own access to community data. Legibility and surveillance are not opposites; they exist on a continuum.

**Empiricism before scaling.** No layer or integration expands to a new context without documented evidence of working in a comparable existing context. Architecture that is ahead of its evidence base should be held as hypothesis, not design certainty. Pilot small and prove it before building for scale.

---

## The Political Claim

Integral Commons is not a neutral platform. It makes specific political arguments through its design choices, and naming them plainly is more honest than the alternative.

**What we are arguing for:**

- Neighborhoods having more substantive decision-making authority relative to municipal governments and market actors
- Care work recognized as civic infrastructure rather than private labor, and supported accordingly
- Ecological systems having standing in governance decisions about the territories they inhabit
- Communities retaining sovereignty over their data, governance history, and coordination infrastructure — not as a legal formality, but as an operative reality
- The commons as a durable institutional form: not a historical artifact or a metaphor, but a living alternative to both market and state organization of shared life

**What this means for every design decision:**

- Features that concentrate power — even in well-intentioned actors — are suspect by default
- Speed that benefits organized, well-resourced actors at the expense of slow, underserved ones is not efficiency
- Technical solutions that create platform dependencies where human coordination capacity existed before are regressions, not advances
- Quantification of what was previously unquantified is not automatically progress
- Neutral infrastructure does not exist: every architectural choice embeds values, and those values should be visible and contestable through the governance processes the system itself provides

---

## Anti-Capture Architecture

Capture — the process by which a system built to distribute power gets redirected to concentrate it — is not a failure mode that happens to some platforms. It is the default trajectory. Well-intentioned infrastructure consistently gets captured: by funders, by founders, by the state, by organized interests, by the market logic it was built to resist. Designing against capture requires naming each specific mechanism and building structural responses.

### Financial capture
*A major funder gains de facto control over mission through funding dependency.*

- Hard cap: no single funding source may exceed 20% of annual budget. This is a constitutional commitment, not a policy preference.
- Grants with governance influence provisions are constitutionally prohibited. The board cannot accept them even by unanimous vote.
- No equity investment, ever. Equity is a claim on future value extraction; it cannot be reconciled with the commons mission.
- Full financial transparency: all funding sources, executive compensation, and budget-to-mission alignment are published proactively, annually.

### Founder capture
*The founding team becomes indispensable and accumulates unchecked power through institutional memory, relationships, and design authority.*

- No permanent founder authority. All roles have defined terms and succession processes.
- Knowledge commons requirement: all architectural decisions, governance rationale, and operational processes are documented in community-accessible form. Institutional knowledge that lives only in a person's head is an organizational liability.
- Succession planning is a Phase 1 deliverable, not a later consideration.

### Board and governance capture
*The board becomes self-perpetuating, ideologically homogeneous, or captured by a single stakeholder class.*

- Community-elected seats: a minimum of 40% of board seats are elected by active communities in the network, not appointed by the existing board.
- No single stakeholder class (workers, communities, funders) holds majority control.
- Supermajority requirements (⅔ minimum) for any changes to Tier 1 constitutional principles, mission, the asset lock, or community governance provisions.
- Staggered terms with mandatory rotation.

### State capture
*Government funding or regulatory requirements gradually reshape the platform toward state interests.*

- Cap on government funding as a percentage of budget, separate from the general 20% cap.
- Community data is not shared with government entities without a valid legal process. Communities are notified when requests are received.
- Advocacy capacity is built from the start: Integral Commons actively shapes the regulatory environment rather than only responding to it.

### Market and mission drift
*Financial pressure produces accumulated small decisions that gradually shift the mission without any single decision being the cause.*

- Annual community-facing mission alignment review: active communities formally vote on whether the organization is living its stated mission. Results are published.
- Sunset clauses on programs and features that generate revenue: must be re-ratified by community governance every three years.
- A "what we will never do" list is constitutionally protected — removing items requires the same supermajority as changing Tier 1 principles.

### Technical capture
*Proprietary dependencies, vendor lock-in, or implementation complexity create chokepoints that communities cannot escape.*

- AGPL license for all code. AGPL closes the SaaS loophole that standard GPL does not: modifications to software used over a network must be released under the same license.
- Developer Certificate of Origin (DCO), not a Contributor License Agreement (CLA). A CLA can grant the organization rights to relicense code proprietary; a DCO cannot.
- Creative Commons BY-SA for all non-code assets: governance templates, facilitation guides, documentation.
- No proprietary dependencies in the critical path. Hosting infrastructure, databases, and authentication must all have documented open-source equivalents.
- Self-hostable as a hard Phase 1 requirement, not a roadmap aspiration.
- Open standards for all data formats and protocols. Communities must be able to migrate to a different implementation without losing their history.

### Data capture
*Centralizing data creates leverage over communities even without intent to use it.*

- Community data sovereignty: data generated by a community belongs to that community. The Integral Commons organization holds it in trust, not in ownership.
- No cross-community aggregation without explicit, revocable consent from each community.
- Data minimization as a constitutional principle: collect only what is necessary for the stated function.
- The AI layer's outputs are owned by the communities they describe. The organization does not have default access to community pattern data.
- Annual data audit: what data does the organization hold, why, and is it still necessary? Published.

### Platform capture
*The platform becomes the chokepoint it was designed to resist because communities cannot leave without losing coordination capacity.*

- Forkability must be tested, not just documented. Before Phase 2, at least one community must have successfully forked and verified that their data, governance history, and operational capacity survive the fork.
- Federation protocols (Phase 3) use or develop open standards that any implementation can speak — not proprietary APIs.
- Full interoperability requirement: communities must be able to export governance records, member data, and resource history in formats that work with other tools.

### Expertise capture
*Key knowledge accumulates in too few people, creating irreplaceable individuals and organizational fragility.*

- Bus factor audit as a quarterly operational check: what happens if person X leaves tomorrow? Anything with a bus factor of 1 is a structural vulnerability requiring immediate documentation.
- Documentation is a constitutional requirement, not a cultural preference. Undocumented systems are anti-commons.
- Community capacity building: communities should understand how the platform works, not just how to use it.

### Narrative capture
*The organization's story replaces communities' stories; Integral Commons becomes the subject and communities become the product.*

- All public communication centers community experiences and community authorship. The organization is infrastructure — when it's working, it should be invisible.
- Communities have the right to withdraw from organizational communications at any time, including removing their story from the website.
- No case studies without community authorship or explicit co-authorship.

### Federation and community capture
*One large, well-resourced community dominates the federated network.*

- Each community has one vote in cross-network governance decisions, regardless of size, resource level, or tenure.
- No single community or community type (geographic, cultural, socioeconomic) may hold majority representation in federation governance.

### Cultural capture
*The organization's internal culture becomes exclusionary or homogeneous, replicating the dynamics it was designed to counter.*

- All salaries are published internally. Compensation transparency is non-negotiable.
- Language access is a Phase 1 requirement at every layer, not a roadmap item.
- Regular power audits of the organization itself: who makes decisions, who holds institutional memory, who is most likely to burn out first. Published.

### The transitional governance problem
There is a real tension between organizational coherence sufficient to build something and distributing governance enough to prevent capture. Phase 1 necessarily concentrates some authority in the founding team. This is legitimate if and only if there is a documented, binding timeline for transitioning those decisions to community governance. Governance rights retained "for now" tend to stay retained. The transition dates are constitutional commitments, not aspirations — and the communities entering the federation in Phase 1 are the primary accountability mechanism for enforcing them.

---

## Organizational Legal Structure

The Integral Commons organization must be structured to make the anti-capture commitments above legally enforceable, not just aspirational policy. Legal structure is not a formality — it determines what a future board can and cannot do without the founding team's involvement.

**Not-for-profit vs. non-profit:** These are not the same. "Non-profit" typically refers to a specific legal status (501(c)(3) in the US) with donor-deductible giving, public benefit requirements, and board governance. "Not-for-profit" is broader: it includes cooperatives, mutual benefit organizations, and other structures that don't generate profit for owners but may exist for member benefit rather than public charity. A standard 501(c)(3) is still vulnerable to board capture, funder capture, and mission drift. Legal non-profit status is necessary but not sufficient.

**Recommended structure:** A multistakeholder cooperative or a nonprofit with mandatory community governance representation encoded in the founding documents. Not a standard 501(c)(3) with an advisory community board — a structure where communities hold formal, legally binding voting rights.

**Asset lock:** On dissolution, all assets transfer to a designated beneficiary (another commons organization, a public trust, or an ecological stewardship body) — never to founders or board members. This must be in the founding documents and cannot be removed without a supermajority of active community holons.

**Licensing commitments:**
- AGPL for all code — constitutionally committed, not just presently intended
- DCO (Developer Certificate of Origin) rather than CLA for contributors — contributors retain rights; the organization gains no power to relicense
- Creative Commons BY-SA for all non-code assets

**Governance structure:**
- Community-elected seats: minimum 40% of board seats elected by active communities
- No single stakeholder class holds majority
- Supermajority requirements (⅔) for constitutional changes
- Staggered terms, mandatory rotation, no permanent founder authority

**Financial commitments:**
- No equity investment accepted
- 20% cap on any single funding source, constitutionally encoded
- Full financial transparency published annually
- Commons fund set-aside from institutional licensing revenue for underserved communities

---

## AI Layer Constitutional Constraints

The AI (intelligence) layer does not yet have a technical architecture. Before that architecture is designed, the following constraints must be constitutionally established. They are not design preferences — they are the framework within which design choices will be made. An AI layer built without this framework will reproduce the surveillance and power dynamics the rest of the system is designed to prevent.

**What the AI layer is categorically prohibited from doing:**

1. Comparing or ranking communities against each other based on any metric or pattern
2. Producing outputs visible to the Integral Commons organization about individual communities without that community's explicit, revocable consent
3. Producing outputs about individual members — AI layer outputs concern communities and networks, never individuals
4. Being used in any funding, eligibility, or prioritization decision about communities by the Integral Commons organization
5. Surfacing care-related signals from CIP data — even in aggregate — to governance or resource layers without explicit community authorization
6. Making recommendations — the AI layer produces legibility artifacts (structured summaries of what the data shows), never recommendations, predictions, or scores

**What the AI layer is for:**
- Helping communities understand their own patterns at a scale they cannot see unaided
- Surfacing cross-layer signals within a single community (resource utilization, governance participation, ecological data) that inform that community's own decision-making
- Identifying structural conditions (care load concentration, participation skew, unmet needs clustering) that invite community attention — not platform intervention

**Data ownership:** AI layer outputs are owned by the communities they describe. Aggregate federation-level signals (Phase 3+) require explicit consent from each participating community and may not be stored by the Integral Commons organization without community authorization.

**The legibility/surveillance distinction:** "The AI layer only shows patterns, it doesn't recommend" is insufficient protection. The framing of patterns is itself a form of recommendation; the system that makes communities legible to themselves also makes them legible to the organization that built it. The prohibition list above is the structural answer, not a design intent.

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
