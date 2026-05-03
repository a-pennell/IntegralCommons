# Modular Civic Stack (MCS) — Product Requirements Document

**Version:** 1.0
**Date:** 2026-05-03
**Status:** Draft
**Category:** Municipal-scale participatory governance infrastructure

---

## Executive Summary

The Modular Civic Stack (MCS) is an open-source, API-driven platform for cities, municipalities, and civic bodies that want to make governance more participatory without replacing the legal structures that make decisions legitimate.

MCS is not a voting app, not a smart city dashboard, and not a citizen engagement platform. It is a deliberation and policy infrastructure layer: a set of composable modules — participatory interfaces, decision methods, policy simulation tools, and interoperability standards — that municipalities can configure for their governance contexts.

The "Shopify for governance" analogy captures something real: Shopify proved that modular, composable tooling could unlock a long tail of commerce that would never have existed otherwise. MCS is testing whether that logic holds for governance — whether composable civic tooling can lower the threshold for substantive participation in municipal governance for communities that are currently excluded.

**What MCS is and isn't.** MCS is infrastructure for civic institutions that have decided to share power. It cannot compel that decision. A city that deploys MCS without genuinely redistributing decision-making authority will get engagement theater — a prettier front end on an unchanged power structure. The platform can lower the technical cost of participation; it cannot create the political will that makes participation matter.

MCS also carries risks that the Local Commons neighborhood context does not. At city scale, governance decisions affect hundreds of thousands of people. Poorly designed participatory processes can amplify existing power asymmetries, manufacture consent for predetermined outcomes, produce unstable policy from organized minorities, or expose vulnerable residents to retaliation. These are not edge cases. They are the normal failure modes of civic technology at municipal scale. This PRD treats them as design constraints, not afterthoughts.

---

## Problem Statement

**Current situation:** Municipal governance is structurally inaccessible to most of the people it governs. City hall is open during business hours. Zoning hearings assume you can read a 200-page environmental impact report. Budget engagement processes reach the same organized stakeholder groups every cycle. The people most affected by governance decisions — low-income renters, people experiencing homelessness, residents with disabilities, workers without flexible schedules — are structurally excluded from most formal participation pathways.

**What exists today:**

