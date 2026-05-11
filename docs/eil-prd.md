# Ecological Impact Layer (EIL) — Product Requirements Document

**Version:** 2.0
**Date:** 2026-05-03
**Status:** Draft
**Category:** Global / systems awareness
**Integral Commons Layer:** Layer 4 — Ecological Stewardship

---

## Executive Summary

The Ecological Impact Layer is infrastructure, not an application. It is a real-time, interoperable data service that makes the ecological consequences of decisions legible — at the moment decisions are made, not in annual reports reviewed after the fact.

EIL does not tell people what to choose. It ends one specific condition of ecological harm: decisions made in ignorance of their consequences. It does not end the other, more intractable conditions — economic structures that make ecological harm cheap and ecological choices expensive, power arrangements that concentrate harmful decisions among those who don't bear their costs, or the absence of political will to change either. EIL is one tool. It is not a solution.

This version of the PRD incorporates perspectives absent from v1: communities most affected by ecological harm, non-human entities whose interests EIL data purports to represent, people who lack the time or digital access to use data tools at all, and the ways this system could be used against the people it claims to serve. These are not edge cases. They are the majority.

Ecosystems are treated here as parties with interests, not only as data sources and constraints. A watershed's interests are not reducible to its water stress index, any more than a community's interests are reducible to its GDP. EIL can model the index. It cannot model the relationship — the ancestral, sacred, or simply lifelong connection between a community and the land it inhabits. That relationship is not captured here, and EIL is explicit about that limit.

---

## Problem Statement

### Current Situation

Ecological data exists. The problem is that it is not embedded where decisions happen — and even where it is, it rarely reaches those with the least power and the most at stake.

What exists today:

| Tool | Failure Mode |
|---|---|
| Carbon accounting software (Watershed, Plan A) | Finance-focused, carbon only, expensive B2B, inaccessible to communities |
| ESG platforms (Sustainalytics, MSCI) | Investor-facing, retrospective, company-level aggregation that obscures decision-level impact |
| Product LCA tools | Per-product lifecycle assessments, expensive to commission, not queryable in real time |
| Project Drawdown | Prescriptive solution catalog, no dynamic data, not embeddable |
| Government environmental databases | Authoritative but siloed, inconsistent formats, accessible only to specialists |
| Consumer footprint calculators | One-time snapshots, voluntarily used, disconnected from actual purchase flow |

Every existing tool shares the same structural failure: ecological information is separated from the moment of decision. But there is a second, deeper failure these tools share: they are designed for and by institutions with resources, digital infrastructure, and English-language access. The communities that experience the most severe ecological harm — extractive-resource economies, frontline climate communities, rural and Indigenous territories — are also the communities most poorly served by existing tools, most underrepresented in the data those tools draw on, and least likely to benefit from tools built on their data.

### Root Causes

- No shared, queryable data standard for multi-dimensional ecological impact
- LCA methodology is slow, expensive, and commissioned per-product rather than continuously maintained
- Ecological data is held in proprietary silos with incompatible formats
- Ecological cost is not a first-class input in any mainstream decision workflow
- Uncertainty is routinely flattened into single-point estimates that convey false precision
- **Data coverage is geographically biased:** global south territories, Indigenous lands, and subsistence economies are underrepresented in every major ecological database
- **The worst-impacted communities have the least access** to the institutional and technological infrastructure to use or contribute to ecological data

### What EIL Changes — and What It Does Not

EIL changes one condition: whether ecological impact information is accessible at the moment of decision. It does not change:

- The economic incentives that make harm cheap and sustainability expensive
- The power arrangements that allow those who make ecologically harmful decisions to externalize their costs onto others
- The capacity of resource-constrained individuals to choose differently, even when informed
- The political processes that determine what gets measured, who controls the data, and whose knowledge counts

A city planner who receives EIL data can see the biodiversity impact of a proposed development. They cannot override a rezoning directive from an elected official with different priorities. A low-income household who sees an EIL overlay in a grocery app can see that the cheaper option has three times the carbon footprint of the alternative. They may not be able to afford the alternative. EIL should not imply that information solves either problem.

---

## Product Goals

### Core Goals

1. Make ecological impact queryable in real time at decision granularity (product, supplier, policy, location, material)
2. Surface confidence alongside estimates — show what is known, estimated, modeled, and contested
3. Provide embeddable decision overlays that attach impact data to existing decision workflows without replacing them
4. Enable system-level visibility from neighborhood to bioregion to global, with explicit responsibility attribution — not just aggregate impact, but who produces it
5. Integrate ecological guardrails into Integral Commons governance, planning, and resource-sharing modules
6. Represent ecosystems as parties with interests, not only as data sources — through proxy mechanisms and territorial consent processes
7. Provide access pathways for communities without reliable internet or digital literacy, through offline interfaces and funded liaison roles

