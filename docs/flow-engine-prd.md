# Flow Engine — Product Requirements Document

**Integral Commons Layer:** Layer 2 — Resource Flow
**Version:** 0.9 — early PRD, concept stage
**Date:** 2026-05-03
**Status:** Concept stage. This document establishes the design direction and constraints for the Flow Engine. It is not yet a build-ready specification. Phase 2 build follows Local Commons reaching operational scale.

---

## What This Layer Is For

Every community produces more of some things than it needs and less of other things. Neighborhood A has three industrial sewing machines sitting idle. Neighborhood B has people who need warm coats and people who know how to sew. Neighborhood C has someone with a truck, free Saturdays, and nowhere to be. Local Commons surfaces what each neighborhood has. The Flow Engine handles what happens next — when the resource needs to cross a neighborhood boundary, when matching requires more than a notice board, when the lifecycle of a shared thing needs coordination beyond a single exchange.

The Flow Engine is not a market. It does not discover prices. It does not optimize for throughput or efficiency. It routes things — materials, skills, tools, care credits — according to what communities have declared they need, within ecological limits that EIL has established, using coordination mechanisms that leave control with the communities.

The three components of the Flow Engine address three different aspects of resource flow:

- **Synapse** — participatory need and capacity matching at cross-neighborhood scale
- **Equip** — lifecycle management for physical assets shared across communities
- **Kindred** — attestation-based gift ledger for tracking care and contribution without ranking persons

These are components of one layer, not three separate products. They share data structures, authentication, and the constitutional constraints of the Integral Commons ecosystem. A neighborhood using Equip for tool sharing may also use Kindred to track skill exchanges. Synapse draws on both to understand what a region actually has and what it actually needs.

---

## What This Layer Is Not

**Not a marketplace.** Resources are not listed for sale. Prices are not set by the platform. Supply and demand signals are not used to allocate things. The Flow Engine is an allocation layer for things communities have decided to share — it does not create incentives to commodify what was not previously for sale.

**Not an optimization engine.** Synapse finds matches; it does not define what a good match means. "Optimal" in the Flow Engine vocabulary means: need is met, ecological constraints are honored, the community has consented to the match. It does not mean maximum throughput, minimum waste, or highest utilization rate.

**Not a replacement for Local Commons.** Local Commons's Resource Registry and Needs & Offers handle hyper-local, neighborhood-scale exchange. The Flow Engine handles what Local Commons cannot: cross-neighborhood routing, asset lifecycle management for things too large or expensive to exist per-neighborhood, and aggregate pattern visibility across multiple communities. The two layers are complementary and should not duplicate each other.

**Not a reputation layer.** Kindred records that gifts happened. It does not score givers. It does not produce portable trust credentials. It does not gate access to resources, governance, or status. The Kindred design principles (see `docs/kindred-design-principles.md`) are architecturally binding on all Flow Engine development.

---

## The Local Commons / Flow Engine Boundary

This boundary requires architectural precision because both layers deal with resource sharing:

| Scenario | Which layer | Why |
|---|---|---|
| Neighbor offers their ladder for the weekend | Local Commons Registry + Needs & Offers | Hyper-local, informal, single exchange |
| Neighborhood collectively owns a cargo bike and manages check-out | Local Commons Registry + Lightweight Governance | Collectively-owned, one neighborhood, governance-managed |
| Three neighborhoods share an industrial kitchen; need check-out, maintenance tracking, repair fund | Equip | Cross-neighborhood asset, lifecycle management, repair fund governance |
| I have surplus tomatoes; who nearby needs them? | Local Commons Needs & Offers | Informal, perishable, neighborhood-scale |
| A housing cooperative needs to match bulk grain buying across ten households in different neighborhoods | Synapse | Participatory planning, cross-neighborhood aggregation |
| A neighbor helped me with childcare three times; we want to record this | Kindred | Mutual attestation, care ledger, opt-in credit tracking |
| A neighbor is going through cancer treatment; three people are informally supporting them | CIP (Care Integration Platform) | Relational care, not transactional, should not be on a ledger |