| Tool | Failure Mode |
|---|---|
| Traditional public comment | Asynchronous, dominated by organized interests, not integrated into decision-making |
| E-democracy platforms (Consul, DemocracyOS) | Technically capable but rarely tied to actual decision authority |
| Smart city dashboards | Data for administrators, not participation for citizens |
| Deliberative processes (citizens' assemblies) | High quality but expensive, irregular, hard to institutionalize |
| Service request tools (SeeClickFix) | Service management, not governance participation |

No tool addresses the full governance participation stack in a modular, composable way that connects participation to real decision authority.

**Root causes:**

*Coordination failures (the visible layer):*
- Governance processes are not designed for participation at meaningful scale
- Participation pathways are siloed by department and jurisdiction
- No shared infrastructure for deliberation, simulation, or decision tracking
- Policy decisions happen in formats (legal documents, technical reports) that require specialized knowledge to engage with

*Human and social failures (the invisible layer — equally important):*
- Civic participation requires time, literacy, and safety that most people cannot afford
- Historical exclusion of specific communities from governance has created rational distrust of civic processes that no platform can undo
- The people best positioned to participate in formal governance — educated, organized, English-speaking, schedule-flexible — are not the people most affected by governance decisions
- Unpaid civic labor — neighborhood advocates, community organizers, volunteer translators, accessibility coordinators — makes most meaningful civic engagement possible and is invisible in budget models
- Attending a public meeting can be an act of courage for people whose presence in a space is contested: undocumented residents, people in housing disputes with the city, people recently released from incarceration

*Structural and political failures (the layer beneath):*
- Civic technology cannot fix governance designed to exclude — it can only surface the exclusion more visibly
- Participatory processes without decision authority are civic theater. The harm of civic theater is real: it depletes organizer capacity, erodes trust, and provides legitimacy to predetermined outcomes
- Power asymmetries in governance are structural, not accidental. Modular tools that are easier to use for organized, funded, technical stakeholders will amplify existing asymmetries unless specifically designed to counteract them

*Ecological failures (the overlooked layer):*
- Most municipal governance treats the natural environment as a regulated category rather than as a stakeholder. Governance decisions about land use, transportation, water systems, and urban development affect ecosystems that extend beyond city limits — and future residents who have not yet been born. Neither has a voice in current civic processes.

**Proposed solution:** A modular, open-source civic infrastructure layer that municipalities can adopt incrementally — connecting participatory interfaces to real governance processes, providing deliberation tooling alongside simulation capabilities, and building toward interoperability across civic contexts.

**What this is not:**
- Not a citizen engagement platform (where participation goes to die)
- Not a smart city data platform (governance requires judgment, not just data)
- Not a replacement for democratic institutions (MCS requires them as the legitimacy layer)
- Not a shortcut past the hard work of building trust with excluded communities

---

## Product Goals

### Core Goals

1. Lower the technical barrier to meaningful participation in municipal governance — for people currently excluded by format, language, schedule, or literacy
2. Give municipalities a composable toolkit for designing participatory processes that are tied to actual decision authority, not just consultation
3. Create a simulation layer that makes policy trade-offs legible to non-experts — without creating false precision or manufacturing consent
4. Build toward interoperability across civic contexts without forcing governance homogenization
5. Make the unpaid labor that enables civic participation visible and supportable
6. Protect the most vulnerable participants from retaliation, surveillance, and civic theater that depletes their capacity without redistributing power

### Non-Goals

- Replacing elected representative democracy or legal governance structures
- Making governance faster at the expense of deliberation quality
- Building a single global standard for civic participation (governance is contextual by nature)
- Maximizing participation volume (quality and representativeness matter more than numbers)
- Creating surveillance infrastructure for civic participation
- Solving for equity without accompanying political will — the platform can reduce barriers but cannot redistribute power that institutions are not willing to share

---

## Success Metrics

### Primary Metrics

| Metric | Definition | Phase 1 Target |
|---|---|---|
| Participation breadth | % of participants from demographic groups historically underrepresented in civic processes, measured against census data | 40% from underrepresented groups |
| Deliberation quality | % of Processes that include structured perspectives from ≥3 distinct stake groups before resolution | 60% |
| Decision authority linkage | % of participatory processes with explicit statement of what decision authority the process informs | 100% — any process without this is disqualified |
| Process completion rate | % of opened processes that reach a documented resolution (not fade out without closure) | 70% |
| Municipal retention | % of adopting municipalities still using MCS at 12 months | 50% |

### Signals of Failure

- Participation concentrated in already-organized stakeholder groups (same people, new platform)
- Municipalities using processes to satisfy consultation requirements without integrating outputs into decisions
- Simulation layer used to justify predetermined outcomes ("the model shows this is the best option")
- Marginalized communities withdraw from processes after experiencing that their input didn't change outcomes

### Anti-Metrics (explicitly not tracked)

- Total participation volume or submission counts
- Session length, engagement time
- "Reach" (impressions, views)
- Net promoter score

### What Cannot Be Measured (and shouldn't be)

Some of what MCS is trying to support cannot be quantified — and quantifying it would damage it.

- Whether a community's trust in its governing institutions actually improved. Trust is not a metric; it is a quality of relationship that emerges from accumulated experience over years.
- The quality of deliberation that happened in person, in community centers, in kitchens, beside the platform. MCS is infrastructure for civic life, not a substitute for it.
- Whether a policy decision improved life for the most vulnerable residents. That question requires years of follow-up, qualitative research, and honest accounting that no platform can provide.
- The grief, frustration, and accumulated exhaustion that civic organizers carry. Participation data does not capture what it costs people to keep showing up.

---

## People This Serves (And How)

The "default user" assumption in most civic technology is a digitally literate, English-speaking, schedule-flexible adult who trusts institutions enough to engage with them. That person is real and MCS should serve them well. But they are not most people in most cities. The following are all first-class users — not edge cases.

### Residents and Communities

**People most affected by governance decisions** — Low-income renters facing zoning decisions, residents near planned infrastructure, communities experiencing the effects of specific policy choices. They have the most at stake and the least structural access to formal participation. MCS is designed first for them — not for the organizations that claim to represent them.

**Residents who distrust civic processes** — People who have participated in civic processes before and watched their input ignored. People from communities systematically harmed by municipal governance: redlining, urban renewal, policing, displacement. Their distrust is rational, not a design problem to solve. A person who chooses not to participate because they have good reasons not to trust the process is exercising legitimate civic judgment.

**Residents in survival mode** — Neighbors managing precarious housing, irregular income, chronic illness, or caregiving. Civic participation is a luxury they cannot always afford. The platform cannot reach them without the intermediary of community organizations and trusted human networks.

**Residents with disabilities** — Physical, cognitive, and sensory disabilities affect civic participation in ways that most civic processes ignore. Accessibility is a Phase 1 design constraint, not a Phase 2 retrofit.

**Residents without digital access** — Low-income residents, elderly residents, recent immigrants, residents without reliable internet. The platform cannot reach them directly. The infrastructure for reaching them is human: community organizations, libraries, neighborhood associations, organizer networks.

**Residents with reasons to conceal their participation** — Undocumented residents for whom civic participation carries immigration risk. Tenants in disputes with landlords who are also political donors. Workers in industries where political participation could affect employment. Public civic platforms that don't account for these risks actively harm vulnerable participants.

**Non-participating residents** — Some residents will never engage with a civic participation platform. This is acceptable and normal. Their civic interests do not disappear because they aren't in the platform. Governance decisions that affect everyone must account for non-participants, not just the organized.

### Civic Institutions

**Municipal governments and departments** — The adopting institutions. They are the paying clients in most deployment models. This creates a fundamental tension: the platform's value to residents depends on municipalities genuinely redistributing decision authority, but revenue depends on municipalities adopting it. MCS must be designed with explicit safeguards against municipalities using it for participation theater rather than genuine power-sharing.

**Elected representatives** — Mayors, councillors, legislators. Their authority is real and legally constituted. MCS does not bypass or replace them — it creates a structured input channel that they must explicitly acknowledge and respond to.

**Civil servants and administrators** — The people who run the systems participatory governance affects. They often know more about implementation constraints than elected officials or residents. Their knowledge belongs in the deliberation.

### Civic Society

**Community organizers and advocates** — People doing the sustained, underpaid work of mobilizing civic participation in underrepresented communities. They are the most important infrastructure for making MCS reach beyond the already-organized. MCS should reduce their overhead, not increase it.

**Civic technologists** — The builders, deployers, and customizers. They wield enormous structural influence over which communities benefit and which are further marginalized. Their assumptions are baked into the platform in ways that are invisible to most users.

### Ecological and Future Stakeholders

**The local ecosystem** — Urban watersheds, soil, tree canopies, and wildlife are not just regulated categories. They have stakes in governance decisions about land use, transportation, water infrastructure, and urban development. A city that cannot name ecological impacts in its governance processes is governing its own future depletion.

**Future residents** — People who will live with the consequences of today's governance decisions. Long-term policy decisions — zoning, infrastructure, climate adaptation — require representation of interests that do not yet exist in a voting population.

### Existing Governance Structures

**Indigenous governance bodies** — Many cities exist on the traditional territories of Indigenous nations with pre-existing and ongoing governance authority. MCS does not compete with, supplant, or aggregate Indigenous governance into a municipal participation model. Where Indigenous governance bodies exist, MCS must be configured to route decisions affecting their territories through appropriate consultation processes — processes the platform cannot define.

**Faith communities, cultural associations, resident associations** — Existing community governance structures carry trust and legitimacy that MCS has not earned and cannot replicate. Where they exist, MCS should support and connect to them, not compete with them.

### Explicitly Not Designed For

- Cities or institutions using the platform to perform participation without decision linkage
- Property developers, real estate interests, or extractive industries seeking structured access to civic processes
- Advertising-supported or surveillance-based use cases
- Jurisdictions with no genuine interest in redistributing decision authority

---

## Core Conceptual Model

MCS is built on four composable infrastructure layers, situated within a legitimacy framework that they depend on.

```
╔══════════════════════════════════════════════════════════╗
║          LEGITIMACY AND ACCOUNTABILITY LAYER             ║
║   Legal authority · Decision linkage · Auditability      ║
║   (The frame within which all participation occurs)      ║
╠══════════════════════════════════════════════════════════╣
│              POLICY SIMULATION LAYER                     │
│   Trade-off modeling · Impact projection                 │
│   (With explicit uncertainty quantification)             │
├──────────────────────────────────────────────────────────┤
│           PARTICIPATORY INTERFACES LAYER                 │
│   Deliberation · Proposals · Perspectives · Voting       │
├────────────────────┬─────────────────────────────────────┤
│  POLICY MODULES    │   INTEROPERABILITY LAYER            │
│  Governance        │   Cross-jurisdiction standards      │
│  templates         │   Open data · Open formats          │
├────────────────────┴─────────────────────────────────────┤
│         INSTITUTIONAL CONFIGURATION LAYER                │
│   Municipality-specific rules, roles, legal context      │
└──────────────────────────────────────────────────────────┘
```

The Legitimacy and Accountability Layer is not a feature — it is the precondition. MCS is only as useful as the decision authority it is connected to. Every participatory process on the platform must declare, before opening: what decision does this process inform, who holds decision authority, and how will the outputs be used? Without a legitimacy frame, participation is theater.

### The Civic Process (top-level object)

A **Civic Process** is the bounded unit. It has:

- A policy question or decision scope (what are we deciding?)
- A Decision Authority Contract (who makes the final decision, what weight does participation carry, and when?)
- An affected population definition (who has standing to participate?)
- A participation pathway (how can people participate, in what format?)
- A resolution record (what was decided, how was the input used?)

Processes flow through: **Scoping → Open → Deliberation → Resolution → Memory**

### Decision Authority Contract

Every Civic Process requires a **Decision Authority Contract** — a public statement by the responsible institution:

1. What decision is this process informing?
2. Who holds the final decision authority?
3. What weight will participatory input carry in the decision?
4. By what date will the decision be made?
5. How will participants be notified of the outcome and how their input was used?

This is a public commitment that creates accountability and is part of the permanent Process record. A process that violates its own Decision Authority Contract is flagged in the Accountability Layer — visibly, to participants and civil society observers.

---

## Module 1: Policy Modules (Governance Templates)

### Overview

Policy Modules are composable governance templates — preconfigured deliberation formats for common civic decision types. They lower the cost of designing a participatory process from scratch while allowing full customization for institutional context.

### Core Module Types (Phase 1)

**Budget Participation** — Participatory budgeting format. A defined constituency allocates a fixed budget across proposed projects or categories. Includes proposal submission, Q&A period, and weighted allocation.

**Land Use and Zoning** — Structured deliberation for land use decisions. Includes affected area scoping, impact category mapping (traffic, affordability, environment, community character), and perspective collection from multiple stake groups.

**Policy Review** — Public review format for existing policies. Structured feedback by policy section, with categorization of feedback types (factual correction, value disagreement, implementation concern, gap identification).

**Community Priority Setting** — Ranked preference format for identifying community priorities within a defined scope. An input to a decision, not a decision itself — this distinction is stated explicitly in the interface.

**Citizens' Assembly Configuration** — Infrastructure for a formally constituted citizens' assembly: random selection from a defined pool, structured deliberation phases, expert testimony format, and recommendation production.

### Functional Requirements

- Modules are configurable via YAML/JSON — institutions adjust formats without rebuilding
- Each module includes a default Decision Authority Contract template
- Custom modules can be contributed by the open-source community and adopted by institutions
- All modules include accessibility and language support as first-class requirements, not add-ons

**Acceptance Criteria:**
- A municipality with no technical staff can configure and launch a Budget Participation module in under 4 hours using documentation alone
- Every module displays its Decision Authority Contract on the primary participation screen — not buried in an "about" page
- Configured modules can be exported in ODF format and re-imported into any MCS instance

---

## Module 2: Participatory Interfaces

### Overview

The participatory interface layer is how residents engage with Civic Processes. It is designed for the full range of residents — not just the digitally confident.

**On the access gap:** Most residents will never use the platform directly. They may participate through community organizations, libraries, in-person sessions facilitated by human coordinators, or not at all. The interfaces serve direct users well; the infrastructure for reaching non-direct users is human.

**On participation theater:** The most damaging thing participatory governance can do is create the appearance of participation without the substance. Interface elements that imply "your input matters here" must be connected to a real decision pathway — or must not exist.

### Interface Principles

- **Decision context is always visible** — what decision does this process inform? Who makes it? When? On the main screen, not one click away.
- **Participation history is returned** — after a process closes, participants receive a summary of what was decided and how their input was used. No black holes.
- **Anonymized participation is supported** — for residents with reasons to conceal participation
- **Accessibility is non-negotiable** — WCAG 2.1 Level AA; multilingual in pilot municipalities from day one
- **Structured contribution, not free text** — unstructured comment boxes are the lowest-fidelity participation format. Structured perspectives (with prompted reflection) produce more useful deliberation inputs and reduce the advantage of articulate, organized participants over less confident ones
- **Slow when it matters** — minimum deliberation windows enforced; rapid participation is not a design goal for consequential decisions

### Perspective Taxonomy (configurable per Module)

Default civic perspective lenses (adapted from the CommonGround deliberation framework):

1. **Impact** — "How does this affect me or people I know?"
2. **Equity** — "Who benefits, who bears costs, who is excluded?"
3. **Values** — "What matters here, and why?"
4. **Feasibility** — "Can this actually work?"
5. **Ecological / Place** — "How does this affect the natural and built environment?"
6. **Future** — "How does this play out over 10–20 years?"

### Offline and Proxy Participation

Direct digital participation is not the only pathway. MCS supports:

- **In-person facilitated sessions** — structured participation events run by trained facilitators, with outputs entered by the facilitator
- **Paper-based participation** — printable participation forms; outputs entered by coordinators
- **Community organization submission** — registered organizations can submit collective perspectives on behalf of their constituencies, with transparency about the organization's membership and representativeness

**Acceptance Criteria:**
- A first-time participant can submit a structured perspective without reading any instructions
- Participation history (what they submitted, what was decided, how their input was referenced) is accessible to each participant at any time
- An in-person facilitated session produces the same data structure as a direct digital submission
- Anonymized submission is available on any process without requiring a separate account or special request

---

## Module 3: Simulation Layer

### Overview

The simulation layer allows participants and institutions to explore projected consequences of policy options before deciding. Done well, this makes trade-offs legible to non-experts and reveals hidden impacts. Done badly, it manufactures false precision and provides cover for predetermined decisions.

**This layer requires the most careful design in MCS.** The risks are real:

- **False precision** — simulations produce numbers that look authoritative even when the underlying model is highly uncertain. People respond to "$2.3M in savings" differently than to "somewhere between $500K and $5M, with significant uncertainty."
- **Manufactured consent** — a simulation configured to favor a preferred outcome can be used to delegitimize dissent ("even the model says this is the best option")
- **Assumption invisibility** — every simulation encodes assumptions about what matters, what the future looks like, and how systems behave. Those assumptions are political choices. They must be visible.
- **Technical recapture** — if the simulation layer is only understandable by people with quantitative training, it reinstates expert control under a different name

### Simulation Design Principles

**Uncertainty-first.** Every simulation output leads with its uncertainty range, not its point estimate. A projection shown as a range with a confidence level is honest. A single number is not.

**Assumption visibility.** Every simulation includes a public, plain-language explanation of its key assumptions. Participants can challenge assumptions; challenged assumptions are flagged and the process must address them.

**Multi-model support.** No single model is authoritative. For significant decisions, MCS supports parallel models with different assumptions, allowing participants to see how outcomes change under different premises.

**Non-expert legibility.** Simulations must be explainable in plain language by a human facilitator. If a simulation requires a technical degree to interpret, it fails its purpose.

**Human interpretation layer.** Simulation outputs are always accompanied by a plain-language interpretation authored by someone accountable (named civil servant, facilitator, or community liaison) — not generated automatically.

### Simulation Types (Phase 1)

**Budget impact modeling** — project fiscal impact of different budget allocations. Required: uncertainty range, assumption list, minimum 3 scenarios.

**Land use impact projection** — model traffic, density, affordability, and environmental effects of zoning decisions. Required: uncertainty acknowledgment, ecological impact consideration, equity impact consideration.

**Policy comparison** — compare two or more policy options across defined dimensions. Required: dimensions are chosen through deliberation, not predetermined by administrators.

**Acceptance Criteria:**
- Every simulation output displays its uncertainty range before its point estimate
- Assumption lists are readable by a non-expert in under 5 minutes
- Any participant can flag a challenged assumption; flagged assumptions are visible to all other participants
- No simulation result is presented without a named human interpreter responsible for the plain-language summary

---

## Module 4: Interoperability

### Overview

Civic governance is contextual. A budget participation process in Barcelona looks different from one in Bogotá, which looks different from one in Nairobi. MCS does not attempt to create a single global governance standard — that would be colonial in practice regardless of intent.

What MCS does attempt: open standards that allow civic processes, deliberation outputs, and policy data to be shared across jurisdictions when both parties choose to, in formats that preserve context rather than stripping it.

**What interoperability means and doesn't mean:**
- Interoperable ≠ identical. Cities that share a data format can learn from each other without adopting each other's governance models.
- Interoperability is bilateral, not mandated. No city is required to share data with any other.
- Legal and political context does not transfer. A policy that worked in one city cannot be imported as a ready-to-use template without adaptation to local law, politics, and community context.

### Interoperability Standards (Phase 1)

**Open Deliberation Format (ODF)** — JSON schema for civic process records, perspective submissions, and decision records. Compatible with Consul, DemocracyOS, and similar open-source civic platforms.

**Policy Object Model** — standardized representation of policy options and their stated trade-offs, importable across jurisdictions.

**Civic Process Registry** — an opt-in public registry where municipalities can list active processes, allowing civil society organizations to find and engage with governance processes across their region.

---

## Honest Tensions

MCS exists in a space of real tensions that cannot be designed away, only navigated transparently.

**The client is not the community.** In most deployment models, the paying client is a municipal government — not the residents the platform is ostensibly serving. Municipal governments have interests in containing participation rather than expanding it, and in managing outcomes rather than genuinely opening them to community decision-making. MCS must be designed with the knowledge that its institutional clients will sometimes use it against the interests of the people it claims to serve.

**Participation amplifies existing power asymmetries.** The people most likely to engage with a civic platform are those who already have the most access to civic processes: educated, English-speaking, organized, schedule-flexible. Features that lower the access barrier help at the margin but do not address the structural advantage of already-organized interests. Measuring participation volume without measuring representativeness is worse than useless — it produces the appearance of broad legitimacy for processes dominated by organized minorities.

**Modular and rapid can mean capture.** The flexibility that makes MCS useful — configurable modules, local customization, rapid deployment — also makes it easier to configure for exclusion. A zoning process with a narrow affected-population definition, a simulation with invisible assumptions, a deliberation period too short for unorganized residents to engage: these are all technically valid MCS configurations. The platform must make harmful configurations difficult, not merely optional.

**Simulation is not neutral.** The governance decisions most appropriate for simulation-assisted deliberation are often the ones where the underlying values question is being obscured by technical framing. "What's the most efficient use of this land?" is a values question disguised as a technical one. Simulation can reveal trade-offs; it cannot determine which trade-offs are acceptable.

---

## UX Principles

These principles override individual feature decisions when there is tension.

- **Decision context is always visible.** Every interface, at every moment, makes clear what decision is being informed, who makes it, and when. Participation without this context is theater.
- **Participation history is returned.** Every participant receives a summary of how the process concluded and how their input was used. Participation without accountability is extraction.
- **Structured over free-text.** Prompted perspective types produce better deliberation input than open comment boxes and reduce the advantage of articulate, organized participants.
- **Accessible by default.** WCAG 2.1 Level AA. Multilingual. Designed for low digital literacy. Not retrofitted.
- **Uncertainty-first.** Simulation and data outputs lead with their uncertainty, not their point estimate.
- **Slow when it matters.** Minimum deliberation windows are enforced for consequential decisions. Rapid iteration of governance is not a feature.
- **Non-participation is legitimate.** The platform does not pursue, guilt, or report on residents who choose not to participate. Their interests are still present in the governance decision.
- **Anonymous participation is supported.** Residents with reasons to conceal their participation can contribute without their identity in publicly accessible logs.
- **No civic engagement dark patterns.** No gamification, no engagement metrics surfaced to users, no participation streaks, no urgency mechanics.
- **Exit is a right.** All submitted data exportable in open formats. No lock-in.

---

## Technical Requirements

### Architecture

- **Web-based SPA** with progressive enhancement for low-bandwidth environments
- **Open-source (AGPL)** — the legitimacy of civic infrastructure depends on it being publicly auditable
- **Self-hostable** — municipalities with data sovereignty requirements can run their own instance
- **Hosted deployment** for Phase 1 pilots
- **API-first** — all MCS functionality accessible via documented public API; allows integration with existing municipal systems
- **No surveillance infrastructure** — no behavioral tracking, no cross-site data collection, no analytics sold
- **Modular by design** — municipalities can adopt single modules without the full stack

### Identity and Participation

- **Authenticated participation** — most civic processes require verified identity to prevent organized gaming. Verification ties to the jurisdiction's existing authentication infrastructure (local government portal, library card system, resident registry) rather than requiring separate accounts.
- **Anonymized participation** — where residents have reason to conceal participation, MCS supports submission with identity verified but not recorded in public-accessible process records.
- **No third-party auth** (Facebook, Google) — civic participation data does not belong on surveillance capitalism infrastructure.

### Accessibility

WCAG 2.1 Level AA is a Phase 1 requirement. Every module ships with:
- Full keyboard navigation
- Screen reader compatibility (VoiceOver, NVDA)
- No colour-as-sole-information-encoding
- Plain language requirement for all process descriptions (Flesch-Kincaid Grade 8 target)

### Internationalisation

- Phase 1 pilot municipalities determine launch languages
- i18n architecture built from day one — no hardcoded strings, locale-aware formatting
- Community-contributed translation layer (Weblate or equivalent)
- Right-to-left language support in architecture from Phase 1

### Performance Targets

- Page load < 2s on 4G mobile for core participation views
- Participation submission < 5 steps end-to-end
- Municipality onboarding (first process live) achievable in < 1 day with documentation alone

---

## On Unpaid Civic Labor

Civic participation at any meaningful scale runs on unpaid or underpaid labor: community organizers who mobilize participation in underrepresented communities, translators who make processes accessible to non-dominant language speakers, facilitators who run in-person sessions, advocates who push municipalities to actually connect participatory outputs to decisions.

MCS does not compensate this labor. It should at least not increase it.

Design principles that address this directly:
- Modules reduce facilitation overhead rather than create new coordination tasks for community organizations
- The platform provides facilitation guides, plain-language process descriptions, and printable materials that reduce the cost of running in-person sessions
- Institutional licensing is priced to support organizations paying community liaisons for participation mobilization work — not just licensing software

The problem of unpaid civic labor is structural and cannot be solved by a platform. But a platform that ignores it will extract value from the people who do it.

---

## Ecological and Non-Human Stakeholders

At city scale, the non-human stakes in governance decisions are larger and harder to ignore than at neighborhood scale.

Urban governance decisions about land use, transportation, water infrastructure, urban forestry, and climate adaptation affect ecosystems that extend far beyond city limits — watersheds, migratory corridors, regional air quality. Future residents — people not yet born who will live with the consequences of today's zoning and infrastructure decisions — have no formal standing in current civic processes.

**Governance requirements:**

All processes involving land use, infrastructure, or resource policy must include ecological impact as a named consideration in the Decision Authority Contract. The **Ecological / Place** perspective lens is required (not optional) for these process types.

For decisions with significant long-term consequences, the **Future** lens is required, and the simulation layer must model outcomes at a minimum 20-year horizon.

**Indigenous land acknowledgment integration:** For municipalities on Indigenous territory, processes affecting land or natural resources must include a formal acknowledgment of relevant Indigenous governance interests and a documented consultation pathway. MCS provides a structured field for this in the Decision Authority Contract; what that consultation looks like is determined by the Indigenous governance bodies involved, not by the platform.

**What the platform cannot do:** MCS cannot give the ecosystem a voice or measure ecological health. What it can do is require that ecological impacts be named in governance, not silently assumed, and create a Civic Memory record of decisions that affected the local ecosystem.

---

## Conflict, Harm, and Retaliation

**Retaliation risk for politically active residents.** In many cities, residents who publicly oppose development projects, zoning changes, or administrative decisions face retaliation from landlords, employers, or organized interests. Civic participation platforms that make participation visible by default actively harm these residents.

MCS mitigates this through: anonymized participation options, no public participant lists unless explicitly opted in, no data sharing with third parties, and clear data sovereignty provisions.

**Civic processes as conflict surfaces.** A participatory process about a contested policy can become a surface for organized harassment of community members, coordinated submission flooding, or amplification of harmful content. MCS includes moderation infrastructure for process facilitators (human accountability, not algorithmic moderation) and rate limiting to prevent organized flooding.

**What the platform cannot protect against.** Platform anonymization does not protect against physical surveillance or off-platform targeting of participants. Residents who face serious physical risk from civic participation cannot be made safe by platform design alone.

---

## Power Dynamics and Capture Prevention

**Institutional capture.** The deepest risk in MCS is that municipal governments use it to perform participation without redistributing power. This is the default use case if the platform does not actively design against it.

Safeguards:
- Decision Authority Contract is required and public before any process opens
- Process outcomes and institutional responses are part of the permanent public record
- The Accountability Layer flags processes where stated decision linkage was not honored — and makes the flag visible to participants and the public
- Third-party civic organizations can register as process observers, receiving automated notifications of process status and outcome

**Participation capture.** Organized interests (developer lobbies, NIMBYs, industry groups) can game participatory processes through disproportionate submissions. Rate limiting per verified participant, structured perspective formats (reducing the advantage of high-volume organized submissions), and representativeness tracking (demographic comparison of participants to affected population) all address this partially.

None of these fully solves the problem. Power asymmetries in civic participation are not a technical problem with a technical solution.

---

## Business Model

MCS is open-source (AGPL). Revenue comes from:

**Institutional SaaS.** Municipal governments, regional authorities, and large civic organizations pay for hosted deployment, implementation support, and customization. Pricing is public and transparent.

**Implementation services.** Technical implementation, facilitation training, and community liaison program design for municipalities without internal capacity. These are not upsells — they are often what makes the platform actually work.

**Commons fund for civil society.** A portion of institutional revenue is set aside as a commons fund for civil society organizations, community groups, and under-resourced municipalities to access the platform at reduced or no cost. This is a structural commitment, not a discretionary grants program.

### What MCS Will Never Do

- Charge residents for participation — civic participation cannot be paywalled
- Sell participation data or behavioral analytics
- Accept funding from property developers, extractive industries, or political campaign organizations
- Make the platform functionally unusable without payment (core deliberation tools are always free)
- Accept investment from entities with interests in limiting civic participation

---

## Phased Roadmap

### Phase 1: Foundation (4–5 months)

**Goal:** Prove that municipal institutions will use a participatory process tied to real decision authority — and that residents will participate when accountability is visible.

**Ships:**
- Core Civic Process object and lifecycle (Scoping → Open → Deliberation → Resolution → Memory)
- Decision Authority Contract (required for all processes — enforced, not optional)
- Budget Participation and Policy Review modules
- Participatory interface with default perspective taxonomy (6 lenses)
- Basic Accountability Layer (Decision Authority Contract tracking and public flagging)
- Offline and proxy participation pathways (in-person facilitation kit, printable forms)
- Accessibility (WCAG 2.1 AA), multilingual architecture, i18n from day one
- Anonymized participation pathway
- Full data export (JSON / ODF)
- Open Deliberation Format (ODF) schema published
- Hosted deployment for 2–3 pilot municipalities

**Pilot target:** Municipalities with existing participatory governance appetite — cities already running participatory budgeting or citizens' assemblies that need better infrastructure.

### Phase 1 Fast Follows (post-launch, pre-Phase 2)

- Representativeness tracking dashboard (demographic comparison of participants to affected population)
- Civic Process Registry (opt-in public process registry)

### Phase 2: Simulation and Depth (3–4 months post-Phase 1 validation)

**Goal:** Add the simulation layer; deepen trust, representativeness, and module coverage.

**Ships:**
- Policy simulation layer (budget, land use, policy comparison) with uncertainty-first display
- Assumption visibility and participant challenge mechanism
- Citizens' Assembly and Land Use modules
- Community Priority Setting module
- Indigenous consultation pathway integration
- Organizer dashboard: participation gap tracking, process health indicators

### Phase 3: Interoperability and Scale (6+ months post-Phase 2)

**Goal:** Connect municipalities; open to the broader Integral Commons ecosystem.

**Ships:**
- Cross-jurisdiction process sharing (ODF export/import)
- Policy Object Model and standardized comparison format
- Integration with existing civic platforms (Consul, DemocracyOS, Open Budget)
- Integral Commons ecosystem integration: Local Commons neighborhood Decisions can feed into MCS Civic Processes; municipal governance can inform neighborhood governance
- Governance profiles library (community-contributed templates by city type and region)

---

## Accessibility

MCS targets **WCAG 2.1 Level AA** compliance across all core flows as a Phase 1 requirement.

Specific requirements:
- All interactive elements keyboard-navigable with visible focus states
- Colour is never the sole means of conveying information
- Minimum contrast ratio 4.5:1 for body text, 3:1 for large text and UI components
- All images and icons have descriptive alt text
- Form fields have associated labels; error messages associated with their field
- Screen reader compatibility tested against VoiceOver (macOS/iOS) and NVDA (Windows)
- Plain language for all process descriptions (Flesch-Kincaid Grade 8 target)
- Printable participation materials meet print accessibility standards (font size, contrast, no colour-only encoding)

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Civic theater capture — municipalities use platform for consultation without decision linkage | High | High | Decision Authority Contract required and public; Accountability Layer tracks follow-through; civil society observer accounts |
| Participation dominance — organized minorities speak for broad public | High | High | Demographic representativeness tracking; structured perspectives reduce volume advantage; facilitator guidance for outreach to underrepresented groups |
| Simulation misuse — models used to manufacture consent | Medium | High | Uncertainty-first display; assumption visibility; multi-model support; human interpretation layer required for all outputs |
| Platform captures unpaid organizer labor without compensation | High | Medium | Facilitation overhead reduction as explicit design goal; commons fund for civil society access; named in PRD as structural problem |
| Municipal data sovereignty concerns block adoption | Medium | Medium | Self-hostable (AGPL); no cross-jurisdiction data sharing without explicit bilateral consent |
| Participant retaliation from civic participation | Medium | High | Anonymized participation; no public participant lists by default; no data sharing; explicit in Terms of Service |
| Technical complexity excludes non-technical municipalities | High | Medium | Managed hosting; implementation services; in-person facilitation kit; no technical knowledge required to participate |
| Indigenous governance interests not respected | Medium | High | Land acknowledgment integration; Indigenous consultation pathway routing in Decision Authority Contract; platform does not define what consultation looks like |
| Simulation layer too expensive to build well in Phase 1 | High | Medium | Phase 2 feature; Phase 1 ships without it; never build simulation that can't be explained in plain language by a non-expert |
| Modular flexibility used to configure exclusionary processes | Medium | High | Process configuration review tools; civil society observer accounts; Accountability Layer with public flagging |
| Systemic exclusion — platform structurally inaccessible to most-affected residents | High | High | Offline pathways, proxy participation, and community organization submission in Phase 1; acknowledged as partial mitigation only — political solutions required |
| Platform dependency — civic governance capacity atrophies if platform becomes unavailable | Medium | Medium | AGPL + self-hostable; no proprietary lock-in; civic participation capacity must be maintained offline in parallel |

---

## What This System Intentionally Does NOT Do

**It does not compel institutions to share power.** The platform can make participation possible. It cannot make institutions respond to it. If a municipality deploys MCS and ignores every participatory output, the platform has failed its purpose — not its technical requirements. The Decision Authority Contract is designed to make this visible, not prevent it.

**It does not guarantee representative participation.** Rate limiting, structured perspectives, and representativeness tracking reduce the advantage of organized minorities. They do not eliminate it. The people most affected by governance decisions will still be underrepresented on most civic platforms. This is a structural problem that requires political solutions, not technical ones.

**It does not produce better governance.** Better civic participation processes are a necessary but not sufficient condition for better governance. A well-designed participatory process can produce good inputs that are then ignored by decision-makers. Platform quality does not determine governance quality.

**It does not make governance faster.** At least not for consequential decisions. Minimum deliberation windows exist because civic participation that happens too quickly produces inputs from the fastest-organized, not the most-affected. Speed is the enemy of representativeness in civic deliberation.

**It does not replace expertise.** Civil servants who understand implementation constraints, ecologists who know the local watershed, engineers who know infrastructure limits — their knowledge matters and belongs in the deliberation. The participation layer is for community perspectives and values; it is not a mechanism for overriding technical expertise. The integration of expertise and community perspective is the job of human facilitators, not the platform.

**It does not resolve contested values through simulation.** The simulation layer models consequences; it does not determine which consequences are acceptable. "What happens if we implement this?" is answerable by simulation (with uncertainty). "Should we implement this?" is a values question that requires deliberation, not modeling.

**It does not solve civic disengagement.** Civic disengagement is not primarily a technology problem. It is a rational response to governance institutions that have repeatedly failed to respond to participation. A better civic platform does not address this unless accompanied by institutions that visibly and consistently use participatory input to inform real decisions.

**It does not define what good Indigenous consultation looks like.** MCS can route a process to a consultation pathway and record that consultation occurred. It cannot determine what appropriate government-to-government consultation with Indigenous nations requires. That is determined by Indigenous governance bodies, legal obligations, and political relationships outside the platform.

---

## Relationship to Integral Commons Ecosystem

MCS is the municipal-scale layer of the Integral Commons ecosystem, operating one level above Local Commons (neighborhood-scale) in the holonic nesting model.

| Scale | Integral Commons Layer |
|---|---|
| Personal / household | Personal Commons Vault (future) |
| Neighborhood | Local Commons |
| City / municipality | MCS |
| Regional / bioregional | Phase 3+ federation |

MCS and Local Commons are independent products in Phase 1. They share constitutional principles (the CommonGround Constitution Tier 1 inviolable principles apply to both) and will share interoperability standards. A Phase 3 federation layer could allow neighborhood-level Decisions in Local Commons to inform city-level Civic Processes in MCS — but that integration requires care to avoid subsumption of neighborhood governance into municipal governance. The holonic nesting model means each layer retains its own governance sovereignty; higher layers do not override lower ones.

---

## Glossary

- **Civic Process** — The bounded unit. A defined participatory process tied to a specific governance decision, with a Decision Authority Contract, an affected population definition, and a resolution record.
- **Decision Authority Contract** — A public statement by the responsible institution defining what decision the process informs, who holds final authority, what weight participatory input will carry, and by when the decision will be made. Required to open any process.
- **Policy Module** — A composable governance template preconfigured for a common civic decision type.
- **Participatory Interface** — The resident-facing participation layer: how people engage with a Civic Process.
- **Simulation Layer** — The policy trade-off modeling layer. Displays projected consequences of policy options with explicit uncertainty quantification and visible assumptions.
- **Perspective Lens** — A structured contribution type for deliberation (Impact, Equity, Values, Feasibility, Ecological/Place, Future).
- **Accountability Layer** — The platform component that tracks whether Decision Authority Contracts are honored and makes violations visible to participants and civil society observers.
- **Open Deliberation Format (ODF)** — The open JSON schema for civic process records, enabling cross-jurisdiction data sharing.
- **Representativeness Tracking** — Demographic comparison of process participants against the affected population, used to identify participation gaps and guide outreach.
- **Anonymized Participation** — Submission pathway where identity is verified for rate-limiting purposes but not recorded in public-accessible process records.
- **Commons Fund** — The set-aside portion of institutional licensing revenue made available to civil society organizations and under-resourced municipalities at reduced or no cost.
- **Civic Memory** — The permanent record of a Civic Process: what was decided, how participation informed it, what dissent remained, and when it will be reviewed.

---

*PRD v1.0. MCS is the municipal-scale layer of the Integral Commons ecosystem, above Local Commons (neighborhood) in the holonic nesting model. Developed with the same inclusive, honest rewrite considerations as Local Commons v1.2. Next steps: pilot municipality identification, legal review of civic data sovereignty requirements by jurisdiction, simulation layer architecture design (Phase 2), Indigenous governance consultation protocol design, CommonGround constitutional framework alignment review.*
