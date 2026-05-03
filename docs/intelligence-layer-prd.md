# Intelligence Layer — Product Requirements Document

**Integral Commons Layer:** Layer 6 — Intelligence
**Version:** 0.8 — early PRD, concept stage
**Date:** 2026-05-03
**Status:** Concept stage. This document establishes the design direction, constraints, and hard limits for the Intelligence Layer. No implementation begins until all other layers have operational data worth synthesizing.

---

## What This Layer Is For

Each Integral Commons layer makes something visible within its own domain. Local Commons surfaces what a neighborhood has and needs. EIL surfaces what decisions cost the ecosystem. CommonGround surfaces how collective sense-making moves. CIP holds what cannot and should not be surfaced at all. The Flow Engine surfaces how resources meet needs across communities.

No single layer can see across all of them. The Intelligence Layer can.

Its purpose is narrow and deliberate: **make collective complexity legible without replacing human judgment**. When governance participation is declining in the same neighborhoods where care load is concentrating on the same Stewards, and where ecological constraint conflicts are clustering around the same decisions — no person and no individual layer can see that pattern. The Intelligence Layer can. Its job is to surface the pattern and step back.

What it produces is always a **legibility artifact** — a structured summary of what the data shows. Never a recommendation. Never a score. Never a prediction about what a community should do. The output is a map, not a route.

---

## What This Layer Is Not

This section is as important as the section above.

**Not a recommendation engine.** The Intelligence Layer does not recommend courses of action to communities or individuals. It does not suggest who should be Steward, which governance proposal is most likely to pass, or what resource exchanges to pursue. Recommendations shape behavior; legibility artifacts inform deliberation. These are not the same thing.

**Not a prediction engine.** The Intelligence Layer does not predict community behavior, individual participation, or governance outcomes. Predictions create self-fulfilling expectations, reward gaming, and transform descriptive models into normative ones. Prediction is a form of power over communities; legibility is a form of support for communities.

**Not a scoring or ranking system.** Communities are not scored for health, engagement, coherence, or participation. Members are not scored, ranked, or evaluated. Groups are not compared against benchmarks. No output of the Intelligence Layer produces an ordinal position for any person or community.

**Not an optimization target.** The system does not optimize communities toward any metric — not "governance health," not "care distribution equity," not "ecological performance." Optimization toward any metric produces communities that optimize for the metric rather than for what the metric was designed to represent. The Intelligence Layer is constitutionally prohibited from having a target state.

**Not a surveillance infrastructure.** Patterns made visible by the Intelligence Layer are aggregated, anonymized at the individual level, and governed by the communities whose data produces them. The layer does not produce individual-level behavioral profiles, even as a byproduct of pattern analysis.

**Not an autonomous system.** The Intelligence Layer does not act, flag individuals, trigger workflows, or initiate governance processes without human intermediation. Its outputs are always passed through a human — a Steward, a governance facilitator, a community member — before any action results.

---

## Design Principles

### Legibility, not direction

Every output of the Intelligence Layer is a structured summary of observable patterns. The format is descriptive: *"Governance participation in this neighborhood has declined 40% over the last three months, concentrated in decisions that affect the community garden."* Not: *"Governance participation is low; here are three ways to improve it."*

The difference matters. Descriptive outputs give communities information to deliberate with. Prescriptive outputs give communities a platform-defined problem framing and a platform-endorsed solution set. The second narrows deliberation; the first opens it.

### Uncertainty first

Every Intelligence Layer output includes the uncertainty of what it shows. Not as a footnote — as a primary element of the display. A pattern with low confidence is displayed differently from a pattern with high confidence. Conflicting data sources are shown as conflicting. The Intelligence Layer does not smooth over uncertainty to produce cleaner outputs.

Uncertainty first also means: when the data is insufficient to form a pattern, the output says so. A null result is a valid result. "We do not have enough data to see a pattern here" is more honest than interpolating from insufficient observations.

### All outputs are editable and contestable

A community may annotate, contest, or correct any Intelligence Layer output that describes them. If a pattern analysis of their governance history appears to be wrong — because local context invalidates the apparent pattern, or because the data is missing key events, or because the framing is culturally inappropriate — the community can add a correction that persists alongside the output.

Corrections are not removed from the Intelligence Layer's input data. If a pattern is consistently contested by the communities it describes, that contestation is itself a signal that the pattern methodology is failing. The contestation record is visible in the Intelligence Layer's own methodology documentation.

### Human interpretation layer required

The Intelligence Layer does not have a direct end-user interface that surfaces patterns without human interpretation. Every pattern output passes through one of:

- A governance facilitator who presents it in a governance context
- A Steward who contextualizes it for their neighborhood
- A community-designated data steward who prepares it for wider sharing
- The community's own governance process (where a member requests pattern data and it is deliberated together)

The platform does not push insights to individuals. Insights are requested, contextually interpreted, and community-governed.

### Build order and data dependency