### Non-Goals

- Prescribing what decisions to make — EIL informs, it does not constrain
- Replacing legal environmental disclosure frameworks — EIL complements them
- Adjudicating contested scientific questions — EIL surfaces disagreement, not a resolved answer
- Monetizing individual behavioral data — no tracking of individual consumption patterns
- **Claiming to represent Indigenous or traditional ecological knowledge** — EIL's metrics are one partial, quantitative, Western-epistemological view of ecological conditions; this is stated explicitly in the product
- **Replacing local or embodied ecological knowledge** — communities that have governed their territories for generations know things no database captures

---

## Success Metrics

### Primary Metrics

| Metric | Definition | Phase 1 Target |
|---|---|---|
| API adoption | Third-party integrations actively querying EIL | 10 integrations |
| Decision coverage | % of decisions within integrated surfaces that receive ecological context | >60% of queries return a result |
| Data freshness | % of impact estimates updated within past 90 days | >80% |
| Confidence completeness | % of estimates accompanied by confidence interval | 100% |
| Query latency | P95 response time | <500ms |
| Territorial consent coverage | % of queries over Indigenous territories where consent process is active | 100% before Phase 2 launch |

### Secondary Metrics

| Metric | Definition |
|---|---|
| Data gap rate | % of queries returning "data unavailable" rather than an estimate |
| Global south coverage | % of EIL data coverage over lower-income country territories, published annually |
| Liaison reach | Communities served through offline/liaison pathways |
| Annotation usage | Active territorial disputes and proxy statements in the annotation layer |
| Contested-data disclosure rate | % of queries where EIL surfaces methodological disagreement |

### What EIL Explicitly Does Not Measure

- Individual behavioral change resulting from EIL exposure — we do not surveil how people respond to the data
- Whether EIL data produces "correct" decisions — what counts as correct is not EIL's determination
- Engagement, time-on-platform, or any proxy for attention

---

## User Personas

### 1. The Resource-Constrained Community Member

**Context:** Works multiple jobs, limited discretionary income, no capacity to absorb higher costs for lower-impact options. Lives in a neighborhood with above-average environmental burden — industrial proximity, food desert, limited green space. Disproportionately affected by ecological harm and disproportionately excluded from the conversations that produce it.

**Need:** Not to be told what to choose differently without acknowledgment of structural constraint. Needs EIL to be honest that the ecological harm in their neighborhood is not primarily a product of their individual choices. If EIL appears in their context at all, it should surface systemic information — which industries or policies are responsible for the burden in their area — rather than individual-choice framing.

**What EIL gives them:** The community dashboard's responsibility attribution view, showing who produces the ecological load in their neighborhood, not "here's how to shop better." The most useful EIL output for this person is evidence for advocacy. EIL should not imply that they have failed to make the right choice.

**Risk EIL must avoid:** Presenting an impact overlay on purchases they can't afford to change, without acknowledging the structural constraint. That experience adds guilt without agency.

---

### 2. The Care Receiver / Non-Participant

**Context:** An elderly person in a care home, a young child, a person with severe disability, or anyone whose decisions are substantially made by others. Deeply affected by ecological conditions — air quality, water safety, food systems — but cannot navigate digital interfaces, attend governance meetings, or engage with data tools.

**Need:** To have their interests actively represented in ecological governance, not assumed away. The system needs proxy mechanisms that advocate for people who cannot advocate for themselves — not as charity, but as a structural requirement for any system that claims to be inclusive.

**What EIL gives them:** Their interests are represented through designated proxy roles that EIL explicitly recognizes. Query types that serve non-participants indirectly — a care home's air quality profile, a school's food system impact, a neighborhood's water safety baseline. EIL does not require participation to have stake.

**Risk EIL must avoid:** Building a system where the only people whose interests are represented are those with digital access and institutional engagement.

---

### 3. The Community Liaison / Ecological Translator

**Context:** A trusted member of a community — neighborhood association, mutual aid network, Indigenous council, rural cooperative — who bridges between EIL's data infrastructure and the people in their community who do not use apps, do not read data tables, and may distrust external institutions. This person is not a volunteer. They are doing skilled, time-consuming work.

**Need:** A simplified, print-ready output format. A reliable explanation of what the data means, what its limits are, and why it might be wrong. Tools for running community conversations about ecological impact without requiring participants to interface with the technology themselves.

**What EIL gives them:** Printable community reports (not dashboards — readable single-page summaries in plain language). A liaison API key tier with free access for accredited community organizations. Training materials. This role must be compensated, not assumed to happen voluntarily. EIL's implementation guidance to partners explicitly includes liaison labor as a cost of deployment.

