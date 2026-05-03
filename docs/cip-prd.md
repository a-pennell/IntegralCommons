# Care Integration Platform (CIP) — Product Requirements Document

**Version:** 1.0
**Date:** 2026-05-03
**Status:** Draft
**Category:** Relational care infrastructure
**Integral Commons Layer:** Layer 4 — Relational Care

---

## Executive Summary

The Care Integration Platform is the layer of Integral Commons that holds what cannot and should not be tracked.

Every other Integral Commons layer makes something visible: Local Commons surfaces what the neighborhood has, EIL surfaces what decisions cost the ecosystem, CommonGround surfaces how collective sense-making moves, the Flow Engine surfaces how resources match to needs. CIP is different. It holds care — the relational, unquantifiable, often invisible work of being with each other through difficulty — and it holds it gently, without turning it into a ledger.

Care work is the most undervalued labor in market economies and the most overloaded capacity in community life. The people who sit with neighbors in crisis, facilitate conflict repair, hold grief, maintain the relational bonds that make a neighborhood more than a geographic category — these people are mostly invisible, mostly unpaid, and often burning out quietly while the coordination layers track exchanges and log contributions.

CIP does not solve this. It is honest about what it cannot do. What it can do is: create coordination infrastructure for care that needs coordinating, without instrumentalizing the care itself; hold space for support relationships without surveilling them; provide a structured path for conflict repair without replacing the human work of repair; and name the things it cannot hold so that the people doing them are not expected to fit inside a platform.

**What CIP is not:** CIP is not a therapy platform, a crisis intervention service, or a mental health tool. It does not provide clinical care. It does not replace professional support. It is coordination infrastructure for community-level care, held by community members, within their capacity and consent.

---

## The Problem CIP Addresses

### What the other layers cannot hold

Local Commons's Needs & Offers handles care that can be transacted: *I need a meal, you can cook one. I need a lift to hospital, you have a car.* This is real and valuable.

What Local Commons cannot hold:
- The neighbor who needs someone to check in on them every Tuesday, indefinitely, because they are isolated and declining, and no one has noticed yet
- The conflict between two members that is not a governance issue — it is a relational rupture that needs time, witness, and repair, not a Decision Record
- The care that a Steward is carrying for seven different people simultaneously, that is invisible in every platform metric, and that is eroding her
- The member who needs ongoing support but will not post a Need because it is too exposed, too permanent, too indexed
- The grief a neighborhood is moving through together after a death, a fire, a violent event — the collective emotional weight that has no form and no platform home

These are not gaps. They are the most important things a community does, and they belong in a layer that treats them with appropriate care.

### The quantification trap

The moment you log "I sat with my neighbor for three hours while she cried about her diagnosis," you have turned intimacy into a transaction. The Care Integration Platform exists in permanent tension with this: it needs to coordinate care without instrumentalizing it.

The Kindred component of the Flow Engine handles credited care: an hour of care work logged and exchanged in the time credit system. Kindred is valuable. But Kindred only holds the care that should be credited. CIP holds the care that should not be — or the care where crediting would damage its nature, where the relationship precedes any accounting, where what matters is presence and not productivity.

Not all care should be tracked. Not all care can be tracked. CIP is honest about both.

---

## Product Goals

### Core Goals

1. Provide coordination infrastructure for ongoing care relationships without surveilling or logging the care itself
2. Create a structure for support circles — small groups organized around holding a person through a specific difficulty — that can coordinate without becoming a bureaucracy
3. Provide a structured path for conflict repair and harm processing that exists outside (but alongside) formal governance
4. Hold vulnerability safely — enabling people to indicate they need support without that indication becoming publicly visible or permanently indexed
5. Surface care load distribution to care coordinators without exposing the details of individual care relationships
6. Acknowledge and support the people doing the caring, particularly unpaid community care workers

### Non-Goals

- Tracking, logging, or crediting care acts (Kindred handles credited care)
- Providing clinical mental health support, crisis intervention, or therapeutic services
- Replacing the professional infrastructure for serious harm (domestic violence services, addiction support, suicidality)
- Rating or scoring caregivers
- Making care relationships visible to the broader community without consent
- Resolving governance questions (that belongs in CommonGround/Local Commons governance layer)
- Solving the structural problem of undervalued care work (this is named, not solved)

---

## Success Metrics

CIP is possibly the hardest layer to measure, because the things that would indicate success are the things that should not be tracked. This is named as a feature, not a bug.

