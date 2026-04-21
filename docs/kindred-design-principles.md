# Kindred — Design Principles (Anti-Social-Credit)

**Version:** 1.0
**Date:** 2026-04-20
**Status:** Binding. Any future Kindred PRD, spec, or implementation must comply. These principles also constrain related surfaces across the CommonGround ecosystem (see §6).

---

## 1. Why these principles exist

The original Kindred sketch and the absorbed pieces of Co-Op OS describe a "Care Economy ledger" that tracks contributions, issues credits, supports portable 5-star reputation, and lets members redeem credits for "premium community assets" or use them as *"social proof to access leadership roles."*

**That combination is a social credit system.** Tallying contributions + converting them into a quantitative score + using the score to gate access to assets or authority is the exact architecture of systems like China's Sesame Credit. It is inconsistent with CommonGround's constitutional framework (Principles 2, 10) and with the stated values of the manifesto ("stewardship over ownership," "revocability of power," "plurality of perspectives").

These principles exist to make that mistake structurally impossible.

---

## 2. Philosophical grounding

Two thinkers inform this direction. Neither is required reading to implement Kindred, but the constraints below are derived from their claims.

**Charles Eisenstein, *Sacred Economics*.** A gift economy runs on gratitude and circulation, not on tallying. Money that can be hoarded creates hierarchies of stored value. Demurrage (currency that slowly expires) keeps gifts in motion and prevents accumulation-as-status. Quantified human worth is the pathology to avoid, not the goal to achieve.

**Lewis Hyde, *The Gift*.** The opposite of a gift is not a refusal — it's a commodity. When you commodify a gift, you destroy the relationship it was building. Gifts must keep moving; the moment they settle into stock, they become something else. You cannot buy your way into a gift-economy relationship, and you cannot earn reputation within one by trading.

The common thread: **visible recognition of contribution is healthy; quantitative ranking of persons is corrosive.**

---

## 3. Design constraints (binding)

### 3.1 Record, do not rank

Kindred **MAY** record that a specific act of care, gift, or contribution occurred — who gave, who received, what was given, when.

Kindred **MUST NOT** aggregate those records into a single score, level, tier, rating, rank, or ordinal position for any person.

Records are receipts of events. They are never tallied into a person.

### 3.2 No gating by balance

No CommonGround-ecosystem feature — not asset access in Equip, not leadership in CommonGround, not treasury distributions in the Kindred economic layer, not anything — **MAY** be conditioned on a member's Kindred balance, contribution count, or contribution history.