The Intelligence Layer is architecturally last. It requires operational data from all other layers to be meaningful. A pattern synthesis layer with no data to synthesize produces spurious patterns or vacuous outputs. The build sequence is:

1. Local Commons + CommonGround operational (Phases 1-2)
2. EIL operational in parallel (Phase 1)
3. CIP operational (Phase 2)
4. Flow Engine operational (Phase 2)
5. Intelligence Layer begins meaningful design only when multiple other layers have real usage data

This is not a weakness of the design. It is an honest acknowledgment of what synthesis requires.

---

## Hard Constraints

These constraints are not configurable, not phase-gated, and cannot be overridden by any governance profile or institutional customization. They exist because the Intelligence Layer, by virtue of its cross-layer visibility, has more capacity for harm than any other layer in the system.

**C1. No individual-level profiling.** The Intelligence Layer does not produce, retain, or surface behavioral profiles of individual members. Pattern analysis operates on aggregated, anonymized population data. If a pattern cannot be shown without identifying specific individuals, it is not shown.

**C2. No predictive scores for individuals or communities.** The Intelligence Layer does not produce predictions about how a specific person will behave, how a specific community will vote, or what outcome a governance process will produce. Historical patterns are not used to forecast individual futures.

**C3. No optimization targets.** There is no community health score, engagement benchmark, or ecological performance metric that communities are measured against. The Intelligence Layer does not define what a healthy community looks like.

**C4. No autonomous action.** The Intelligence Layer does not initiate governance processes, flag individuals to Stewards, trigger workflows, or take any action without explicit human decision at the point of action. Outputs are artifacts for human use; they do not execute.

**C5. No recommendations.** "Based on this pattern, we recommend..." is prohibited output. The Intelligence Layer surfaces patterns; it does not advise on responses.

**C6. Communities own their data's pattern outputs.** A community may request that pattern analyses of their data be removed from cross-community synthesis. Their removal from synthesis does not affect their own access to their own layer data.

**C7. Methodology is public.** The algorithms, training approaches, data sources, and analytical methods used in the Intelligence Layer are fully documented and publicly accessible. Communities can understand how any pattern output was produced. Black-box outputs are constitutionally impermissible.

**C8. CIP data is excluded.** The Care Integration Platform holds the most sensitive data in the ecosystem (relational care, grief, crisis, conflict). CIP data is never an input to Intelligence Layer synthesis. No pattern analysis crosses the CIP boundary.

---

## What the Intelligence Layer Can Surface

Within the hard constraints above, the following patterns are within scope:

### Cross-layer patterns

- **Governance-care correlation.** Where governance participation is declining, is care load also concentrating? This suggests Steward burnout or community stress. Neither is visible within a single layer.
- **Resource-need mismatches at scale.** Where Local Commons Needs & Offers consistently has unmet needs of a type that Flow Engine Synapse shows as available in an adjacent region. The mismatch is invisible to either layer alone.
- **Ecological-governance clustering.** Are EIL constraint conflicts and governance process activations clustering around the same territories or resource types? This might indicate an ecological hotspot that is producing governance load.
- **Care-resource co-occurrence.** Where CIP support circles are active (count visible, individuals not), is Local Commons exchange activity also elevated? This suggests coordinated care is generating resource demand. (Note: CIP data is count-only in this context — number of active circles in a neighborhood, not any detail about what they contain.)

### Within-layer patterns

- **Governance participation trends.** What is the trajectory of participation across decisions, by decision type, over time? Not predictive — descriptive.
- **Ecological data contestation geography.** Are EIL data annotations from communities clustering in specific territories or around specific data sources? This informs EIL about where its methodology is failing.
- **Resource circulation velocity.** Is the gift economy moving or stalling? Where is exchange density high, and where has it flattened?
- **Decision record accumulation.** Where is governance producing completed Decision Records at scale? This is useful for identifying governance profiles that are working and might inform governance profile templates for other communities.

### What the patterns look like in output

A legibility artifact from the Intelligence Layer looks like:

```
Pattern Report — [Community Cluster Name] — [Date Range]
Confidence: Moderate (±22%)
Data sources: Local Commons participation records, CommonGround Decision Records, EIL constraint event log

OBSERVED PATTERN:
Governance participation in 3 of 7 neighborhoods in this cluster declined by 35-50% 
over the period [start date] to [end date]. The decline is concentrated in decisions 
classified as affecting shared outdoor spaces.

In the same period, Steward alert counts (not content) in the same neighborhoods 
increased by 40%.

These patterns are correlated (r=0.71). The correlation does not establish causation.

WHAT IS NOT VISIBLE:
- Why participation declined (this would require qualitative community inquiry)
- Whether the Steward alerts are related to the governance topics (alert content is private)
- Whether this is a signal of stress or a normal seasonal variation

COMMUNITY NOTES:
[Space for community annotation — empty in this report]

METHODOLOGY:
See intelligence-layer-methodology.md §4.2
```