### What can be measured (with care)

| Metric | Definition | Note |
|---|---|---|
| Support circle formation rate | % of support needs that result in a formed circle within 14 days | Aggregate only — no member-level tracking |
| Care load distribution | Whether care coordinator load is distributed or concentrated (Gini coefficient of coordinator action counts) | Surfaces burnout risk; does not expose individual cases |
| Conflict repair completion | % of repair threads that reach a documented closure (not outcome — just that the thread closed) | Outcome is private |
| Anonymous care hold resolution | % of anonymous care holds that are picked up by a circle or coordinator within 7 days | |

### What should not be measured

- The quality of care. A platform cannot assess this and should not try.
- Outcomes of specific care relationships. These belong to the people in them.
- How much any individual member has given or received. This is precisely what CIP protects against measuring.
- Whether conflict was "resolved." Resolution is a quality of relationship, not a platform state.

---

## People This Serves (And How)

### The person in ongoing difficulty

Chronic illness, grief, mental health challenges, domestic stress, housing precarity, social isolation — the situations that don't resolve in a single exchange. This person may not be able to post a Need. They may not be able to articulate what they need. They may need the same support, repeatedly, over months or years. CIP serves them through the support circle structure: a small group that knows the situation, coordinates without broadcasting, and adapts as the situation changes.

### The care coordinator

The member who naturally holds awareness of who in the neighborhood is struggling and who has capacity to help. Often a Steward or long-tenured member. Often burning out without anyone noticing. CIP gives them visibility into care load distribution across the neighborhood — not the details of any specific situation, but the aggregate signal that too much is being held by too few people.

### The person who caused harm

Conflict repair requires both parties to have a path. The person who caused harm needs a way to make amends, to engage in a repair process, without that process being a public accusation or a governance procedure. CIP's repair thread structure holds space for this.

### The person who has been harmed

Harm is real and common in community life. The person who has been harmed needs a path that is not the governance layer (which is adversarial in structure) and not silence (which offers no repair). CIP's repair process is centered on the harmed party's needs, not the community's need for procedural resolution.

### The care receiver who cannot reciprocate

Elderly neighbors, members with severe disabilities, people in prolonged crisis — those who receive more care than they can give for extended periods, possibly permanently. CIP holds their relationships without creating a visible imbalance. There is no care credit debt. There is no public record of what they have received. There is only the relationship.

### People who are excluded by default from care infrastructure

People who distrust platform-held data about their vulnerability (undocumented residents, people in housing disputes, people fleeing domestic violence). People for whom disclosing a care need is a safety risk. Anonymous care holds — held by a care coordinator, not the platform — are designed for them.

---

## Core Objects

### Support Circle

A Support Circle is a small group (2–8 people) organized around holding a specific person, situation, or difficulty over time. The circle is private: its existence, membership, and activities are visible only to circle members and the care coordinator who facilitated its formation.

A circle has:
- A purpose (loose, not formal: "holding J through her chemo treatment," "supporting the family after the eviction")
- Members (who agreed to be part of it)
- Coordination (a shared schedule, a way to signal who is available, a way to flag that the situation has changed)
- A transition plan (what happens when the circle dissolves — who continues to hold the relationship, or how the person supported is transitioned out)

A circle does not have:
- A public profile
- A contribution ledger
- A rating or outcome score
- An archive that persists after the circle closes

When a circle closes, it closes. The care history is retained by the people in it — in their memory and their relationship, not in the platform.

### Care Hold

A Care Hold is a record that someone needs ongoing support, created by a care coordinator when a person cannot or will not create it themselves. The hold is held by the coordinator, not the platform — the coordinator knows who it is for; the platform knows only that a hold exists.

A care hold can be:
- **Anonymous** — the platform records a hold exists and the coordinator holds the identity link. No one else on the platform knows who the hold is for.
- **Named** — the platform records the hold and the person who holds it, visible to care coordinators only.

A care hold is not a Need in Local Commons. It does not have a deadline or a fulfillment state. It is an ongoing awareness: someone in this neighborhood needs a care circle. That awareness persists until a circle forms or the coordinator closes the hold.

### Repair Thread

A Repair Thread is a structured process for navigating harm or conflict between community members, outside the governance layer. It is centered on the harmed party's needs and uses a different lens set from governance deliberation:

1. **Impact** — what happened and how it affected the harmed party
2. **Needs** — what the harmed party needs for repair
3. **Accountability** — how the person who caused harm acknowledges their impact
4. **Path forward** — what both parties agree will change or be different

A repair thread is:
- Confidential — visible only to the parties and the facilitating care coordinator
- Not permanent — the record is retained only until the thread closes, then archived privately
- Not a governance proceeding — it does not produce a Decision Record or feed into Civic Memory
- Voluntary — both parties must enter voluntarily; a thread cannot be imposed on either party

If a conflict escalates beyond what a repair thread can hold — threats, serious harm, illegal conduct — the thread closes and routes to the appropriate resource (Steward emergency action, formal governance, or external services).

### Care Coordination View

Visible to care coordinators only. Shows:
- Active circles: how many, what stage (forming, active, transitioning, closing)
- Care holds: how many anonymous, how many named, how old
- Care load: how many circles each coordinator is facilitating (distribution signal)
- Overdue holds: holds that have existed for more than 30 days without a circle forming

No member-level detail. No names of people in holds or circles. Only aggregate signals that allow the coordinator to see where care is concentrated, where it is absent, and where they personally are carrying too much.

---

## Functional Requirements

### Support Circles

**Circle formation:**
- A care coordinator can create a circle with a purpose, invite members, and define an initial coordination rhythm
- Circle members can also form circles without a coordinator (peer formation)
- Invitations to join a circle are private — they don't appear in the general notification feed
- A person being supported by a circle is not required to have a platform account — the circle can coordinate on their behalf

**Circle coordination:**
- Circle members can signal availability (I am available this week / I need to step back)
- Circle members can log a brief status update (visible to circle only: "I visited on Tuesday, she was in good spirits")
- Circle members can flag that the situation has changed (this triggers a circle check-in prompt)
- No record of what was said or done in person — status logs are optional and minimal

**Circle transitions:**
- When the supported person's situation resolves, the circle facilitates a close — documenting only who (if anyone) continues in a lighter touch relationship
- When a circle member needs to step back, the circle can recruit a replacement or reduce in size
- When a circle closes, the platform retains only: the circle existed, when it formed, when it closed. No membership, no history.

**Acceptance Criteria:**
- A care coordinator can form a circle and invite members in under 5 minutes
- Circle members receive availability prompts at a chosen cadence without platform-pushed notifications
- A circle can operate entirely for a person who is not a platform member
- Circle data is deleted from platform servers within 30 days of the circle closing

### Care Holds

- A care coordinator can create an anonymous or named hold in under 2 minutes
- Anonymous holds are visible to care coordinators only — no platform record of who the hold is for
- A hold transitions to a circle when a coordinator decides to form one — the hold closes at that point
- Holds older than 30 days without a circle forming generate a coordinator alert (not a public flag)

### Repair Threads

- A repair thread can be initiated by either party, or by a care coordinator on behalf of either party with their consent
- The harmed party sets the pace — they choose when to move from one phase to the next
- A thread cannot advance without the harmed party's explicit confirmation at each stage
- The facilitating coordinator can suggest resources (community mediation, professional support) without imposing them
- Thread records are held on the platform only while the thread is active; on closure, a minimal record (thread existed, outcome category: resolved / suspended / referred) is retained for Civic Memory aggregation only

### Care Load Distribution

