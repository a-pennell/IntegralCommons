# CommonGround Ecosystem — Consolidated Overview

**Version:** 1.0
**Date:** 2026-04-19
**Status:** Supersedes `resource_commons_prds.md` and `coordination_governance_prds.md` as the strategic frame. Those files remain in `/docs` as historical drafts.

---

## Decomposition

Seven originally-proposed projects were consolidated into **five** after a systems, primitives, and product-maturity review. One project absorbed two others; two were merged into a single economic layer.

| # | Survivor | Absorbs | Ships |
|---|---|---|---|
| **1** | **CommonGround** — structured deliberation + constitutional governance + liquid delegation | FlowState (now: delegation-graph visualization + cross-space federation as CG features), Co-Op OS *governance module* | **First.** [commonground-prd.md](commonground-prd.md) is mature and ready to spec. |
| **2** | **Kindred** — attestation-based credit ledger | original Kindred (care credits) + Co-Op OS *treasury* (surplus distribution) + Co-Op OS *reputation portability* | Second. PRD needs ~1–2 days of consolidation before spec. |
| **3** | **Equip** — physical-asset library | unchanged | Third or fourth (community demand drives the pick vs WikiForge). |
| **4** | **WikiForge** — open hardware design repo | unchanged | Third or fourth. |
| **5** | **Synapse** — democratic planning engine | unchanged | **Last.** Depends on real data from 1–4. |

**Dissolved:** Co-Op OS as a separate product. **Absorbed:** FlowState as a separate product.

---

## Why consolidate

### CommonGround absorbs FlowState + Co-Op OS governance

FlowState's signature features — topic-based delegation proxies, Git-like proposal versioning, a delegation graph visualization — are *already implicit in* CommonGround's liquid delegation + civic memory model. Making them visible and cross-space is a CommonGround *feature*, not a new product.

Co-Op OS's governance module (quadratic voting, steward selection) is CommonGround configured for worker-coop defaults. That's a governance profile (Phase 3 of the existing CG roadmap), not a new product.

### Kindred absorbs Co-Op OS treasury + reputation

All three describe attestation-based credit ledgers with different surfaces:
- **Time-banked care credits** (original Kindred)
- **Surplus distribution** (Co-Op OS treasury)
- **Portable 5-star reputation** (Co-Op OS reputation)

One primitive — mutually-attested credit — covers all three. Sybil-resistance and proof-of-personhood live here.

### Equip, WikiForge, Synapse stay separate

Each has a domain-specific primitive that doesn't collapse into the others:
- **Equip** — physical assets with IoT (resource + location + durability state).
- **WikiForge** — versioned design artifacts with repair-scorecard metadata.
- **Synapse** — multi-objective optimization over needs and ecological thresholds. Strictly downstream.

---

## Stack shape

```
                       ┌────────────────┐
                       │    Synapse     │  planning (last, depends on all below)
                       └───────┬────────┘
                               │ needs data from
          ┌────────────────────┼────────────────────┐
          │                    │                    │
  ┌───────▼──────┐     ┌───────▼──────┐     ┌───────▼──────┐
  │   Kindred    │     │    Equip     │     │  WikiForge   │
  │ credits/rep  │     │ asset library│     │ hardware repo│
  └───────┬──────┘     └───────┬──────┘     └───────┬──────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │ all depend on
                       ┌───────▼────────┐
                       │  CommonGround  │  governance primitive (first)
                       └────────────────┘
```

CommonGround is the foundation. Kindred, Equip, and WikiForge each attach to it via the governance primitive (Issues, Perspectives, Decision Records, liquid delegation). Synapse sits on top of all of them.

---

## Five primitives shared across the stack

Recognized during the `human-architect-mindset` pass:

1. **Identity** — a persistent, revocable, exportable sense of "who."
2. **Decision** — Issue + Perspective + Decision Record.
3. **Delegation** — visible, time-bounded, revocable capability transfer.
4. **Attestation** — mutually-signed claims (care given, surplus distributed, reputation earned).
5. **Resource Record** — a describable, trackable physical or informational thing.

Products compose these:
- CommonGround = Identity + Decision + Delegation
- Kindred = Identity + Attestation + Delegation
- Equip = Identity + Resource + Decision (for governance of the asset pool)
- WikiForge = Identity + Resource + Decision (for governance of the design graph)
- Synapse = Resource + Decision + Attestation across time

The primitives live in CommonGround's reference implementation; the other products consume them.

---

## Build order (summary)

1. **CommonGround v1** — 3–4 months per its existing roadmap. Spec ready today.
2. **Kindred v1** — after CommonGround phase 1 is real. Requires PRD consolidation first.
3. **Equip v1 OR WikiForge v1** — pick based on community signal; both need PRD refinement.
4. **Federation layer** — cross-space delegation (was FlowState) + cross-instance Kindred.
5. **Synapse** — last. Requires real usage data from all of the above.

---

## What this document supersedes

- `docs/resource_commons_prds.md` — retained as historical sketch. Its content is now reorganized under Kindred (#2), Equip (#3), WikiForge (#4).
- `docs/coordination_governance_prds.md` — retained as historical sketch. Its content is now reorganized under CommonGround (absorbed FlowState + Co-Op OS governance), Kindred (absorbed Co-Op OS treasury + reputation), Synapse (#5).

Both files are kept in-place so the `/docs/<slug>` routes continue to work, but this document is the operative frame going forward.

## What this document does NOT change

- `docs/commonground-prd.md` remains the authoritative PRD for CommonGround. It is unchanged by this consolidation.
- `docs/manifesto.md`, the constitutional documents, and all other architectural docs are unaffected.