---

## Data Architecture

### What data the Intelligence Layer receives

The Intelligence Layer receives structured, anonymized outputs from other layers — not raw data:

| Source layer | What is shared | What is excluded |
|---|---|---|
| Local Commons | Exchange count aggregates; participation rate trends; Steward alert counts (not content); governance participation rates | Individual member records; exchange details; Steward alert content; Stewardship Records |
| CommonGround | Decision counts, participation rates, decision method distributions, deliberation duration trends | Individual votes, Perspectives, comments, member identity |
| EIL | Ecological constraint event counts; community annotation counts; uncertainty levels | Community annotation content; individual submitter identity |
| CIP | Active support circle count per neighborhood (only) | All circle content; member identity; care hold details; repair thread details |
| Flow Engine | Exchange volume aggregates; resource type distributions; Kindred circulation counts | Individual attestations; household-level declarations; item check-out records linked to individuals |

### Retention policy

Intelligence Layer synthesis results are retained for the communities that produced them, for as long as the communities choose. Synthesis results that have been annotated or contested by communities retain both the original result and the annotation.

Underlying aggregated data inputs are retained for 24 months rolling, then archived. Communities may request earlier deletion.

---

## Governance of the Intelligence Layer

The Intelligence Layer, because of its cross-layer visibility, requires governance mechanisms that no other layer requires.

### Methodology governance

The algorithms and methods used in synthesis are governed by a technical working group with community representation. Methodology changes require:
1. Public documentation of the proposed change
2. Community review period (minimum 30 days)
3. Consent of the governing bodies of all affected layers
4. Update of public methodology documentation before deployment

### Pattern output governance

A community may:
- Request all pattern outputs that include their data
- Annotate any pattern output with local context or corrections
- Contest a pattern output (the contestation is documented and persists)
- Request exclusion from cross-community synthesis (their data is still available to them; it no longer contributes to aggregate patterns visible to other communities)

### Incident response

If the Intelligence Layer produces an output that a community believes has caused harm — misrepresented their governance, produced an incorrect pattern that was acted on by a Steward, or surfaced information that violated the privacy constraints — the community has a formal harm report process. Harm reports trigger a methodology review within 14 days.

---

## Build Prerequisites

Before Intelligence Layer development begins:

1. **Data schema alignment** across all other layers (their aggregated outputs must be structurally compatible for synthesis).
2. **Consent architecture** for communities to opt in/out of cross-community synthesis.
3. **Methodology documentation framework** — the public-facing methodology documentation system must exist before any synthesis methodology is developed.
4. **Hard constraint verification** — an independent review of the data architecture against the eight hard constraints above, before any data begins flowing.

---

## What This Layer Will Never Build

These items are not future roadmap items deferred to a later phase. They are constitutionally prohibited and will not be built:

- Community health scores or engagement rankings
- Member trust scores, reputation ratings, or contribution rankings
- Predictive models for governance outcomes, member behavior, or community decisions
- Recommendations for what communities or individuals should do
- Integration with CIP data (any configuration)
- Any output that identifies individual members within a pattern
- A/B testing of community governance (running different governance configurations in different communities to compare outcomes)
- Advertising targeting or behavioral data monetization (any configuration)

---

## Open Questions

1. **The consent granularity problem.** Communities consent to cross-layer synthesis at the community level. But the data represents individuals. Is community-level consent sufficient for individual-level data contributing to aggregate patterns? Or does the Intelligence Layer require individual consent for each data point? This tension needs resolution — probably through anonymization strong enough that community-level consent is adequate.

2. **The methodology gaming problem.** Once communities understand how pattern outputs are produced, sophisticated actors may try to game the inputs (inflating participation counts during measurement windows, etc.). How does the methodology remain legible without becoming gameable?

3. **What "moderate confidence" means.** The example output above uses "Confidence: Moderate (±22%)". How are confidence intervals calculated for cross-layer pattern synthesis, where the underlying data sources have different quality, coverage, and reliability? This needs rigorous methodology development before the Intelligence Layer is built.

4. **Who is the user.** Pattern outputs go through human intermediaries (Stewards, facilitators, data stewards). But who are those people, what training do they need, and how does the platform support them in interpreting and contextualizing outputs responsibly? The human interpretation layer is not just a design requirement — it is a user need that requires its own design.

5. **The null result problem.** When there is no pattern visible in the data, what does the Intelligence Layer return? "No pattern detected" is a legitimate output. But communities may interpret absence of pattern as absence of problem. How does the Intelligence Layer communicate the limits of what it can see?

---

*PRD v0.8. The Intelligence Layer is Layer 6 of the Integral Commons ecosystem and the last to be built. The eight hard constraints in this document are the most important thing it establishes. All future design and development of the Intelligence Layer must be evaluated against them first. The layer's value is entirely contingent on communities trusting that it will not be used against them — and that trust requires the hard constraints to be structurally enforced, not just documented.*