- Care coordinators see their own circle count and hold count at all times
- The care coordination view shows aggregate distribution across coordinators — no member detail
- When a single coordinator holds >50% of active circles or holds, a load alert is surfaced to Stewards (not to the coordinator's members)

### Privacy Requirements

- Care Hold identities are never stored by the platform — only by the coordinator who holds them
- Circle membership is never visible outside the circle
- Repair thread content is never visible outside the thread parties and facilitator
- No care relationship data is included in the neighborhood-level Civic Memory
- No care data is included in the Trust Graph
- Full data deletion on circle close (30-day window); thread records reduced to minimal aggregate on thread close

---

## The CIP/Local Commons Boundary

The most important design boundary in the Care layer is between CIP and Local Commons's Needs & Offers. These handle different things:

| Situation | Platform | Why |
|---|---|---|
| "I need someone to help me move furniture on Saturday" | Local Commons Needs & Offers | Time-bounded, transactable, appropriate for the mutual aid layer |
| "I need a weekly meal delivery while I recover from surgery" | Local Commons Needs & Offers (for the logistics) + CIP care hold (for the ongoing awareness) | The logistics are Local Commons; the care awareness is CIP |
| "I am isolated and declining and don't know how to ask for help" | CIP care hold → support circle | Cannot be reduced to a Need; requires relational holding |
| "My neighbor and I had a serious conflict and we both want to repair it" | CIP repair thread | Not a governance issue; not a transactional exchange |
| "A member is in acute crisis right now" | Local Commons Steward emergency action | Immediate safety is a Steward function; CIP provides longer-term care after the acute phase |

The edge case: ongoing care that involves both logistics (meals, transport, company) and relational holding. CIP and Local Commons can operate in parallel for the same person. A support circle can use Local Commons Exchange Requests to coordinate the material needs while CIP holds the relational awareness. The two layers do not merge; they communicate.

---

## The Care Coordinator Role

Care coordinators are the human infrastructure of CIP. They are not a platform role in the same way Stewards are — they may be Stewards, or they may be other members who have capacity and trust for this work.

**What care coordinators do:**
- Maintain awareness of who in the neighborhood needs ongoing support
- Hold care hold identities (anonymously, where needed)
- Facilitate circle formation when a hold needs one
- Monitor care load distribution and flag when it is unhealthy
- Facilitate repair threads

**What care coordinators do not do:**
- Adjudicate conflict
- Provide clinical care or crisis intervention
- Keep records beyond what CIP provides

**The burnout problem:** Care coordinators are the most likely people in the system to carry others' difficulty without adequate support for themselves. CIP includes a care coordinator well-being check — not a metric, but a regular prompt to care coordinators asking whether they have support themselves, and connecting them to peer coordinators in other neighborhoods (Phase 2).

---

## What This Platform Cannot Hold

Some care cannot be coordinated through a platform, however well-designed.

**Clinical and professional care.** Mental health crises, addiction, serious illness, suicidality, domestic violence — these require professional infrastructure that CIP does not and should not provide. CIP can hold the community care dimension of these situations. It cannot provide the clinical care.

**The care that doesn't know it needs coordinating.** The most invisible care happens outside any platform: the neighbors who check in informally, the phone calls that happen because two people have a relationship, the meals left at doorsteps without being logged. CIP serves care that has reached the threshold of needing coordination. Most care never does — and that is a feature of healthy community, not a gap in the platform.

**The grief that has no form.** When a neighborhood loses someone, or experiences collective trauma, the care that is needed is often not coordinated mutual support — it is shared presence, ritual, and time. CIP can provide infrastructure for the practical dimensions of community response. It cannot hold the grief itself.

**Care across power differentials.** Some "care" relationships are actually dynamics of control or extraction — an abusive relationship framed as caretaking, a dependent relationship that keeps the vulnerable person vulnerable. CIP cannot identify these from the outside. The care coordinator role exists partly to hold these complexities; the platform itself cannot.

---

## Integration with Integral Commons Layers

### CIP ↔ Local Commons

CIP care coordinators have access to Local Commons's Steward alert system when a care situation reaches a threshold that requires Steward action. Support circles can use Local Commons Exchange Requests for the material logistics of care (resource access, exchange coordination). Local Commons Stewardship Record and contribution records are explicitly not integrated with CIP — care given through CIP does not appear in anyone's Trust Graph.

### CIP ↔ CommonGround/Governance

If a care situation escalates to a level requiring governance action (a member's removal, a formal boundary-setting decision), the repair thread can close and route to a CommonGround Conflict Resolution Decision. The transition is one-directional — governance can take over from care, but governance should not be the first path for relational repair.

### CIP ↔ EIL

No integration planned. Care relationships are not ecologically scoped.

### CIP ↔ AI Layer

Aggregate care load data (number of active circles by neighborhood, care coordinator load distribution, repair thread completion rates) is available to the intelligence layer as aggregate signals — never individual care data. The AI layer can surface the signal "care load in this neighborhood is concentrated in two coordinators and has been increasing for 60 days" without knowing anything about the specific care relationships.

---

## Phased Roadmap

### Phase 1: Foundation (3–4 months)

**Goal:** Prove that care coordination infrastructure can serve community care without instrumentalizing it.

**Ships:**
- Care Hold (anonymous and named) — minimal, coordinator-only
- Support Circle (formation, coordination, closing) — private-by-default
- Care coordinator view (load distribution, aggregate signals only)
- CIP/Local Commons boundary handling (exchange requests from circles, Steward alert integration)
- Privacy infrastructure (circle data deletion on close, no platform-held hold identities)

**Pilot:** Run alongside Local Commons pilots in Phase 1 neighborhoods. Recruit 1–2 care coordinators per pilot neighborhood before launch.

### Phase 2: Repair and Depth (3–4 months post-Phase 1 validation)

**Ships:**
- Repair Thread structure (4-phase, harmed-party-led)
- Facilitator guide for repair threads
- Cross-neighborhood care coordinator peer support (coordinators in different neighborhoods can connect)
- Care coordinator well-being check
- Anonymous care hold transition to circle with full privacy preservation

### Phase 3: Federation and Ecosystem (Phase 3+)

**Ships:**
- Cross-neighborhood support capacity for acute situations (a neighborhood with a major event can request care support from adjacent neighborhoods)
- Integration with Integral Commons intelligence layer for aggregate care health signals
- Care coordination training materials (open-source, not platform-dependent)

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Care coordinators burn out holding the platform's care infrastructure | High | High | Load distribution alert; peer coordinator network; explicit well-being check; named as structural problem, not personal failure |
| Platform becomes a substitute for actual care relationships | Medium | High | Platform minimalism — CIP should feel like the least invasive way to coordinate care, not a destination for it |
| Anonymous hold mechanism abused to avoid accountability | Low | Medium | Holds are coordinator-created, not self-reported; coordinator is accountable for the hold |
| Repair thread used to pressure harmed parties into "resolution" | Medium | High | Harmed party controls pace; thread cannot advance without their confirmation; coordinator can close a thread at any time |
| Care data inadvertently made visible through integration with other layers | Medium | High | Explicit integration boundary: CIP data is not in Trust Graph, not in Civic Memory, not in EIL; requires affirmative architectural decision at every integration point |
| CIP becomes a referral pipeline to professional services without being one | Medium | Medium | CIP explicitly names what it is not; coordinator training includes knowing when to refer out; platform provides resource directory rather than clinical routing |
| Care coordinator role falls on the same people as Steward role, concentrating load | High | High | Load distribution tracking; explicit separation of Steward and care coordinator roles; multiple care coordinators required per neighborhood at Phase 2 |

---

## What This System Intentionally Does NOT Do

**It does not track care.** No ledger, no score, no contribution record. Care given through CIP does not appear anywhere in a member's profile. This is by design.

**It does not make care visible.** The neighborhood does not know who is in a support circle, who has a care hold, who is in a repair thread. The default state of care in CIP is private, not public.

**It does not equate care with productivity.** One hour of sitting with someone in grief is not the same as one hour of delivering meals, even though Kindred would credit them equally. CIP does not credit either. It holds both.

**It does not resolve what needs to be held.** Some difficulties do not resolve. Some grief persists. Some care relationships do not have a clean closure. CIP does not require or expect resolution — it provides continuity of coordination for ongoing care.

**It does not replace professional support.** The platform is explicit about this in every interface where it could be mistaken for something it is not. CIP coordinates community care. It does not provide clinical care.

**It does not make caring easier.** Caring for people in difficulty is hard, emotionally taxing, and sometimes overwhelming. CIP makes the coordination easier. It does not make the care itself easier. Nothing can.

---

## Glossary

- **Support Circle** — A small private group (2–8 members) organized around holding a specific person or situation over time. Visible only to circle members and the facilitating care coordinator.
- **Care Hold** — A record that someone needs ongoing support, created by a care coordinator. Anonymous holds are held by the coordinator; named holds are visible to care coordinators only.
- **Repair Thread** — A structured, confidential process for navigating harm between community members. Centered on the harmed party's needs. Not a governance proceeding.
- **Care Coordinator** — A member (may be a Steward) who maintains awareness of care needs in the neighborhood, facilitates circles and holds, and monitors care load distribution.
- **Care Load** — The aggregate care coordination burden currently held by care coordinators. Tracked as a distribution, not attributed to individuals.
- **Kindred** — The Flow Engine component that handles credited care work (time banking for care). Distinct from CIP: Kindred tracks credited care; CIP holds uncredited relational care.

---

*PRD v1.0. CIP is Layer 4 of the Integral Commons ecosystem. It is the most experimental layer — the design assumptions about what care needs coordinating and what it doesn't require ongoing validation with real care coordinators in pilot neighborhoods. The hardest constraint to hold throughout build: the platform must coordinate without instrumentalizing. Any feature that turns care into a metric or a score should be rejected regardless of how useful it appears.*
