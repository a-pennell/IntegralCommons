# CommonGround Narrative Site — Design Spec

**Date:** 2026-04-19
**Status:** Approved (design phase); implementation plan to follow
**Owner:** ap@uxtheory.co

---

## 1. Purpose

Turn the ICOS / CommonGround documents — currently a set of ~20 markdown specs in `/docs` — into a single-page, scroll-driven narrative website. The site serves as the public invitation to the project: it makes the manifesto land, introduces ICOS as the substrate, and routes researchers and builders to the canonical source documents.

This is the **v1 marketing narrative**. It is explicitly *not* the MVP application (proposal / deliberation / voting), which is a separate, later project.

## 2. Audience

Hybrid, with a primary / secondary split:

| Tier | Audience | What they should leave with |
|---|---|---|
| Primary | Potential collaborators and co-founders | "I understand what this is, I want to be part of it, here is how to reach you." |
| Primary | General curious public (literate, non-expert) | "This is a serious, humane take on collective governance. I could read more." |
| Secondary | Academics / researchers (governance, commons, integral theory) | "The source documents are here, cleanly presented, linkable, citable." |
| Secondary | Builders / developers | "The architecture is coherent and forkable. Repo and protocol docs are reachable." |

Tone for primary audiences: **invitational, accessible, emotive-but-restrained**. Secondary audiences are served by sub-pages, not by distorting the narrative.

## 3. Naming

- **CommonGround** is the public-facing brand. Hero, URL, headline, most body copy.
- **ICOS (Integral Commons OS)** is introduced explicitly mid-scroll as the substrate — the operating system that enables CommonGround.
- Pivot line (new copy in §06): *"The operating system for these commitments is called ICOS."*

Rationale: the docs already lean this way (12 `commonground-*.md` files vs 2 `ICOS_*.md` files); "CommonGround" is warmer and self-explanatory for primary audiences; "ICOS" still lands for secondary audiences when it appears.

## 4. Narrative structure

**Three-act arc**: Diagnosis → Commitments → Architecture. Nine scenes on a single scroll.

| # | Act | Scene | Source copy |
|---|---|---|---|
| 00 | — | **Opening plate** — "CommonGround" wordmark + single line | new copy |
| 01 | I. Diagnosis | **§01 Premise** — the four "we believe" lines | `docs/manifesto.md` stanza 1 |
| 02 | I. Diagnosis | **§02 Rejection** — extractive / opaque / irreversible | `docs/manifesto.md` stanza 2 |
| 03 | II. Commitments | **§03 Affirmations** — stewardship, revocability, transparency, plurality | `docs/manifesto.md` stanza 3 |
| 04 | II. Commitments | **§04 Commitments** — "we commit to building systems that…" | `docs/manifesto.md` stanza 4 |
| 05 | II. Commitments | **§05 Understanding** — closing couplet | `docs/manifesto.md` stanza 5 |
| 06 | III. Architecture | **§06 The Substrate** — pivot into ICOS | new transitional copy + `docs/README.md` |
| 07 | III. Architecture | **§07 Five Layers** — personal → relational → collective → ecological → AI | `docs/ICOS_Overview.md` |
| 08 | III. Architecture | **§08 Design Goal** — adaptive, participatory, resistant to capture, developmentally supportive | `docs/ICOS_Overview.md` tail |
| 09 | — | **§09 Invitation** — closing plate, two CTAs (read constitution / build with us) | new copy |

**Two animation anchors**: §01 (manifesto type reveal) and §07 (five-layers stack-build). All other scenes use the baseline scroll reveal.

## 5. Visual system

### Typography
- **Display / headings:** Source Serif 4 (variable), Display opticals for large sizes, SmText for body.
- **Body:** Source Serif 4 SmText, 18–20px, line-height 1.65, measure ~68ch.
- **Metadata / labels / section numbers:** IBM Plex Mono, 11px, uppercase, tracked +0.15em.
- No sans-serif UI font. Monospace handles all system chrome.