The Kindred/CIP boundary is especially important: **Kindred records credited care by consent; CIP holds uncredited relational care that cannot and should not be tracked.** The same person may appear in both. The same situation may involve both layers. They must never merge.

---

## Component 1: Synapse — Participatory Planning

### What Synapse does

Synapse aggregates declared needs from households and communities and matches them to production, sourcing, and distribution capacity — bounded by ecological constraints from EIL. It is a coordination layer for participatory economic planning, not a price discovery mechanism.

The core loop:
1. Households and collectives declare what they expect to need over a planning horizon (a season, a quarter).
2. Production collectives and resource holders declare what they can make available.
3. Synapse matches capacity to need, subject to EIL ecological constraints for the relevant bioregion.
4. Matched plans are proposed to participating communities for consent through their governance process.
5. Communities accept, modify, or reject plans; the result is a coordinated production and distribution commitment.

### Privacy requirements

Household-level need declarations are **never surfaced individually** or aggregated in ways that create individual consumption histories. This is not just a privacy policy; it is an architectural requirement.

- Aggregate need declarations (how many units of X does this region need this quarter) are visible to planners and communities.
- Individual household declarations are known only to the household, their immediate coordination circle, and the cryptographic proof layer.
- Synapse **MUST NOT** retain per-household consumption histories in a form that could create a "responsible consumer" score, an "irresponsible consumer" flag, or any per-person consumption pattern.
- Zero-Knowledge Proofs (ZKP) for household-level inputs to region-level aggregates are the target architecture for Phase 2. Where ZKP is not yet implemented, individual declarations must be stored encrypted and accessible only to the declaring household.

### EIL integration (hard constraint)

EIL provides ecological capacity constraints — carbon budget, water availability, biodiversity thresholds — for the bioregion in which Synapse is operating. These are **hard constraints, not soft inputs.** A production plan that exceeds an EIL bioregional threshold is not surfaced to communities as a viable option. Synapse routes within the envelope EIL defines; it does not optimize against it.

When EIL constraints make a desired match impossible, Synapse surfaces this explicitly: *"The production plan you requested is not feasible within the current bioregional water budget. Here are the alternatives within the feasible envelope."* Constraints are visible, not hidden in an opaque algorithm output.

### What Synapse does not do

- **Does not set prices.** There are no prices in Synapse's data model.
- **Does not rank households by their consumption patterns.** See privacy requirements.
- **Does not automate decisions.** Synapse produces proposed matches for community consent. It does not execute distributions.
- **Does not operate without governance.** Any production plan produced by Synapse must pass through the participating communities' governance process before it becomes a commitment.

### Concrete use case: decentralized farms, regional surplus/shortage visibility

The target Phase 2 pilot use case for Synapse is a network of decentralized farms and the localities and municipalities they supply. This use case is more tractable than full participatory planning and validates the core Synapse architecture.

**The problem:** Farms produce surplus and shortage in patterns that are invisible to each other and to the municipalities that could redistribute or procure from them. Surplus rots. Shortages go unmet. Price signals are the current allocation mechanism — but price signals exclude communities with low purchasing power and don't optimize for ecological health or food sovereignty.

**What Synapse provides:**

*Surplus/shortage visibility map.* Farms and food producers declare availability in near-real-time or by planning horizon: crop type, quantity, location, availability window, any conditions (collection required, organic certification, storage capacity available). This is a regional supply map — not a marketplace, not a price-discovery mechanism. The map shows what exists and where; it does not set the terms of exchange.

*Allocation routing.* Localities, food cooperatives, and municipalities declare what they need. Synapse matches capacity to need, subject to EIL constraints (water budget, soil stress, biodiversity indicators for the bioregion). The output is a proposed allocation: farm A's surplus squash goes to locality B and food co-op C. Communities and institutions consent to or modify the proposal; Synapse does not execute it.