**Risk EIL must avoid:** Building a system that only works for communities whose members can use it individually, then claiming community benefit.

---

### 4. The Ecological Proxy / Territory Guardian

**Context:** A legal entity, council, or designated representative speaking on behalf of a non-human ecosystem — a river, a forest, a coastal zone. This role exists in several legal frameworks (New Zealand's Whanganui River as a legal person; Rights of Nature provisions in Ecuador, Bolivia). Whether or not the legal framework exists, the role is meaningful: someone must represent the ecosystem's interests in governance processes that EIL data feeds.

**Need:** A way to attach non-metric interests to EIL data. The river may have a biodiversity index, a water stress score, and a contamination level — but its interests extend beyond what those metrics capture. The proxy needs to be able to annotate EIL data with context, dispute, and meaning the data alone cannot carry.

**What EIL gives them:** An annotation layer through which designated representatives attach structured context to EIL data for their territory. These annotations are co-displayed with EIL data whenever the territory is queried. This is a governance requirement, not a technical afterthought.

**Risk EIL must avoid:** Presenting ecological data about a territory as complete, when the communities and entities with the deepest knowledge of that territory have not consented to or participated in data collection.

---

### 5. The Supply Chain Manager

**Context:** Responsible for ESG reporting and supplier qualification at a mid-size manufacturer. Has data for Tier 1 suppliers; Tier 2 and 3 are opaque. Faces increasing regulatory disclosure requirements (EU CSRD, SEC climate rules). Also faces internal pressure not to surface findings that would require expensive supplier switches.

**Need:** Automated impact aggregation across the supply chain, surfaced within existing procurement systems. Needs gap analysis — where data is missing — as much as estimates where data exists. Needs EIL to be explicit enough about uncertainty that data cannot easily be used selectively.

**What EIL gives them:** A queryable API returning impact estimates with confidence levels for products, materials, and supplier entities. Gap flags where data is unavailable. Because EIL's data is publicly accessible, the same data available to the supply chain manager is available to regulators, journalists, and NGOs — it cannot be internally suppressed.

**Structural note:** The supply chain manager works within a system that rewards cost reduction and penalizes risk disclosure. EIL does not change those incentives. It makes the data available; it does not guarantee honest use.

---

### 6. The City Planner

**Context:** Evaluating development applications, rezoning proposals, and infrastructure projects. Required to consider environmental impact but relies on commissioned EIAs that are slow, expensive, and produced by applicants with conflicts of interest. Operates within political constraints that limit their actual discretion.

**Need:** Rapid, independent ecological baseline for any location or project type. Counterfactual modeling: "what changes if this development proceeds." Data that is independent of the applicant.

**What EIL gives them:** Location-indexed biodiversity, carbon, water, and land-use baselines. Decision overlay for planning software showing impact delta against the baseline. Confidence intervals that distinguish "we know this" from "we are modeling this."

**Structural note:** City planners are not sovereign. EIL data that would compel a different decision in a technical analysis may be politically overridden. EIL is not a technocratic substitute for political accountability.

---

### 7. The Policymaker

**Context:** Designing regulations with incomplete knowledge of system-level effects. Relies on government agencies with slow data cycles and advocacy groups with motivated reasoning. Subject to lobbying from industries that benefit from the current baseline.

**Need:** System-level impact modeling for policy scenarios. Honest uncertainty: where models are reliable, where they are speculative. Data that is publicly credible and hard to dismiss as advocacy.

**What EIL gives them:** Scenario API — input a policy parameter, receive a projected ecological impact distribution with confidence bounds. Disaggregated regional views. Contested-methodology flags where scientific consensus is incomplete.

**Risk EIL must avoid:** Being captured by policymakers with preferred outcomes who use EIL's scenario API to generate supportive projections and suppress contradicting ones. Scenario methodology must be published and independently auditable.

---

### 8. The Designer / Systems Builder

**Context:** Designing products, services, or governance systems. Typically has no mechanism for incorporating ecological impact into design specifications. Ecological considerations arrive late, if at all. May have significant ecological leverage through design choices but limited accountability for downstream consequences.

**Need:** Impact data queryable during the design process, not after. Ability to compare materials, architectures, or supply chain configurations on ecological dimensions. Explicit reminders about what EIL cannot model — so that ecological responsibility doesn't become a checkbox.

**What EIL gives them:** A design-time API returning impact comparisons between alternatives. Embeddable into design tools and architecture decision records. The ecological dimension becomes a first-class design constraint. Also: documentation on the limits of each estimate, so designers know where they are working in the dark.

---

### 9. The Commons Steward

**Context:** Governing a shared resource — watershed, forest, food cooperative, neighborhood — within the Integral Commons ecosystem. Carries governance responsibility for their community's relationship with the local ecology. May hold embodied knowledge of that relationship that no database represents.

**Need:** Ecological impact of governance decisions surfaced within the deliberation interface. Not as a veto — as a visible input to collective sense-making. The ability to trust that EIL's representation of their local ecology is checked against lived local knowledge, not only satellite data and academic databases.

**What EIL gives them:** Native Integral Commons integration attaching EIL data to Decisions and Proposals as a deliberation artifact. The ability to annotate EIL data with local knowledge that corrects or contextualizes the metrics. Impact data and any disputes logged to Civic Memory, building an ecological track record alongside the governance record.

---

## Core Architecture

EIL is a layered data infrastructure. Each layer is independently useful; together they form the embeddable ecological truth layer.

```
┌────────────────────────────────────────────────────────────┐
│  OVERLAY LAYER — Decision surfaces (digital AND analog)    │
├────────────────────────────────────────────────────────────┤
│  ANNOTATION LAYER — Proxy, community, and local knowledge  │
├────────────────────────────────────────────────────────────┤
│  DASHBOARD LAYER — System visibility (web/API)             │
├────────────────────────────────────────────────────────────┤
│  API LAYER — Impact queries, scenario modeling             │
├────────────────────────────────────────────────────────────┤
│  IMPACT ENGINE — Computation, uncertainty modeling         │
├────────────────────────────────────────────────────────────┤
│  DATA LAYER — Aggregation, normalization, lineage          │
└────────────────────────────────────────────────────────────┘
```

Two structural changes from v1:

**Annotation Layer (new):** A governance layer between raw EIL data and the surfaces that display it. Ecological proxies, community organizations, and territory guardians attach context, disputes, and corrections to EIL data for their territories. These annotations are co-displayed with the data — not hidden, not footnoted. A biodiversity index for a territory where the local Indigenous council disputes the measurement method displays both the index and the dispute.

**Analog/offline pathway (new in Overlay Layer):** The overlay is not only digital. It includes printable community report templates, a liaison API endpoint that generates simplified outputs for community organizations, and a future SMS query interface for low-connectivity contexts.

### Layer 1: Data Layer

Aggregates and normalizes ecological data from authoritative and open sources. Does not generate original data.

**Sources (Phase 1 target):**
- IPCC emissions factors and Scope 3 category databases
- Global Biodiversity Information Facility (GBIF)
- OpenStreetMap land-use classifications
- FAO AQUASTAT — water use and availability
- Ecoinvent LCA database
- EDGAR — global carbon emissions by sector and region
- IUCN Red List — species risk status

**Data governance principles:**
- Every data point carries provenance metadata: source, collection date, methodology, confidence class
- Updates are versioned — a query made today can be reproduced against a historical snapshot
- Data gaps are surfaced explicitly, never silently interpolated
- Sources are always disclosed — no proprietary data laundered as EIL's own
- **Coverage map is published:** EIL maintains and publishes a map of its own geographic data gaps. Communities can see that their territory has thin data before decisions are made using that data.

**Territorial consent:**
Before Phase 2 launch, EIL establishes a Free, Prior, and Informed Consent (FPIC) process for queries over Indigenous territories:
- Identified Indigenous territories are flagged in the data layer
- The relevant council or land body is notified when their territory is queried at aggregate scale
- The territory entity can opt out of EIL aggregation or attach mandatory annotation
- Consent is not assumed from silence — it is affirmatively established

---

### Layer 2: Impact Engine

Computes ecological impact estimates. The engine returns a distribution, not a single number.

**Dimensions computed (Phase 1):**

| Dimension | Unit | Primary Sources |
|---|---|---|
| Carbon | kg CO₂e (Scope 1, 2, 3) | IPCC, Ecoinvent, EDGAR |
| Biodiversity | Species at risk count, habitat area affected | GBIF, IUCN |
| Water | Liters consumed / liters withdrawn | AQUASTAT, Ecoinvent |
| Land use | Hectares, land conversion type | FAO, OSM |
| Toxicity | Chemical hazard units (provisional) | OpenTox, Ecoinvent |

**What the Impact Engine does not compute:**

- The intrinsic value of an ecosystem — not reducible to measurable dimensions
- The sacred, ancestral, or relational significance of a territory to its communities
- The grief and cultural loss associated with ecological degradation
- Long-term threshold effects and tipping points (flagged as possible, not modeled)
- The full complexity of ecosystem interactions below the resolution of available data

These limits are stated in EIL's documentation and in every query response that touches a territory with attached annotations.

**Uncertainty modeling:**

Every estimate carries four dimensions, always displayed together:

1. **Confidence level:** High (peer-reviewed, consistent methodology) / Medium (modeled from proxies) / Low (sparse data, extrapolated) / Contested (active methodological disagreement)
2. **Range:** P10–P90 interval, not just a point estimate
3. **Data vintage:** When the underlying data was last updated
4. **Coverage:** % of the impact footprint with data vs. estimated from averages

Example API response:

```json
{
  "entity": "supplier:DE-12345678",
  "dimension": "carbon",
  "estimate": 142.3,
  "unit": "kg CO2e",
  "range_p10": 98.1,
  "range_p90": 201.7,
  "confidence": "medium",
  "data_vintage": "2025-11-01",
  "coverage": 0.68,
  "methodology": "Ecoinvent 3.10 cut-off, IPCC AR6 GWP100",
  "contested_flag": false,
  "annotations": [],
  "sources": ["ecoinvent:3.10/widget-manufacturing-DE", "edgar:2024/manufacturing-tier2"]
}
```

---

### Layer 3: API Layer

Three primary query types:

**Entity Impact Query** — Returns impact estimates for a product (by GTIN or description), supplier, material, or location.

**Counterfactual / Delta Query** — Returns the ecological impact difference between two scenarios. Used by decision overlays and planning tools.

**Scenario Modeling Query** — Returns projected aggregate impact for a policy or decision scenario in structured parameters. For policymaker and governance use cases.

**API access model:**
- **Open tier:** 1,000 queries/month per API key, full response schema including all annotations
- **Community liaison tier:** Free, unlimited access for accredited community organizations with a community mandate (not individual researchers)
- **Verified tier** (Integral Commons members, registered public bodies, accredited researchers): unlimited queries, scenario modeling, priority rate limits
- **Commercial tier:** SLA-backed, custom data integrations, negotiated pricing designed to cross-subsidize community and open tiers

**What is never in the API:**
- Individual user behavior data
- Personally identifiable information
- Query logs that would allow reverse-engineering of individual decisions

---

### Layer 4: Annotation Layer

A governance interface through which designated entities attach structured context to EIL data for specific territories or entities.

**Annotation types:**

| Type | Who can add | What it adds |
|---|---|---|
| Territorial dispute | Indigenous council, territory guardian | Flags that the community disputes coverage or methodology for this territory |
| Local knowledge supplement | Community organization | Qualitative ecological context the metrics do not capture |
| Proxy statement | Ecological proxy | Stated interests of a non-human entity for this territory |
| Methodology dispute | Researcher or institution | Contested methodology flag with reference to alternative approaches |

Annotations are always co-displayed with EIL data. They cannot be hidden or suppressed by API consumers — displaying annotations is part of the EIL data contract. An API consumer who strips annotations before displaying EIL data is in breach of terms.

---

### Layer 5: Decision Overlay

**Delivery mechanisms:**

| Mechanism | Use Case |
|---|---|
| Browser extension | Consumer purchase decisions, procurement tool overlays |
| iframe embed | Third-party governance platforms, planning software |
| Native Integral Commons integration | CommonGround decisions, Local Commons resource choices, Synapse production plans |
| Printable community report | Community meetings, liaison-facilitated sessions, offline settings |
| Webhook / push | Alerts when a tracked entity's impact profile changes significantly |

**Overlay design principles:**
- **Default view is minimal.** One or two headline figures, confidence class, data age. Full detail requires a deliberate click. More data is not always better — cognitive load is a design constraint, not a secondary consideration.
- Confidence is always co-displayed. No estimate is shown without its confidence class.
- Annotations are always shown. If an ecological proxy has flagged a territory, that flag appears before the metric.
- The overlay never implies a correct choice. It makes impact visible.
- No recommendations, rankings, or nudges. These would impose EIL's evaluative frame over the user's.
- No individualized impact accumulations over time. No personal carbon tracker, no behavioral surveillance.

---

### Layer 6: System Dashboard

**Views:**
- **Bioregional snapshot:** Aggregate impact for a defined region, trend over time
- **Responsibility attribution:** Which industries, supply chains, and policy decisions produce the most impact in the region — not just aggregate numbers, but structural sources. This is a deliberate design choice: the dashboard emphasizes who produces harm, not just how much exists.
- **Data coverage map:** Where EIL's data is thin — published publicly so communities can see before any decisions use that data
- **Annotation feed:** Active territorial disputes and proxy statements for the region
- **Trajectory:** Is the region improving or degrading, with confidence envelope

Dashboard is public-read by default. Data exports available for researchers and policy teams.

---

## Power, Exclusion, and Adversarial Use

This section documents the ways EIL could be used against the communities it claims to serve, and the safeguards required.

### Who Benefits Most from EIL (by default)

- Organizations with technical infrastructure to query an API
- Institutions with governance capacity to act on ecological data
- Individuals with the time and resources to consult impact information at the point of decision
- Researchers and advocates who can use the data to build arguments

This is not the population most affected by ecological harm.

### Who Is Excluded by Default

- Communities without reliable internet
- Non-English speakers (Phase 1 is English-only — this is tracked as a known exclusion, not treated as acceptable)
- People without time to engage with impact information at the point of decision
- Communities whose territories are underrepresented in EIL's source data
- People in the global south whose consumption footprints are small but whose territories bear the material cost of others' consumption

### How EIL Could Be Exploited

**Selective citation for greenwashing.** An organization cites the low end of EIL's confidence interval when favorable, ignores it when not.
**Safeguard:** API terms of service require that confidence metadata is displayed whenever EIL data is cited publicly. Terms-of-service breaches are logged and disclosed on a public breach register.

**Data capture.** A large incumbent integrates EIL, bundles it with proprietary analysis, and resells it in a way that obscures its open-access nature.
**Safeguard:** Creative Commons licensing on EIL data outputs requires attribution and prohibits proprietary relicensing.

**Coverage gap exploitation.** A company identifies jurisdictions with thin EIL data coverage and routes operations there, knowing the impact will be invisible.
**Safeguard:** EIL publishes its own coverage gaps. Thin-coverage territories trigger explicit warnings in API responses, not silence.

**Technocratic displacement.** EIL data is used to override community objections to a development because "the numbers say it's fine."
**Safeguard:** EIL's documentation explicitly states that its data is one input to decisions, not a sufficient basis for overriding community consent or lived knowledge. Territorial annotations give communities a structural mechanism to dispute EIL's representation of their territory. This language appears in the product UI, not only in documentation.

**Individual surveillance.** An employer, insurer, or government tracks how individuals respond to EIL overlays to infer behavior or risk profile.
**Safeguard:** EIL collects no individual behavioral data. API responses carry no user tracking. Privacy policy is published and independently audited annually.

**Colonial data extraction.** Researchers query ecological data for Indigenous territories without community consent, producing academic or commercial outputs from knowledge the community did not choose to share.
**Safeguard:** FPIC process for Indigenous territories. Territorial opt-out capability. Annotation layer. This is a design requirement, not a policy aspiration.

---

## Governance of EIL Itself

EIL's own governance is as important as the governance decisions it informs. A system that makes ecological data public must itself be governed transparently.

### Ecological Data Council

Methodology decisions — which confidence tier applies to a data type, when a Contested flag is assigned, which sources are authoritative — are made by an Ecological Data Council constituted before Phase 2 launch.

The Council:
- Includes seats for ecologists, Indigenous land representatives, community organizations, and technologists
- Has no seats reserved for corporate interests or commercial EIL users
- Publishes all methodology decisions with rationale
- Holds quarterly open comment periods for methodology challenges
- Reviews all territorial disputes within 30 days

### Dispute Resolution

When an entity disputes EIL's data for their territory:

1. Dispute is filed through the Annotation Layer
2. EIL publicly flags the dispute on the affected territory's query response from the moment of filing
3. Ecological Data Council reviews within 30 days
4. Resolution is published: data corrected, annotation maintained, or dispute closed with explanation
5. Community or entity can escalate to an independent review body (established Phase 3)

### Transparency Requirements

- All methodology documents are published
- All Ecological Data Council decisions published with rationale
- EIL's own infrastructure carbon footprint published annually
- Financial relationships (grants, commercial agreements) disclosed
- No algorithm affecting data display is proprietary

### Safe Exit

Communities can withdraw from EIL:
- Community annotations can be removed at any time
- Territorial opt-outs remain in effect until affirmatively reversed by the community, not by EIL
- EIL does not retain community-contributed knowledge after withdrawal

---

## Economic Realism

EIL assumes no unpaid labor.

The community liaison role, the ecological proxy role, and the territorial consent facilitation work are paid positions. EIL's implementation guidance to partners explicitly states that deploying EIL in community contexts requires compensating the people who do the translation work. This is not charity — it is a cost of honest infrastructure.

EIL also does not assume that informed individuals will make different choices. The cost of ecological options is real. A person in energy poverty cannot choose renewable energy because they now know the carbon footprint of their current tariff. The responsibility attribution view in the System Dashboard exists to surface that structural constraint — not individual ignorance — is the primary driver of many harmful outcomes.

EIL must be financially sustainable without ad revenue or individual data monetization. Phase 1 is grant-funded. Phase 2 introduces the commercial API tier. The commercial tier is priced to cross-subsidize the community liaison tier and keep the open tier genuinely free — this is a financial design requirement, not an aspiration. If commercial revenue cannot sustain community access, EIL has failed its design brief.

---

## Integration with Integral Commons Layers

### Synapse (Democratic Planning Engine)
EIL provides the real-time ecological capacity constraints (carbon budget, water availability, biodiversity thresholds for a bioregion) that feed Synapse's Ecological Guardrail Engine. Guardrail breaches surface as EIL-sourced warnings with confidence levels. Annotations from territory guardians can flag that a guardrail threshold is based on contested data.

### CommonGround (Governance Module)
When a governance Decision is created with an ecological dimension, EIL data is attached as a deliberation artifact and is visible to all participants alongside Perspectives. Annotations and proxy statements appear in the same deliberation view. Impact data and any disputes are logged to Civic Memory alongside the Decision outcome, building an ecological track record.

### Local Commons
Local Commons uses EIL for neighborhood-level ecological baselines. The community liaison role integrates with Local Commons's steward structure. Printable EIL community reports are generated from the Local Commons dashboard for offline neighborhood meetings. Local knowledge annotations from Local Commons stewards feed back into EIL's Annotation Layer for that territory.

### FlowState (Liquid Democracy)
When voters delegate on ecology-tagged topics, EIL provides reference data for evaluating proxy performance against real-world impact outcomes. Proposal impacts are modeled before votes. Ecological proxies can hold delegation seats representing non-human entities in governance flows where the legal framework supports it.

---

## Phase Plan

### Phase 1: Data Foundation & API (0–4 months)

- Ingest and normalize core sources (IPCC, Ecoinvent, GBIF, AQUASTAT, EDGAR, IUCN)
- Implement entity impact, delta, and basic scenario query endpoints
- Confidence interval calculation and full metadata schema
- Annotation layer: dispute filing and co-display with data
- API key management: open, community liaison, and verified tiers
- CommonGround integration: EIL data attached to Decisions with ecological tags
- Indigenous territory flagging in data layer; FPIC process design begins
- Coverage gap map published

**Phase 1 acceptance criteria:**
- API returns valid responses with confidence metadata for >70% of queries against a test set of 500 entities
- P95 latency <500ms
- Annotations co-display in all surfaces with no opt-out by the consumer
- Coverage gap map live and publicly accessible

### Phase 2: Overlay, Dashboard, and Community Access (4–8 months)

- Browser extension and iframe embed with overlay UI
- System dashboard including responsibility attribution view and coverage gap map
- Printable community report generator (A4, plain language, no login required)
- Community liaison tier activated; first 10 community organization partnerships established with paid liaison roles
- FPIC process live for identified Indigenous territories
- Local Commons and Synapse integrations
- Ecological proxy annotation type introduced
- Expand to 5 dimensions (add land use and provisional toxicity)

### Phase 3: Coverage, Governance Maturity, and Localization (8–16 months)

- Supplier disclosure portal: organizations submit impact data to improve coverage for their entities
- Multi-tier supply chain traversal
- Ecological Data Council constituted and publishing decisions
- Independent dispute review body established
- Global south coverage audit published; targeted data partnership program for underrepresented regions
- Phase 2 dimensions: soil health, circular resource flows
- Language localization begins: priority languages determined by affected population in underrepresented territories, not by market size

---

## What This System Intentionally Does Not Do

This section is not a list of deferred features. These are permanent design choices.

**EIL does not tell anyone what to choose.** The overlay shows impact. It does not rank options, recommend choices, or imply that any decision is correct or incorrect. The authority to decide belongs to the person or community making the decision.

**EIL does not replace local or Indigenous ecological knowledge.** Generations of stewardship of a watershed, a forest, or a coastline produce knowledge that no satellite database captures. EIL represents one partial, quantitative, Western-epistemological view of ecological conditions. Where local knowledge contradicts EIL data, local knowledge is not automatically wrong.

**EIL does not track individuals.** No personal carbon score, no behavioral profile, no consumption history. EIL does not know who you are and does not try to find out.

**EIL does not claim that information is sufficient.** Making ecological impact visible is necessary but not enough. The structural conditions that make harm cheap and sustainability expensive require political and economic change that EIL cannot produce. EIL does not imply that it can.

**EIL does not quantify everything.** The sacred relationship between a community and its ancestral land is not an impact dimension. The grief of a community watching its coastline disappear is not a metric. The intrinsic right of an ecosystem to exist is not captured in a biodiversity index. EIL's metrics are partial. They are stated to be partial. What resists quantification is not thereby unimportant.

**EIL does not optimize.** Optimization assumes a single objective function. Ecological value is plural: a decision might reduce carbon impact and increase water stress. EIL presents the dimensions; it does not aggregate them into a score that implies a best option. There is no EIL rating, ranking, or grade.

**EIL does not consent on behalf of communities.** Querying ecological data about a territory is not the same as having permission to do so. The FPIC process for Indigenous territories reflects the principle that communities have authority over their territories and the data derived from them. That authority does not disappear because the technology makes querying easy.

**EIL does not guarantee its own independence.** The Ecological Data Council, the public methodology documents, and the dispute resolution process are safeguards — not guarantees. Any institution can be captured over time. EIL's governance structures are designed to resist capture, and they are published so that capture can be identified and resisted from outside.

**EIL does not solve structural problems by making them visible.** Visibility is necessary. It is not sufficient. A community that can now see the carbon footprint of the factory upstream still cannot close the factory. A consumer who can see the water cost of their food still cannot always afford the alternative. EIL is honest about this gap, and it does not design around it.

---

## Risks and Open Questions

### Data Risks

**Risk:** Global south territories and Indigenous lands are underrepresented, producing a system more accurate for the territories of those already best served.
**Mitigation:** Coverage gap map is published and updated. Global south coverage is tracked as a primary metric. Phase 3 includes targeted data partnership program for underrepresented regions.

**Risk:** Authoritative sources have coverage gaps that make estimates unreliable.
**Mitigation:** Explicit data gap policy — gaps are returned as structured signals, not interpolated estimates. A gap is information: it tells the decision-maker they are choosing with unknown ecological consequences.

**Risk:** Licensed databases (Ecoinvent) carry redistribution constraints.
**Mitigation:** EIL exposes computed outputs, not underlying data. Legal review required before Phase 1 launch.

### Power and Exploitation Risks

**Risk:** Selective citation of EIL data for greenwashing.
**Mitigation:** Confidence metadata must be displayed per terms of service. Public breach register.

**Risk:** Colonial data extraction from Indigenous territories.
**Mitigation:** FPIC process, territorial opt-out, annotation layer enforced in data contract.

**Risk:** Technocratic displacement of community voice by EIL data.
**Mitigation:** Documentation and in-product language explicitly states EIL data is one input. Territorial annotations give communities a structural dispute mechanism.

**Risk:** Annotation layer gamed by bad-faith actors filing spurious disputes to neutralize inconvenient data.
**Mitigation:** Dispute filing requires verified organizational identity. Ecological Data Council reviews within 30 days. Spurious dispute pattern is grounds for annotation access revocation.

### Financial Risks

**Risk:** Community liaison tier is underfunded and collapses to volunteerism.
**Mitigation:** Liaison cost is explicitly modeled in EIL's financials. Commercial tier pricing is designed to cross-subsidize it. If this fails, EIL has not met its design brief.

**Risk:** EIL becomes dependent on a single commercial funder with an interest in methodology outcomes.
**Mitigation:** Ecological Data Council bars commercial EIL users from methodology seats. Funding relationships are publicly disclosed.

### Open Questions

1. **Legal review:** Redistribution constraints for Ecoinvent and similar licensed databases — when does legal review need to be engaged?
2. **FPIC implementation:** Which Indigenous territory identification sources does EIL use? What is the consent process in territories without organized legal entities?
3. **Disclosure liability:** If an organization acts on an EIL estimate that proves wrong, what is EIL's liability exposure? Standard disclaimers may be insufficient for regulatory contexts.
4. **Language priority:** Which non-English languages are prioritized in Phase 3 localization, and by what criteria? The answer should be determined by affected population in underrepresented regions, not by market size.
5. **Contested flag threshold:** What triggers a Contested flag, and who has standing to initiate review? This decision belongs to the Ecological Data Council but needs to be resolved before the annotation layer goes live.

---

## Appendix: Competitive Landscape

| Tool | Multi-dimensional | Real-time | Embeddable | Uncertainty | Open access | Community access | Annotation layer |
|---|---|---|---|---|---|---|---|
| Watershed | No (carbon only) | No | Partial | No | No | No | No |
| Ecovadis | No (ESG composite) | No | No | No | No | No | No |
| Sustainalytics | No (ESG composite) | No | No | No | No | No | No |
| SimaPro / GaBi | Yes (LCA) | No | No | No | No | No | No |
| Project Drawdown | No (solutions) | N/A | No | No | Yes | No | No |
| **EIL (target)** | Yes | Yes | Yes | Yes | Yes | Yes | Yes |

The competitive differentiation in v2 extends beyond the v1 five-factor claim. **Community access** (free tier for community organizations, liaison infrastructure, printable reports) and the **Annotation Layer** (community and proxy dispute and context mechanisms) distinguish EIL from tools that are epistemologically closed — that present data without acknowledging who produced it, who is excluded from it, and who has the right to contest it.