### Palette
```
--paper:  #FAFAF7   /* warm off-white background */
--ink:    #1A1A1A   /* body text */
--rule:   #D9D6CE   /* hairlines, section dividers */
--muted:  #6B6B66   /* metadata, subtitles */
--accent: #B8341F   /* used only on §02 rejection plates and pull-quotes */
```
Body-text contrast vs `--paper` is ≥ 7:1. Accent color is used scarcely and intentionally.

### Grid
- 12-col, 1200px max-width, 32px gutter.
- Body copy in cols 4–9 (center 6-col measure).
- Section numbers (§01, §02…) hang in cols 1–3 as mono margin notes.
- Pull quotes break into cols 2–11.

### Ornament
- Hairline rules (0.5px, `--rule`) mark act transitions.
- Single repeating ornament: thin horizontal rule with filled dot center — appears ~4 times.
- No shadows, no rounded corners on content, no gradients.

### Motion baseline
- **Smooth scroll:** Lenis, no snap.
- **Scroll reveal** (default for all text blocks): `opacity 0→1` + `translateY(12px → 0)`, 800ms, `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Reduced motion:** transforms dropped, opacity only. Pinned anchors unpin and render static.

## 6. Animation anchors

### Anchor A — §01 Manifesto Type Reveal
- Section pinned ~250vh.
- Four lines stack vertically, center 6-col measure, Display serif ~44px.
- Each line reveals sequentially: `opacity 0→1`, `filter: blur(6px → 0)`, `translateY(16px → 0)`.
- Previously-revealed lines persist; stanza accumulates.
- Final 0.1 of progress: whole stanza lifts `translateY(0 → -24px)`; section number fades.
- **Reduced-motion:** static layout, no pin, no blur.

### Anchor B — §07 Five Layers Stack-Build
- Section pinned ~500vh.
- Viewport split 40/60: sticky caption left (layer name + one-line description from `ICOS_Overview.md`); stack right.
- Each layer is an 80px horizontal band with mono label (`L1 · PERSONAL`), italic Latin tag (`self-awareness`), and a hairline illustration motif (spiral / paired circles / hexagonal grid / branching form / constellation dots).
- Progress 0.0–0.2: L1 drops in, settles; caption swaps (200ms crossfade); hairline rule travels full width.
- Progress 0.2–0.4, 0.4–0.6, 0.6–0.8, 0.8–1.0: L2–L5 in turn.
- At 1.0: footer line *"Five layers. One substrate. ICOS."*
- **Reduced-motion:** all five layers rendered static, no pin, usable as a plain diagram.

## 7. Routes and content model

| Path | Purpose | Treatment |
|---|---|---|
| `/` | Narrative scroll (all 9 scenes) | Scrollytelling — Lenis, ScrollTrigger, anchors A and B |
| `/constitution` | Full `commonground-constitution-v3.md` | Article page, shared editorial type system |
| `/covenant` | Full `commonground-covenant.md` | Article page |
| `/protocol` | Full `commonground-protocol.md` | Article page |
| `/overview` | `ICOS_Overview.md` + static SVG of the five-layer diagram | Article page + diagram |
| `/manifesto` | Plain-text manifesto | Article page |
| `/docs` | Index of all source documents (including whitepaper, academic papers) | List page |

All long-form text lives in `docs/` (canonical). The site reads `docs/` directly via an Astro content collection — **no duplication**. Editing `docs/manifesto.md` updates the site on the next build.

Narrative scenes are Astro components that import the relevant stanzas from the source markdown. Sub-pages render the full source verbatim with the shared editorial type system.

Inline footnotes use standard HTML anchors (`<a href="/constitution#section-id">`) — no JS required.

## 8. Tech stack

| Concern | Choice |
|---|---|
| Framework | Astro 5, static output (`output: 'static'`) |
| Language | TypeScript (strict) |
| UI framework | **None** — Astro components only |
| Content | Astro content collections pointing at `../docs` |
| Animation | GSAP + ScrollTrigger |
| Smooth scroll | Lenis |
| Markdown | Astro MDX (built-in) |
| Fonts | Self-hosted Source Serif 4 + IBM Plex Mono, preloaded |
| Deploy | Cloudflare Pages (primary), Vercel (fallback) |
| Analytics | None in v1 |

## 9. File layout

```
ICOS/
├── docs/                               # canonical source, untouched
├── site/
│   ├── astro.config.mjs
│   ├── package.json
│   ├── public/
│   │   └── fonts/
│   ├── src/
│   │   ├── content/
│   │   │   └── config.ts               # collection pointing to ../docs
│   │   ├── layouts/
│   │   │   ├── Narrative.astro
│   │   │   └── Article.astro
│   │   ├── components/
│   │   │   ├── scenes/
│   │   │   │   ├── Scene00Opening.astro
│   │   │   │   ├── Scene01Premise.astro      # Anchor A
│   │   │   │   ├── Scene02Rejection.astro
│   │   │   │   ├── Scene03Affirmations.astro
│   │   │   │   ├── Scene04Commitments.astro
│   │   │   │   ├── Scene05Understanding.astro
│   │   │   │   ├── Scene06Substrate.astro
│   │   │   │   ├── Scene07Layers.astro       # Anchor B
│   │   │   │   ├── Scene08DesignGoal.astro
│   │   │   │   └── Scene09Invitation.astro
│   │   │   ├── LayerDiagram.astro            # shared by Scene07 and /overview
│   │   │   ├── SectionNumber.astro
│   │   │   └── Footnote.astro
│   │   ├── lib/
│   │   │   ├── scroll.ts                     # Lenis + ScrollTrigger, reduced-motion
│   │   │   └── anchors/
│   │   │       ├── premise.ts                # Anchor A
│   │   │       └── layers.ts                 # Anchor B
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   └── global.css
│   │   └── pages/
│   │       ├── index.astro
│   │       ├── constitution.astro
│   │       ├── covenant.astro
│   │       ├── protocol.astro
│   │       ├── overview.astro
│   │       ├── manifesto.astro
│   │       └── docs.astro
│   └── tsconfig.json
```

## 10. Performance and accessibility budgets

- Lighthouse Performance ≥ 95 on Moto G Power throttle, for `/` and all sub-pages.
- `/` JS bundle ≤ 60KB gzipped (GSAP core + ScrollTrigger + Lenis ≈ 45KB + scene wiring).
- Sub-pages JS ≤ 10KB gzipped (Lenis only; no GSAP).
- WCAG 2.2 AA minimum.
- `prefers-reduced-motion` fully respected — both anchors have static fallbacks.
- Keyboard navigable, visible focus outlines preserved.
- H1–H2–H3 outline is a valid document outline per scene.
- Body-text contrast ≥ 7:1 on `--paper`.

## 11. Success criteria

v1 ships when:
1. All 9 scenes render on `/` with copy sourced live from `docs/`.
2. Anchors A and B function as specified in recent Chrome, Safari, Firefox (current – 2).
3. Reduced-motion paths verified manually.
4. All 7 sub-pages render `docs/` markdown with correct typography.
5. Lighthouse Performance ≥ 95 on `/` (mobile throttle).
6. Deployed to Cloudflare Pages at a chosen domain.
7. No console errors on any route.

## 12. Out of scope for v1

- Dark mode.
- Any interactive governance demo (proposal / deliberation / voting / federation map). Belongs in the MVP app.
- CMS integration.
- Internationalization (English only at launch).
- Blog / news section.
- Site search.
- Anchors C (governance loop), D (revocability interaction), E (federation topology), F ("we reject" wall) — deferred to a v2 pass.

## 13. Open questions (defer to implementation)

- Final domain. Placeholder `site.url` in `astro.config` until chosen.
- GitHub repo link target for the §09 "build with us" CTA — assumed to be `https://github.com/<owner>/ICOS` but the owner is not yet specified.
- Whether `/covenant` is still current or superseded by `commonground-constitution-v3.md`. If superseded, drop the route and remove from `/docs` index.

These are content / decision items, not blockers for building the scaffolding. The implementation plan will surface them as "decide before launch" tasks.