*Municipal procurement bridge.* When a municipality's allocation requires a formal procurement decision — a civic commitment of public funds toward local farm purchasing — that decision moves through MCS (participatory budgeting or community priority-setting module). Synapse makes the opportunity visible; MCS governs the institutional response.

**What Synapse does not do in this use case:**
- Does not arrange transport or logistics. It identifies allocation opportunities; delivery is a third-party problem.
- Does not negotiate prices. Terms of exchange are agreed between producer and recipient directly, or through their governance processes.
- Does not make farms visible to anyone they haven't consented to share with.

**Actor types this introduces:**

The farm surplus/shortage use case requires a *producer* actor type that doesn't exist in the current Local Commons household/community model:

| Actor | Type | Visibility of declarations |
|---|---|---|
| Household | Private — ZKP required | Aggregate only; never individual |
| Farm / food producer | Producer — opt-in public | Surplus/shortage declared publicly by default; opt-out available |
| Food cooperative | Collective | Needs declared on behalf of members; member-level privacy preserved |
| Municipality | Institutional | Procurement needs public; deliberated through MCS |

The producer actor type needs to be designed before Phase 2 Synapse development begins. It has different privacy characteristics from household declarations and different governance relationships (a farm is often a business, not a commons participant in the same sense as a household).

**EIL integration is especially direct here.** Farms are major generators of EIL data — water use, soil health, biodiversity indicators, carbon sequestration. A farm participating in Synapse is also a data source for EIL. The data relationship is bidirectional: EIL constrains what Synapse can route (bioregional water budget); farms annotate EIL with ground-truth production data.

### Phase 2 scope

Synapse is the most complex component of the Flow Engine and has the most demanding data infrastructure prerequisites. **Phase 2 scope: regional surplus/shortage visibility and allocation matching for food producers and municipalities.** This is the pilot use case. Full participatory planning (production scheduling from aggregate household need declarations) is Phase 3.

---

## Component 2: Equip — Shared Asset Lifecycle

### What Equip does

Equip manages the lifecycle of physical assets that communities own collectively and share across neighborhoods. Where Local Commons tracks what a single neighborhood has, Equip manages things that multiple neighborhoods share — their check-out, maintenance, repair, and retirement.

The canonical use cases:
- A set of three neighborhoods co-owns an industrial sewing machine, a table saw, and a cargo bike. Equip manages check-out scheduling, maintenance reminders, and repair coordination across all three.
- A food cooperative shares fermentation equipment, canning supplies, and a commercial dehydrator with five member communities. Equip tracks equipment location, condition, and the maintenance schedule.
- A neighborhood cluster shares a tool library that's too large and too diverse to manage informally. Equip's check-out layer replaces the spreadsheet and the person whose job it is to manage the spreadsheet.

### Item lifecycle

Every Equip item has a lifecycle record:

| State | Description |
|---|---|
| Available | Ready for check-out |
| Checked out | With a borrowing member or neighborhood; due date set |
| In maintenance | Scheduled maintenance in progress |
| Needs repair | Flagged by a user; awaiting repair coordination |
| In repair | Repair in progress |
| Retired | No longer in service; record retained |

Condition notes and use-hours are tracked **on the item**, not on the user. A drill's history of who has used it is not surfaced as a per-user reliability score. If access to a specific item needs to be conditioned on demonstrated competence, that is a governance decision (a policy attached to the item through the item's governing body) — not an automatic system score.

### IoT integration (Phase 2+)

Smart locks and smart lockers for check-out without a human intermediary are a Phase 2 feature requiring hardware partnerships. Phase 1 Equip operates with manual check-out confirmation (a two-party confirmation: borrower marks item as taken, a designated keeper marks it as released). IoT hardware for automated lock/unlock is a Phase 2 enhancement, not a Phase 1 requirement.

### Repair and maintenance

Repair is handled through two mechanisms:

1. **Maintenance schedule.** Items have maintenance schedules (configurable per item type). When an item reaches a maintenance threshold (use-hours, date, or condition flag), a maintenance request is created and routed to the item's designated repair collective or volunteer maintainers. This is a coordination artifact, not a governance decision.