Access rules must reference membership (you are or are not in this space), consent (you have or have not been delegated this capability via CommonGround's process), or explicit per-item policy (this tool requires training; this shared kitchen requires a current coop-member signature). They **MUST NOT** reference "how much someone has given."

### 3.3 Authority is never purchased with credits

Leadership, stewardship, and facilitation roles in CommonGround are delegated through the constitutional process (transparent consent, time-bounded, revocable). These roles **MUST NOT** be gated, weighted, or influenced by a member's Kindred activity.

If someone wants to lead, they stand for delegation under CommonGround's existing rules. Their history of contribution may be visible context — but it is not a credential, not a threshold, and not a tiebreaker in the code.

### 3.4 Portable records, not portable ratings

A member **MAY** export a record of what they have given (and what others have attested to having received from them) and present it at a new space. This is a history of action.

A member **MUST NOT** be issued a portable rating, star, score, or tier that travels between spaces as a trust credential. "Jane is a verified 4.8-star caregiver" is the thing we are refusing to build.

### 3.5 Demurrage — credits expire

Any credit or token Kindred issues **MUST** have a finite validity window. A reasonable default is 12 months; spaces may configure shorter, never longer-than-indefinite.

Expired credits are not debts and are not deducted from anything. They simply stop appearing in the active ledger. Records of the underlying gift remain for historical reference.

This prevents accumulation-as-status.

### 3.6 Voluntary visibility

Participation in the Kindred ledger **MUST** be opt-in, per-member and per-act. A gift given off-ledger is still a gift. The ledger is a tool for making care legible when the parties wish it — not a compliance system for counting.

A member **MAY** at any time request that their ledger entries be redacted, summarized, or removed (subject to the other attester's right to preserve their own attestation as a record of what they did).

### 3.7 Flow over stock

Kindred's default UI surfaces **MUST** emphasize the circulation of gifts — who is giving what to whom right now, what is needed, what is in motion — rather than balances, totals, histories, or accumulations.

Personal totals **MAY** be visible to oneself. They **MUST NOT** be the primary public representation of a person.

### 3.8 No comparison features

Kindred **MUST NOT** include leaderboards, "most generous" lists, badges tied to cumulative activity, streaks, achievements, member-of-the-month surfacing, or any other mechanic whose purpose is inter-member comparison.

Comparison mechanics turn a gift economy into a game, which Hyde and Eisenstein both identify as the moment the gift dies.

### 3.9 No secondary market

Kindred credits **MUST NOT** be exchangeable for money, cryptocurrency, or tradeable assets. They may be used to mark further gifts within the ledger's domain (e.g., to initiate a matched request), but they have no liquid market.

A ledger whose credits are not tradeable cannot become a currency. That is the intent.

### 3.10 Attestation requires both sides

The existing sketch correctly specifies mutual attestation (giver + receiver, or giver + witness). This **MUST** be preserved. Unilateral self-reporting of contribution is not accepted.

Mutual attestation keeps the gift relational. Unilateral reporting turns it into self-branding.

---

## 4. What is still permitted

These principles are constraints on ranking and gating — not on recognition or memory.

- **Visible thank-yous**, gift circles, or public acknowledgments initiated by the receiver are permitted.
- **Matched-giving** (someone says "I need help with X" → someone responds with an offer) is permitted and encouraged.
- **Topical tags** on records ("childcare", "moving help", "meal train") are permitted.
- **Individual pattern reflection** ("here's what you have given this year, privately, for your own reflection") is permitted.
- **Collective pattern visibility** ("this space has circulated 340 care-hours in the last quarter") is permitted.
- **Gift-economy event coordination** (skill-shares, repair cafés, care rotations) is permitted.
- **Identity verification** via CommonGround's standard authentication is permitted and necessary for attestation to mean anything.

---

## 5. What this changes in the existing sketches

### `docs/resource_commons_prds.md §6 "Kindred"` — revise before spec

- The "Flourishing Floor" concept as currently written ("credits can be redeemed for 'premium' community assets or used as social proof to access leadership roles") **is retracted**. Credits do not redeem for assets. Credits do not confer leadership access.
- "Time-Banking: 1 hour of care = 1 credit" may remain as an accounting convenience within a single space. It does not travel between spaces as a portable rating.
- "Mutual Attestation" is kept and reinforced (see §3.10 above).
- The entire premise of "quantifying social contributions" needs softer framing: Kindred records gifts; it does not *quantify contributors*.

### `docs/coordination_governance_prds.md §3 "Co-Op OS"` — absorbed elements revised

- The "Reputation Portability" feature ("bring their 5-star rating from one coop to another") **is retracted** in its rating form. Portable records of completed work are fine; portable scores are not.
- The "Automated Treasury" feature (smart-contract surplus distribution) is retained. Payout logic is not a social credit system; it's coop accounting. But the distribution rule **MUST NOT** reference Kindred balances.

### `docs/commonground-ecosystem-overview.md` — description updated

Kindred's one-line description was "Attestation-based credit ledger." It should now read: **"Attestation-based gift ledger. Records circulation of care and contribution; does not rank persons."** Update the overview to reflect this and to link here.

---

## 6. Implications for other ecosystem products

### CommonGround

Already aligned. Liquid delegation is capability-based and explicitly revocable (Principles 2, 10). Nothing in the existing PRD creates a per-person score. No changes needed beyond: any future integration between CommonGround and Kindred **MUST NOT** allow Kindred activity to weight decisions, gate referenda, or influence delegation acceptance.

### Equip

Wear and durability tracking in Equip is on **items**, not users. A drill's use-hours and condition notes are about the drill. They **MUST NOT** be aggregated into a per-member "responsibility score" or "trust level." If specific members have repeatedly broken items, that's handled through CommonGround's deliberation process (an Issue about access rules for that item class) — not through an automatic member-level score.

The "Community Insurance Fund" feature should be revisited: micro-contributions per borrow are fine; conditioning future access on accumulated contributions is not.

### WikiForge

Right-to-Repair scorecards rate **designs**, not designers. This is already aligned. No changes needed.

### Synapse

Synapse aggregates household-level need declarations into production plans. It **MUST NOT** retain or surface per-household consumption histories in a way that creates a "responsible consumer" score. The ZKP/aggregate-only design already flagged in the sketch protects against this; reinforce it in the eventual Synapse PRD.

---

## 7. Enforcement

These principles are enforced by three mechanisms, listed in order of strength:

1. **Architectural:** Kindred's data model does not compute or persist per-person aggregate scores. If a score cannot be computed, it cannot be used. (This is the strongest protection — design the data such that the feature is impossible, not merely forbidden.)
2. **Constitutional:** Any CommonGround space integrating Kindred inherits these principles as part of its Participation Integrity (Principle 9) and Commons Protection (Principle 10) obligations. A space attempting to add scoring mechanics violates its own governance framework.
3. **Editorial:** The public narrative site, the manifesto, and ecosystem overview documents all commit publicly to these principles. Breaking them would require openly retracting a public commitment — not merely changing code.

---

## References

- Charles Eisenstein, *Sacred Economics: Money, Gift, and Society in the Age of Transition* (2011).
- Lewis Hyde, *The Gift: Imagination and the Erotic Life of Property* (1983).
- CommonGround Constitutional Framework v3 — Principles 2 (Revocability), 9 (Participation Integrity), 10 (Commons Protection).
- `docs/manifesto.md` — the "we reject" clauses of Extractive platforms, Opaque governance, Irreversible power.