2. **Repair fund.** Items in Equip can be associated with a repair fund — a commons pool contributed to by the communities that use the item. Contribution model, payout rules, and access decisions are **governed by the communities through their governance layer** (Local Commons governance or CommonGround, depending on the organizational structure of the owning collective). Equip does not define how the repair fund works; it provides the accounting infrastructure for the fund that communities govern.

**Key constraint:** A member's repair fund contribution history is not a credential. Contributing to the repair fund does not grant access to assets or authority in governance. It is a financial record, not a social credit.

### What Equip does not do

- **Does not create per-user reliability scores.** Item condition tracking is about items.
- **Does not gate access by contribution history.** Access rules are set by item policy (requires membership, requires training, requires sign-off from the governing collective) — never by accumulated contribution counts.
- **Does not auto-execute governance decisions.** When a member has repeatedly returned items in poor condition, the appropriate response is a governance process (an Issue in the item's governing body) — not an automatic access restriction.

---

## Component 3: Kindred — Attestation-Based Gift Ledger

### What Kindred does

Kindred records the circulation of gifts, care, and contribution through mutual attestation. It makes visible what gift economies tend to make invisible — who is giving what to whom, what is needed, what is in motion — without turning givers into scores.

The design principles governing Kindred are documented in `docs/kindred-design-principles.md`. That document is **architecturally binding**. The summary:

- **Record, do not rank.** Kindred records that a gift happened; it never aggregates records into a score, level, tier, or rating.
- **No gating.** No Integral Commons feature may be conditioned on Kindred balance, contribution count, or contribution history.
- **Authority is not purchased.** Governance roles and stewardship are delegated through constitutional process. Kindred activity is not a credential.
- **Portable records, not portable ratings.** A member may export their own gift history. No portable rating or tier travels between spaces.
- **Demurrage.** Credits expire (default: 12 months). Expired credits are not debts.
- **Voluntary visibility.** Ledger participation is opt-in, per member, per act.
- **Flow over stock.** The UI emphasizes circulation, not accumulation. Personal totals are private by default.
- **No comparison mechanics.** No leaderboards, streaks, badges for cumulative activity.
- **No secondary market.** Credits are not exchangeable for money or cryptocurrency.
- **Mutual attestation.** Both parties (or a witness) must attest for a transaction to enter the ledger.

### The gift-first default

Kindred inherits the gift-first orientation from Local Commons's time credit design. All care and contribution is a gift by default. Kindred tracking is opt-in — if neither party requests credit recording, the gift is simply a gift and nothing enters the ledger. The ledger serves parties who want a coordination mechanism; it does not serve the platform's desire to see everything.

### Time credits as coordination tokens

When both parties opt into credit recording:
- Time credits are functional coordination tokens, not a currency reflecting worth.
- 1 hour = 1 credit (radical equality; Kindred does not price labor by market rate).
- Credits can be used to initiate further matched requests within the ledger's domain — not to redeem for assets or governance access.
- Credits expire after 12 months by default. Spaces may configure shorter windows.

### The Kindred/CIP boundary

| Use case | Layer |
|---|---|
| I helped my neighbor move; we both want to record it | Kindred |
| Three neighbors have been informally supporting someone through grief for months | CIP |
| A skill-share coordinator wants to track who has given teaching time this quarter | Kindred (aggregate, not per-person score) |
| A support circle is coordinating ongoing care for a member in crisis | CIP |
| A repair café coordinator wants to see how much repair labor has circulated this year | Kindred (collective pattern visibility) |
| Someone is providing ongoing emotional labor that the receiver doesn't want made visible | CIP or neither — not Kindred |

The rule: if the care is ongoing, relational, and could be damaged by being put on a ledger, it belongs in CIP or nowhere. Kindred is for the kind of care that both parties want to make legible.

### Collective pattern visibility

While personal totals are private, collective patterns are visible:

- "This community has circulated 340 care-hours in the last quarter."
- "Skills most offered this month: carpentry, childcare, cooking."
- "Skills most requested this month: plumbing, translation, emotional support."

These are aggregate signals. They tell communities where there is abundance and where there is gap. They do not tell communities who is giving and who is taking.

---

## Cross-Component Data Model

The Flow Engine shares a data layer across its three components. Key objects:

```
FlowResource {
  id
  type: "material" | "skill" | "tool" | "space" | "time"
  source_neighborhood_id       // null if cross-neighborhood or federated
  equip_item_id (nullable)     // link to Equip if a physical asset
  ecological_footprint (nullable) // EIL data attached if available
}

SynapseDeclaration {
  id
  community_id
  resource_type_id
  quantity_aggregate             // never individual household
  planning_horizon
  status: "draft" | "proposed" | "consented" | "committed"
  eil_constraint_check (bool)
}

EquipItem {
  id
  name
  owner_community_ids[]
  current_state                  // see lifecycle table
  condition_notes[]              // on the item, not the user
  maintenance_schedule
  repair_fund_id (nullable)
  governing_body_id              // Local Commons or CommonGround instance
}

KindredAttestation {
  id
  giver_id
  receiver_id (nullable — may be anonymous)
  witness_id (nullable)
  care_type_tags[]
  time_value_hours (nullable)
  credit_issued (bool)           // opt-in; false if gift-only
  created_at
  expires_at (nullable)          // for credit-bearing attestations
}
```

No Flow Engine object holds a per-person aggregate score, rank, or balance in a form visible to anyone other than the person themselves.

---

## Integration with Integral Commons Layers

### Flow Engine ↔ Local Commons

Local Commons Registry and Equip are adjacent, not the same:
- Items registered in Local Commons are neighborhood-managed, informal, and governed by neighborhood rules.
- Items registered in Equip are cross-neighborhood managed, have formal lifecycle tracking, and are governed by a formal collective (which may use Local Commons governance or CommonGround).
- A neighborhood may choose to graduate a heavily-used item from Local Commons management to Equip when the coordination load warrants it.
- Kindred attestations can reference Local Commons exchange records as context — but Kindred is opt-in and the Local Commons exchange itself is not affected by whether Kindred is used.

### Flow Engine ↔ EIL

EIL provides hard ecological capacity constraints for Synapse routing. This is not a soft integration:
- Before any Synapse plan is proposed to communities, it must pass an EIL constraint check.
- Plans that exceed EIL bioregional thresholds are not surfaced as viable options.
- EIL uncertainty is surfaced alongside constraint checks: *"The water budget constraint is based on data with ±15% uncertainty. Plans near the threshold carry higher feasibility risk."*
- Community annotations from Local Commons Stewards that correct or contextualize EIL data are visible in the Synapse planning interface.

### Flow Engine ↔ CIP

Kindred and CIP do not share data. They communicate through coordination signals only:
- A CIP support circle may use Local Commons Exchange Requests for material logistics (see CIP PRD). It does not use Kindred.
- A Kindred attestation for care given does not create or modify a CIP care record.
- The boundary is designed and enforced. Merging the two layers would destroy the protection CIP provides for unquantifiable care.

### Flow Engine ↔ CommonGround

Governance decisions affecting Flow Engine resources (Equip repair fund rules, Synapse participation policies, Kindred opt-in configurations for a community) are made through CommonGround's deliberation process. The Flow Engine does not have its own governance layer; it uses the governance infrastructure of the communities that operate it.

---

## Non-Goals

**Not building a gift economy from scratch.** The Flow Engine serves communities that already have gift-economy practices and want coordination infrastructure for them. It does not create the social conditions for gifts to circulate.

**Not replacing cash or conventional exchange.** Participating communities may use Integral Commons alongside conventional economic activity. Kindred credits and Synapse coordination do not need to replace money; they supplement it where communities choose.

**Not tracking everything.** Most exchanges — most gifts, most informal sharing, most skill loans — will never enter the Flow Engine. That is correct. The ledger is for the minority of exchanges where coordination infrastructure adds value.

**Not solving distribution inequality through design.** The Flow Engine can make resource circulation more efficient within communities that have resources to share. It cannot address communities that lack resources. Structural inequality is a political problem, not a coordination problem.

---

## Risks and Hard Problems

| Risk | Severity | Notes |
|---|---|---|
| Kindred slowly accretes social credit system properties through incremental feature additions | High | Mitigation: architectural data constraints make aggregate scores structurally impossible; design principles document is binding |
| Synapse planning data leaks household consumption patterns | High | Mitigation: ZKP architecture; aggregate-only surfacing; no per-household history retention |
| Equip becomes a "who broke things" ledger for users rather than items | Medium | Mitigation: data model expresses condition on items; governance process for access decisions, not automatic scoring |
| Cross-neighborhood coordination requires trust between neighborhoods that have no existing relationship | Medium | Mitigation: Synapse and Equip require explicit community consent at each stage; no automatic routing |
| Ecological constraints from EIL are contested or wrong | Medium | Mitigation: EIL's uncertainty quantification and community annotation layer surfaces this; Synapse shows the constraints and their uncertainty, communities deliberate |
| The Synapse planning cycle (seasonal or quarterly) is too slow for real-time needs | Medium | Mitigation: Synapse handles planned needs; unplanned needs remain in Local Commons Needs & Offers |
| Flow Engine Phase 2 build depends on Local Commons being operational, which delays it | Low-Medium | Architectural decision: this dependency is intentional and correct |

---

## Build Sequence

The Flow Engine is **Phase 2** — it depends on Local Commons reaching operational scale. Within Phase 2:

1. **Kindred first.** Simplest data model; least infrastructure dependency; most immediately useful. Kindred can operate without Synapse or Equip.

2. **Equip second.** Requires Local Commons Registry to be stable (Equip extends it); requires a governance layer to be operational (CommonGround or Local Commons governance). IoT integration is Phase 2+; Phase 2 baseline is manual check-out confirmation.

3. **Synapse last.** Requires real usage data from Local Commons, Equip, and Kindred to be useful. ZKP implementation is technically complex and needs dedicated cryptographic expertise. Phase 2 scope: regional matching for pre-declared needs in specific domains. Full participatory planning is Phase 3.

---

## Open Questions

1. **Synapse governance.** Who governs the parameters of the matching algorithm — the weighting between need urgency, ecological constraint severity, and distribution fairness? This cannot be a technical default; it must be a community decision. How is this represented in the governance layer?

2. **Cross-neighborhood trust.** Equip and Synapse require communities to trust each other across neighborhood boundaries. What is the minimum trust infrastructure required? Is this vouching between Stewards? A formal inter-community agreement? CommonGround's consent process?

3. **EIL constraint contestation.** When communities believe an EIL constraint is wrong (the bioregional water budget underestimates actual availability), the annotation layer lets them flag this. What happens when the constraint is contested? Does Synapse hold until EIL is updated? Does the community governance process allow them to override a constraint they believe is wrong?

4. **Kindred across spaces.** Kindred operates within a community's domain. When two people from different neighborhoods want to record a gift, which Kindred instance holds the record? This is a federation-scope question; Phase 2 Kindred operates within single Local Commons instances; cross-neighborhood Kindred is Phase 3.

5. **Synapse/EIL integration timing.** EIL constraint data is available now (Phase 1). Synapse planning is Phase 2. What EIL integration points need to be built into Phase 1 data schemas to avoid rebuilding later?

---

*PRD v0.9. Flow Engine is Layer 2 of the Integral Commons ecosystem. All three components (Synapse, Equip, Kindred) are concept stage; this document establishes design direction and constraints. The Kindred design principles document (`docs/kindred-design-principles.md`) is binding on all Kindred development. Phase 2 build begins after Local Commons reaches operational scale in pilot neighborhoods. The most important thing to get right before Phase 2 begins: the Kindred data model must structurally prevent per-person aggregate scoring — this is an architectural constraint, not a policy constraint.*
