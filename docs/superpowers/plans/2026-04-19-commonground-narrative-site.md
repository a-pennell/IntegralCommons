# CommonGround Narrative Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, scroll-driven narrative website for CommonGround / ICOS — a three-act essay (Diagnosis → Commitments → Architecture) rendered from the source `.md` docs, with two animation anchors and six long-form sub-pages for secondary audiences.

**Architecture:** Astro 5 static site in `site/` sibling of `docs/`. Content collections read `docs/` directly — no copy. Each scene is an Astro component importing its source stanza. Lenis handles smooth scroll, GSAP ScrollTrigger handles pinned anchors. Zero runtime UI framework. Deploy to Cloudflare Pages.

**Tech Stack:** Astro 5, TypeScript (strict), GSAP + ScrollTrigger, Lenis, Vitest (for `lib/` utilities), Playwright (smoke tests), self-hosted Source Serif 4 + IBM Plex Mono.

**Spec:** [docs/superpowers/specs/2026-04-19-commonground-narrative-site-design.md](../specs/2026-04-19-commonground-narrative-site-design.md)

---

## File structure

Files created / modified, grouped by responsibility.

### Repo root
- `.gitignore` — ignore `site/node_modules`, `site/dist`, `site/.astro`, `.superpowers/`
- (optional) `site/README.md` — how to run locally

### Site scaffolding (`site/`)
- `site/package.json`, `site/astro.config.mjs`, `site/tsconfig.json`

### Styles (`site/src/styles/`)
- `tokens.css` — design tokens (palette, type, grid)
- `global.css` — resets, body defaults, typography rules

### Content (`site/src/content/`)
- `config.ts` — content collection pointing at `../../docs`

### Layouts (`site/src/layouts/`)
- `Narrative.astro` — shell for `/`
- `Article.astro` — shell for all sub-pages

### Components (`site/src/components/`)
- `SectionNumber.astro` — hanging mono section number (`§01`)
- `Footnote.astro` — inline footnote link
- `LayerDiagram.astro` — static SVG of the five ICOS layers (reused on `/overview`)
- `scenes/Scene00Opening.astro` through `scenes/Scene09Invitation.astro` — nine scene components

### Library (`site/src/lib/`)
- `scroll.ts` — Lenis init, ScrollTrigger wiring, reduced-motion detection
- `anchors/premise.ts` — Anchor A choreography (§01)
- `anchors/layers.ts` — Anchor B choreography (§07)

### Pages (`site/src/pages/`)
- `index.astro`, `constitution.astro`, `covenant.astro`, `protocol.astro`, `overview.astro`, `manifesto.astro`, `docs.astro`

### Tests
- `site/tests/unit/` (Vitest) — `lib/` pure functions
- `site/tests/smoke/` (Playwright) — key pages load, reduced-motion works

### Fonts
- `site/public/fonts/SourceSerif4-Variable.woff2` (Roman variable — covers both display and body)
- `site/public/fonts/IBMPlexMono-Regular.woff2`

### Deploy
- `site/wrangler.toml` — Cloudflare Pages config (minimal)

---

## Task 1: Initialize git, scaffold Astro, verify build

**Files:**
- Create: `.gitignore`
- Create: `site/` (via Astro scaffolder)
- Modify: `site/package.json`

- [ ] **Step 1: Initialize git and write `.gitignore` before the first commit**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS
git init -b main
```

Create `/Users/andrewpennell/Projects/ICOS/.gitignore`:
```
# site
site/node_modules/
site/dist/
site/.astro/
site/.wrangler/

# brainstorming
.superpowers/

# os
.DS_Store
```

- [ ] **Step 2: First commit (existing docs + spec + plan, without brainstorm dir)**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS
git add .gitignore docs/ README.md
git commit -m "chore: existing docs snapshot before site build"
```
Expected: initial commit created; `.superpowers/` is not included. Verify with `git ls-files | grep -c superpowers` → 0.

- [ ] **Step 3: Create and check out the feature branch**

Run:
```bash
git checkout -b site/narrative-v1
```
All subsequent work happens on this branch.

- [ ] **Step 4: Scaffold Astro project into `site/`**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS
npm create astro@latest site -- --template minimal --typescript strict --no-install --no-git --yes
cd site
npm install
```
Expected: `site/` populated with Astro minimal template, `node_modules/` installed.

- [ ] **Step 5: Verify the scaffold builds and serves**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run build
```
Expected: `dist/` produced, no errors.

Run:
```bash
npm run dev
```
Expected: dev server listening on `http://localhost:4321`. Stop with Ctrl-C.

- [ ] **Step 6: Commit the scaffold**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/
git commit -m "chore: scaffold Astro site"
```

---

## Task 2: Install runtime + dev dependencies

**Files:**
- Modify: `site/package.json`

- [ ] **Step 1: Install runtime deps**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm install gsap@^3.12 lenis@^1.1
```
Expected: `gsap` and `lenis` added to `dependencies` in `package.json`.

- [ ] **Step 2: Install dev deps (testing, types)**

Run:
```bash
npm install -D vitest@^2 @vitest/ui@^2 happy-dom@^15 @playwright/test@^1.47
npx playwright install chromium
```
Expected: `vitest`, `happy-dom`, `@playwright/test` in `devDependencies`; Chromium downloaded.

- [ ] **Step 3: Add test scripts to `site/package.json`**

Modify the `"scripts"` block in `site/package.json` to include:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:smoke": "playwright test"
  }
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/package.json site/package-lock.json
git commit -m "chore: add gsap, lenis, vitest, playwright"
```

---

## Task 3: Add self-hosted fonts

**Note (post-execution):** Adobe's Source Serif 4 variable WOFF2 release only ships the Roman optical (no SmText variable exists). We use the single variable family for both display and body. The SmText declaration was removed from fonts.css accordingly.

**Files:**
- Create: `site/public/fonts/SourceSerif4-Variable.woff2`
- Create: `site/public/fonts/IBMPlexMono-Regular.woff2`
- Create: `site/src/styles/fonts.css`

- [ ] **Step 1: Download Source Serif 4 variable fonts**

Source Serif 4 is open-source (OFL-1.1). Download the two variable files from the Adobe Fonts GitHub:
```bash
cd /Users/andrewpennell/Projects/ICOS/site/public/fonts
curl -L -o SourceSerif4-Variable.woff2 \
  https://github.com/adobe-fonts/source-serif/raw/release/WOFF2/variable-ttf/SourceSerif4-Roman-VF.ttf.woff2
curl -L -o SourceSerif4-SmText-Variable.woff2 \
  https://github.com/adobe-fonts/source-serif/raw/release/WOFF2/variable-ttf/SourceSerif4SmText-Roman-VF.ttf.woff2
```
Expected: both `.woff2` files present in `public/fonts/`. If either URL fails, fall back to downloading the static TTFs and converting via `fonttools`.

- [ ] **Step 2: Download IBM Plex Mono Regular**

IBM Plex is open-source (OFL-1.1).
```bash
cd /Users/andrewpennell/Projects/ICOS/site/public/fonts
curl -L -o IBMPlexMono-Regular.woff2 \
  https://github.com/IBM/plex/raw/master/packages/plex-mono/fonts/complete/woff2/IBMPlexMono-Regular.woff2
```

- [ ] **Step 3: Write `site/src/styles/fonts.css`**

```css
/* Source Serif 4 — display + body (variable) */
@font-face {
  font-family: 'Source Serif 4';
  src: url('/fonts/SourceSerif4-Variable.woff2') format('woff2-variations');
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Source Serif 4 SmText';
  src: url('/fonts/SourceSerif4-SmText-Variable.woff2') format('woff2-variations');
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

/* IBM Plex Mono — labels */
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('/fonts/IBMPlexMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/public/fonts site/src/styles/fonts.css
git commit -m "feat(site): add self-hosted fonts (Source Serif 4, IBM Plex Mono)"
```

---

## Task 4: Design tokens and global styles

**Files:**
- Create: `site/src/styles/tokens.css`
- Create: `site/src/styles/global.css`

- [ ] **Step 1: Write `site/src/styles/tokens.css`**

```css
:root {
  /* palette */
  --paper: #FAFAF7;
  --ink: #1A1A1A;
  --rule: #D9D6CE;
  --muted: #6B6B66;
  --accent: #B8341F;

  /* type */
  /* Note: Source Serif 4 SmText optical is not available as a variable WOFF2,
     so we use the single variable Source Serif 4 family for both display and body. */
  --font-display: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  --font-body: 'Source Serif 4', Georgia, 'Times New Roman', serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* type scale */
  --fs-body: 19px;
  --fs-body-lh: 1.65;
  --fs-label: 11px;
  --fs-label-tracking: 0.15em;
  --fs-h2: 44px;
  --fs-h3: 28px;

  /* layout */
  --content-max: 1200px;
  --gutter: 32px;

  /* motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --reveal-ms: 800ms;
}
```

- [ ] **Step 2: Write `site/src/styles/global.css`**

```css
@import './fonts.css';
@import './tokens.css';

*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: var(--fs-body-lh);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0;
}

a {
  color: var(--ink);
  text-decoration-color: var(--rule);
  text-underline-offset: 3px;
}
a:hover { text-decoration-color: var(--ink); }

.label {
  font-family: var(--font-mono);
  font-size: var(--fs-label);
  letter-spacing: var(--fs-label-tracking);
  text-transform: uppercase;
  color: var(--muted);
}

.measure { max-width: 68ch; }

hr.rule {
  border: 0;
  border-top: 0.5px solid var(--rule);
  margin: 64px auto;
}

.ornament {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 64px auto;
  color: var(--rule);
}
.ornament::before, .ornament::after {
  content: '';
  flex: 0 0 80px;
  height: 0.5px;
  background: currentColor;
}
.ornament::after { /* symmetric */ }
.ornament .dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--muted);
}

/* reduced motion — global escape hatch */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/styles
git commit -m "feat(site): design tokens and global styles"
```

---

## Task 5: Content collection pointing at `../docs`

**Files:**
- Create: `site/src/content/config.ts`
- Modify: `site/astro.config.mjs`

- [ ] **Step 1: Configure Astro content collection**

Create `site/src/content/config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const docsDir = path.resolve(fileURLToPath(import.meta.url), '../../../../docs');

export const collections = {
  source: defineCollection({
    loader: glob({ pattern: '**/*.md', base: docsDir }),
    schema: z.object({
      title: z.string().optional(),
    }),
  }),
};
```

- [ ] **Step 2: Enable content collections in Astro config**

Replace contents of `site/astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://commonground.page',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
});
```

- [ ] **Step 3: Verify the loader reads `docs/`**

Write a temporary verification page `site/src/pages/_debug-content.astro`:
```astro
---
import { getCollection } from 'astro:content';
const entries = await getCollection('source');
---
<html><body>
<ul>
  {entries.map(e => <li>{e.id} — {e.body?.length ?? 0} chars</li>)}
</ul>
</body></html>
```

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run dev
```
Open `http://localhost:4321/_debug-content`. Expected: all `.md` files from `docs/` listed with non-zero char counts (manifesto.md, ICOS_Overview.md, all 12 commonground-*.md files, etc.). Stop dev server.

- [ ] **Step 4: Remove the debug page**

```bash
rm /Users/andrewpennell/Projects/ICOS/site/src/pages/_debug-content.astro
```

- [ ] **Step 5: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/content site/astro.config.mjs
git commit -m "feat(site): content collection reading docs/ directly"
```

---

## Task 6: `Article` layout for long-form sub-pages

**Files:**
- Create: `site/src/layouts/Article.astro`

- [ ] **Step 1: Write the layout**

```astro
---
interface Props {
  title: string;
  sectionLabel?: string;
}
const { title, sectionLabel } = Astro.props;
import '../styles/global.css';
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title} — CommonGround</title>
  <link rel="preload" href="/fonts/SourceSerif4-Variable.woff2" as="font" type="font/woff2" crossorigin />
</head>
<body>
  <header class="site-header">
    <a class="wordmark" href="/">CommonGround</a>
    <nav class="site-nav label">
      <a href="/manifesto">Manifesto</a>
      <a href="/constitution">Constitution</a>
      <a href="/protocol">Protocol</a>
      <a href="/overview">Overview</a>
      <a href="/docs">Docs</a>
    </nav>
  </header>

  <main class="article">
    <div class="article-head">
      {sectionLabel && <p class="label">{sectionLabel}</p>}
      <h1>{title}</h1>
    </div>
    <article class="article-body measure">
      <slot />
    </article>
  </main>

  <footer class="site-footer label">
    <span>CommonGround · built on ICOS</span>
    <a href="/docs">All source documents</a>
  </footer>
</body>
</html>

<style is:global>
  .site-header {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 24px 48px;
    border-bottom: 0.5px solid var(--rule);
  }
  .wordmark {
    font-family: var(--font-display); font-size: 20px;
    text-decoration: none; font-weight: 500;
  }
  .site-nav { display: flex; gap: 24px; }
  .site-nav a { text-decoration: none; color: var(--muted); }
  .site-nav a:hover { color: var(--ink); }

  .article {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 120px 48px;
  }
  .article-head { margin-bottom: 80px; }
  .article-head .label { margin-bottom: 12px; }
  .article-head h1 {
    font-size: clamp(40px, 6vw, 72px);
    line-height: 1.08;
    max-width: 18ch;
  }
  .article-body { margin: 0 auto; }
  .article-body h2 { font-size: var(--fs-h2); margin: 64px 0 16px; }
  .article-body h3 { font-size: var(--fs-h3); margin: 40px 0 12px; }
  .article-body p { margin: 0 0 24px; }
  .article-body ul, .article-body ol { padding-left: 24px; margin: 0 0 24px; }
  .article-body li { margin-bottom: 6px; }
  .article-body blockquote {
    margin: 32px 0; padding-left: 24px;
    border-left: 2px solid var(--accent);
    font-style: italic; color: var(--ink);
  }
  .article-body code {
    font-family: var(--font-mono); font-size: 0.9em;
    background: #f0ece4; padding: 1px 6px; border-radius: 2px;
  }
  .article-body pre {
    font-family: var(--font-mono); font-size: 14px;
    background: #f0ece4; padding: 16px 20px; border-radius: 4px;
    overflow-x: auto;
  }
  .article-body pre code { background: none; padding: 0; }

  .site-footer {
    display: flex; justify-content: space-between;
    padding: 40px 48px;
    border-top: 0.5px solid var(--rule);
    color: var(--muted);
  }
  .site-footer a { color: var(--muted); text-decoration-color: var(--rule); }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/layouts
git commit -m "feat(site): Article layout for sub-pages"
```

---

## Task 7: Sub-pages — manifesto, constitution, covenant, protocol, overview

**Files:**
- Create: `site/src/pages/manifesto.astro`
- Create: `site/src/pages/constitution.astro`
- Create: `site/src/pages/covenant.astro`
- Create: `site/src/pages/protocol.astro`
- Create: `site/src/pages/overview.astro`

Each sub-page renders its canonical source `.md` via the content collection, using `Article.astro`.

- [ ] **Step 1: Write `site/src/pages/manifesto.astro`**

```astro
---
import { getEntry, render } from 'astro:content';
import Article from '../layouts/Article.astro';
const entry = await getEntry('source', 'manifesto');
if (!entry) throw new Error('manifesto.md not found in docs/');
const { Content } = await render(entry);
---
<Article title="Manifesto" sectionLabel="§ Canonical text">
  <Content />
</Article>
```

- [ ] **Step 2: Write `site/src/pages/constitution.astro`**

```astro
---
import { getEntry, render } from 'astro:content';
import Article from '../layouts/Article.astro';
const entry = await getEntry('source', 'commonground-constitution-v3');
if (!entry) throw new Error('commonground-constitution-v3.md not found');
const { Content } = await render(entry);
---
<Article title="Constitution" sectionLabel="§ v3 · Canonical text">
  <Content />
</Article>
```

- [ ] **Step 3: Write `site/src/pages/covenant.astro`**

```astro
---
import { getEntry, render } from 'astro:content';
import Article from '../layouts/Article.astro';
const entry = await getEntry('source', 'commonground-covenant');
if (!entry) throw new Error('commonground-covenant.md not found');
const { Content } = await render(entry);
---
<Article title="Covenant" sectionLabel="§ Canonical text">
  <Content />
</Article>
```

- [ ] **Step 4: Write `site/src/pages/protocol.astro`**

```astro
---
import { getEntry, render } from 'astro:content';
import Article from '../layouts/Article.astro';
const entry = await getEntry('source', 'commonground-protocol');
if (!entry) throw new Error('commonground-protocol.md not found');
const { Content } = await render(entry);
---
<Article title="Protocol" sectionLabel="§ Canonical text">
  <Content />
</Article>
```

- [ ] **Step 5: Write `site/src/pages/overview.astro` (diagram added later in Task 12)**

Note: Astro 6's glob loader lowercases IDs, so `ICOS_Overview.md` → id `icos_overview`.

```astro
---
import { getEntry, render } from 'astro:content';
import Article from '../layouts/Article.astro';
const entry = await getEntry('source', 'icos_overview');
if (!entry) throw new Error('icos_overview (ICOS_Overview.md) not found');
const { Content } = await render(entry);
---
<Article title="ICOS Overview" sectionLabel="§ Integral Commons OS">
  <Content />
</Article>
```

- [ ] **Step 6: Verify each page renders**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run dev
```
Open each URL in turn:
- `http://localhost:4321/manifesto`
- `http://localhost:4321/constitution`
- `http://localhost:4321/covenant`
- `http://localhost:4321/protocol`
- `http://localhost:4321/overview`

Expected: each page renders the corresponding `.md` content with correct typography, no console errors. Stop dev server.

- [ ] **Step 7: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/pages
git commit -m "feat(site): manifesto, constitution, covenant, protocol, overview pages"
```

---

## Task 8: `/docs` index page

**Files:**
- Create: `site/src/pages/docs.astro`

- [ ] **Step 1: Write `site/src/pages/docs.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Article from '../layouts/Article.astro';

const entries = await getCollection('source');
const sorted = entries
  .map(e => ({ id: e.id, title: e.data.title ?? e.id.replace(/[-_]/g, ' ') }))
  .sort((a, b) => a.id.localeCompare(b.id));
---
<Article title="All source documents" sectionLabel="§ Index">
  <p>Every document below is the canonical source. The narrative site draws its copy from these files directly.</p>
  <ul>
    {sorted.map(e => (
      <li>
        <a href={`/docs/${e.id}`}>{e.title}</a>
        <span class="label" style="margin-left:8px;">{e.id}.md</span>
      </li>
    ))}
  </ul>
</Article>
```

- [ ] **Step 2: Create a catch-all route for individual docs**

Create `site/src/pages/docs/[...slug].astro`:
```astro
---
import { getCollection, getEntry, render } from 'astro:content';
import Article from '../../layouts/Article.astro';

export async function getStaticPaths() {
  const entries = await getCollection('source');
  return entries.map(e => ({ params: { slug: e.id } }));
}

const { slug } = Astro.params;
const entry = await getEntry('source', slug as string);
if (!entry) throw new Error(`Not found: ${slug}`);
const { Content } = await render(entry);
const title = entry.data.title ?? (slug as string).replace(/[-_]/g, ' ');
---
<Article title={title} sectionLabel={`§ ${slug}.md`}>
  <Content />
</Article>
```

- [ ] **Step 3: Verify `/docs` and a deep link work**

Run `npm run dev`, open:
- `http://localhost:4321/docs` — expect list of all source docs
- `http://localhost:4321/docs/whitepaper` — expect the whitepaper rendered
- `http://localhost:4321/docs/academic-paper-icos-overview` — expect the academic paper rendered

Stop dev server.

- [ ] **Step 4: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/pages/docs.astro site/src/pages/docs
git commit -m "feat(site): /docs index and catch-all route for all source documents"
```

---

## Task 9: Vitest setup + first unit test (reduced-motion detector)

**Files:**
- Create: `site/vitest.config.ts`
- Create: `site/src/lib/scroll.ts`
- Create: `site/tests/unit/scroll.test.ts`

- [ ] **Step 1: Write `site/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['tests/unit/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: Write the failing test first**

Create `site/tests/unit/scroll.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prefersReducedMotion } from '../../src/lib/scroll';

describe('prefersReducedMotion', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true when the media query matches', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: q === '(prefers-reduced-motion: reduce)',
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList));
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when the media query does not match', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList));
    expect(prefersReducedMotion()).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run test
```
Expected: FAIL — `prefersReducedMotion` is not exported from `../../src/lib/scroll`.

- [ ] **Step 4: Create `site/src/lib/scroll.ts` with minimal impl**

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 5: Run tests — expect pass**

Run `npm run test`. Expected: 2 passing.

- [ ] **Step 6: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/vitest.config.ts site/src/lib/scroll.ts site/tests/unit
git commit -m "feat(site): reduced-motion detector with tests"
```

---

## Task 10: Lenis + ScrollTrigger initialization

**Files:**
- Modify: `site/src/lib/scroll.ts`

- [ ] **Step 1: Extend `scroll.ts` with init function**

Replace contents of `site/src/lib/scroll.ts`:
```ts
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let lenis: Lenis | null = null;

export function initScroll(): Lenis | null {
  if (typeof window === 'undefined') return null;
  if (lenis) return lenis;

  const reduced = prefersReducedMotion();

  lenis = new Lenis({
    duration: reduced ? 0 : 1.1,
    smoothWheel: !reduced,
    lerp: 0.08,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Keep ScrollTrigger in sync with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function destroyScroll(): void {
  lenis?.destroy();
  lenis = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}
```

- [ ] **Step 2: Verify typecheck passes**

Run:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npx astro check
```
Expected: 0 errors, 0 warnings (hints are OK).

- [ ] **Step 3: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/lib/scroll.ts
git commit -m "feat(site): Lenis + ScrollTrigger init"
```

---

## Task 11: `Narrative` layout (shell for `/`)

**Files:**
- Create: `site/src/layouts/Narrative.astro`

- [ ] **Step 1: Write the layout**

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
import '../styles/global.css';
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{title}</title>
  <link rel="preload" href="/fonts/SourceSerif4-Variable.woff2" as="font" type="font/woff2" crossorigin />
  <meta name="description" content="CommonGround — a premise, three commitments, one operating system." />
</head>
<body class="narrative-body">
  <a class="skip-link" href="#scene-01">Skip to main content</a>
  <main id="scene-01" class="narrative">
    <slot />
  </main>

  <script>
    import { initScroll } from '../lib/scroll';
    initScroll();
  </script>
</body>
</html>

<style is:global>
  .narrative-body { background: var(--paper); }
  .narrative { display: block; }

  .skip-link {
    position: absolute; left: -9999px;
    background: var(--ink); color: var(--paper);
    padding: 8px 16px; font-family: var(--font-mono); font-size: 12px;
  }
  .skip-link:focus { left: 16px; top: 16px; z-index: 100; }

  /* 12-col grid used by scenes */
  .grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    column-gap: var(--gutter);
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 0 48px;
  }
  .col-center { grid-column: 4 / 10; }
  .col-margin { grid-column: 1 / 4; }
  .col-wide   { grid-column: 2 / 12; }

  .scene {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 120px 0;
    position: relative;
  }
  .scene .section-no { color: var(--muted); }

  .stanza p {
    font-family: var(--font-display);
    font-size: clamp(28px, 3.4vw, 44px);
    line-height: 1.25;
    margin: 0 0 28px;
  }

  .act-label {
    font-family: var(--font-mono);
    font-size: var(--fs-label);
    letter-spacing: var(--fs-label-tracking);
    text-transform: uppercase;
    color: var(--muted);
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/layouts/Narrative.astro
git commit -m "feat(site): Narrative layout with Lenis init"
```

---

## Task 12: `LayerDiagram` SVG component (static, reused by Scene07 and `/overview`)

**Files:**
- Create: `site/src/components/LayerDiagram.astro`
- Modify: `site/src/pages/overview.astro`

- [ ] **Step 1: Write `site/src/components/LayerDiagram.astro`**

```astro
---
interface Props {
  variant?: 'static' | 'interactive';
}
const { variant = 'static' } = Astro.props;

const layers = [
  { id: 'L1', name: 'Personal',    tag: 'self-awareness',      motif: 'spiral' },
  { id: 'L2', name: 'Relational',  tag: 'group coordination',  motif: 'pair' },
  { id: 'L3', name: 'Collective',  tag: 'governance',          motif: 'hex' },
  { id: 'L4', name: 'Ecological',  tag: 'stewardship',         motif: 'branch' },
  { id: 'L5', name: 'AI',          tag: 'sensemaking',         motif: 'stars' },
];
---
<div class={`layer-diagram variant-${variant}`} data-variant={variant}>
  {layers.map((l, i) => (
    <div class="layer" data-layer-id={l.id} data-index={i}>
      <span class="label layer-id">{l.id} · {l.name.toUpperCase()}</span>
      <span class="layer-tag">{l.tag}</span>
      <svg class="layer-motif" viewBox="0 0 80 40" aria-hidden="true">
        {l.motif === 'spiral' && (
          <path d="M40 20 m-14 0 a14 14 0 1 0 28 0 a10 10 0 0 1 -20 0 a6 6 0 1 1 12 0" fill="none" stroke="currentColor" stroke-width="0.8" />
        )}
        {l.motif === 'pair' && (
          <g fill="none" stroke="currentColor" stroke-width="0.8">
            <circle cx="28" cy="20" r="10" />
            <circle cx="52" cy="20" r="10" />
          </g>
        )}
        {l.motif === 'hex' && (
          <g fill="none" stroke="currentColor" stroke-width="0.8">
            <polygon points="32,6 48,6 56,20 48,34 32,34 24,20" />
            <polygon points="16,12 22,12 26,22 22,32 16,32 12,22" opacity="0.6" />
            <polygon points="58,12 64,12 68,22 64,32 58,32 54,22" opacity="0.6" />
          </g>
        )}
        {l.motif === 'branch' && (
          <g fill="none" stroke="currentColor" stroke-width="0.8">
            <path d="M40 36 L40 20 M40 20 L28 10 M40 20 L52 10 M40 28 L30 24 M40 28 L50 24" />
          </g>
        )}
        {l.motif === 'stars' && (
          <g fill="currentColor">
            <circle cx="18" cy="14" r="1.2" /><circle cx="32" cy="26" r="1.2" />
            <circle cx="46" cy="10" r="1.2" /><circle cx="58" cy="22" r="1.2" />
            <circle cx="68" cy="14" r="1.2" /><circle cx="40" cy="18" r="1.2" />
            <g stroke="currentColor" stroke-width="0.4" opacity="0.5">
              <line x1="18" y1="14" x2="32" y2="26" />
              <line x1="32" y1="26" x2="46" y2="10" />
              <line x1="46" y1="10" x2="58" y2="22" />
              <line x1="58" y1="22" x2="68" y2="14" />
              <line x1="40" y1="18" x2="46" y2="10" />
            </g>
          </g>
        )}
      </svg>
    </div>
  ))}
</div>

<style>
  .layer-diagram {
    display: flex; flex-direction: column;
    border-top: 0.5px solid var(--rule);
    color: var(--ink);
    background: var(--paper);
  }
  .layer {
    display: grid;
    grid-template-columns: 160px 1fr 80px;
    align-items: center;
    gap: 24px;
    height: 80px;
    padding: 0 24px;
    border-bottom: 0.5px solid var(--rule);
  }
  .layer-id { color: var(--muted); }
  .layer-tag {
    font-family: var(--font-display); font-style: italic;
    font-size: 20px;
  }
  .layer-motif { width: 80px; height: 40px; color: var(--ink); opacity: 0.7; }

  .variant-interactive .layer { opacity: 0; transform: translateY(24px); }
</style>
```

- [ ] **Step 2: Add the static diagram to `/overview`**

Modify `site/src/pages/overview.astro` to append the diagram after the content:
```astro
---
import { getEntry, render } from 'astro:content';
import Article from '../layouts/Article.astro';
import LayerDiagram from '../components/LayerDiagram.astro';
const entry = await getEntry('source', 'icos_overview');
if (!entry) throw new Error('icos_overview (ICOS_Overview.md) not found');
const { Content } = await render(entry);
---
<Article title="ICOS Overview" sectionLabel="§ Integral Commons OS">
  <Content />
  <hr class="rule" />
  <h2>The five layers</h2>
  <LayerDiagram variant="static" />
</Article>
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, open `http://localhost:4321/overview`. Expected: markdown content followed by five-layer static diagram with hairline motifs.

- [ ] **Step 4: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/components/LayerDiagram.astro site/src/pages/overview.astro
git commit -m "feat(site): LayerDiagram component + embed on /overview"
```

---

## Task 13: Shared scene helpers — `SectionNumber`, `Footnote`

**Files:**
- Create: `site/src/components/SectionNumber.astro`
- Create: `site/src/components/Footnote.astro`

- [ ] **Step 1: Write `SectionNumber.astro`**

```astro
---
interface Props { n: string; act?: string; }
const { n, act } = Astro.props;
---
<div class="section-no col-margin">
  <span class="label">§ {n}</span>
  {act && <span class="label act-label" style="margin-left:12px;">{act}</span>}
</div>

<style>
  .section-no { align-self: flex-start; margin-top: 8px; }
</style>
```

- [ ] **Step 2: Write `Footnote.astro`**

```astro
---
interface Props { href: string; }
const { href } = Astro.props;
---
<sup class="footnote"><a href={href}>§</a></sup>

<style>
  .footnote { font-family: var(--font-mono); font-size: 10px; margin-left: 2px; }
  .footnote a { color: var(--accent); text-decoration: none; }
  .footnote a:hover { text-decoration: underline; }
</style>
```

- [ ] **Step 3: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/components/SectionNumber.astro site/src/components/Footnote.astro
git commit -m "feat(site): SectionNumber and Footnote components"
```

---

## Task 14: Scenes 00, 02–06, 08, 09 (baseline, no pinned anchors)

Each scene is a thin Astro component. Body copy is transcribed from the source `.md` files (exact strings from `docs/manifesto.md` and `docs/ICOS_Overview.md`). Scenes 01 and 07 are deferred to Tasks 16 and 17.

**Files:**
- Create: `site/src/components/scenes/Scene00Opening.astro`
- Create: `site/src/components/scenes/Scene02Rejection.astro`
- Create: `site/src/components/scenes/Scene03Affirmations.astro`
- Create: `site/src/components/scenes/Scene04Commitments.astro`
- Create: `site/src/components/scenes/Scene05Understanding.astro`
- Create: `site/src/components/scenes/Scene06Substrate.astro`
- Create: `site/src/components/scenes/Scene08DesignGoal.astro`
- Create: `site/src/components/scenes/Scene09Invitation.astro`

- [ ] **Step 1: Scene 00 — opening plate**

Create `site/src/components/scenes/Scene00Opening.astro`:
```astro
<section class="scene scene-opening grid">
  <div class="col-wide" style="grid-column: 2 / 12; text-align:center;">
    <h1 class="opening-wordmark">CommonGround</h1>
    <p class="opening-sub">A premise, three commitments, one operating system.</p>
  </div>
</section>

<style>
  .scene-opening { min-height: 100vh; }
  .opening-wordmark {
    font-family: var(--font-display);
    font-size: clamp(64px, 11vw, 160px);
    font-weight: 500;
    letter-spacing: -0.02em;
    margin: 0 0 24px;
  }
  .opening-sub {
    font-family: var(--font-mono);
    font-size: var(--fs-label);
    letter-spacing: var(--fs-label-tracking);
    text-transform: uppercase;
    color: var(--muted);
    margin: 0;
  }
</style>
```

- [ ] **Step 2: Scene 02 — rejection**

Create `site/src/components/scenes/Scene02Rejection.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene scene-rejection grid">
  <SectionNumber n="02" act="I · Diagnosis" />
  <div class="col-center reject-head">
    <h2 class="reject-heading">We reject</h2>
  </div>
</section>

<section class="scene scene-reject-plate grid" data-plate="1">
  <div class="col-wide plate"><span class="plate-num label">01 / 03</span><p>Extractive platforms.</p></div>
</section>

<section class="scene scene-reject-plate grid" data-plate="2">
  <div class="col-wide plate"><span class="plate-num label">02 / 03</span><p>Opaque governance.</p></div>
</section>

<section class="scene scene-reject-plate grid" data-plate="3">
  <div class="col-wide plate"><span class="plate-num label">03 / 03</span><p>Irreversible power.</p></div>
</section>

<style>
  .reject-heading { font-size: var(--fs-h2); margin-bottom: 0; }

  .scene-reject-plate { min-height: 100vh; }
  .plate {
    grid-column: 2 / 12;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center;
    gap: 40px;
  }
  .plate p {
    font-family: var(--font-display);
    font-size: clamp(56px, 9vw, 128px);
    line-height: 1.05;
    color: var(--accent);
    margin: 0;
    max-width: 12ch;
  }
  .plate-num { color: var(--muted); }
</style>
```

- [ ] **Step 3: Scene 03 — affirmations**

Create `site/src/components/scenes/Scene03Affirmations.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene grid">
  <SectionNumber n="03" act="II · Commitments" />
  <div class="col-center stanza">
    <p class="label" style="margin-bottom:24px;">We affirm</p>
    <p>Stewardship over ownership.</p>
    <p>Revocability of power.</p>
    <p>Transparency of process.</p>
    <p>Plurality of perspectives.</p>
  </div>
</section>
```

- [ ] **Step 4: Scene 04 — commitments**

Create `site/src/components/scenes/Scene04Commitments.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene grid">
  <SectionNumber n="04" act="II · Commitments" />
  <div class="col-center stanza">
    <p class="label" style="margin-bottom:24px;">We commit to building systems that</p>
    <p>Increase awareness.</p>
    <p>Support meaningful disagreement.</p>
    <p>Enable local governance.</p>
    <p>Remain open and forkable.</p>
  </div>
</section>
```

- [ ] **Step 5: Scene 05 — understanding**

Create `site/src/components/scenes/Scene05Understanding.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene grid">
  <SectionNumber n="05" act="II · Commitments" />
  <div class="col-center stanza understanding">
    <p class="label" style="margin-bottom:24px;">We understand</p>
    <p>No system guarantees wisdom.</p>
    <p>But systems can enable or constrain it.</p>
    <p class="closing">CommonGround exists to enable it.</p>
  </div>
</section>

<style>
  .understanding .closing {
    font-style: italic;
    margin-top: 40px;
  }
</style>
```

- [ ] **Step 6: Scene 06 — substrate pivot**

Create `site/src/components/scenes/Scene06Substrate.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene grid">
  <SectionNumber n="06" act="III · Architecture" />
  <div class="col-center substrate">
    <p class="label">The operating system for these commitments is called</p>
    <h2 class="substrate-name">ICOS</h2>
    <p class="label substrate-expand">Integral Commons OS</p>
    <p class="substrate-body">
      A decentralized infrastructure for decision-making, governance, knowledge coordination,
      and collective intelligence — integrating commons governance, integral theory, process
      philosophy, developmental psychology, and distributed systems design.
    </p>
  </div>
</section>

<style>
  .substrate { text-align: center; }
  .substrate-name {
    font-family: var(--font-display);
    font-size: clamp(88px, 14vw, 200px);
    font-weight: 500;
    margin: 24px 0 12px;
    letter-spacing: -0.02em;
  }
  .substrate-expand { display: block; margin-bottom: 64px; }
  .substrate-body {
    font-family: var(--font-body);
    font-size: 20px;
    line-height: 1.6;
    max-width: 58ch;
    margin: 0 auto;
    color: var(--ink);
  }
</style>
```

- [ ] **Step 7: Scene 08 — design goal**

Create `site/src/components/scenes/Scene08DesignGoal.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene grid">
  <SectionNumber n="08" act="III · Architecture" />
  <div class="col-center stanza">
    <p class="label" style="margin-bottom:24px;">Enabling systems that are</p>
    <p>Adaptive.</p>
    <p>Participatory.</p>
    <p>Resistant to capture.</p>
    <p>Developmentally supportive.</p>
  </div>
</section>
```

- [ ] **Step 8: Scene 09 — invitation**

Create `site/src/components/scenes/Scene09Invitation.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene scene-invite grid">
  <SectionNumber n="09" />
  <div class="col-center invite">
    <p class="label">§ Invitation</p>
    <h2>Read further. Or build with us.</h2>
    <div class="ctas">
      <a class="cta" href="/constitution">Read the constitution →</a>
      <a class="cta" href="/docs">All source documents →</a>
    </div>
    <p class="label footer-mark" style="margin-top:80px;">CommonGround · built on ICOS</p>
  </div>
</section>

<style>
  .invite h2 {
    font-family: var(--font-display);
    font-size: clamp(40px, 5vw, 72px);
    line-height: 1.1;
    margin: 12px 0 48px;
    max-width: 20ch;
  }
  .ctas { display: flex; flex-direction: column; gap: 16px; }
  .cta {
    font-family: var(--font-display);
    font-size: 22px;
    color: var(--ink);
    text-decoration-color: var(--rule);
    text-underline-offset: 6px;
    width: fit-content;
  }
  .cta:hover { text-decoration-color: var(--accent); color: var(--accent); }
  .footer-mark { color: var(--muted); }
</style>
```

- [ ] **Step 9: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/components/scenes
git commit -m "feat(site): scenes 00, 02–06, 08, 09 (baseline, no anchors)"
```

---

## Task 15: Baseline narrative page (scenes wired, no anchors yet)

**Files:**
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Write `index.astro` that renders all scenes as long-form**

Replace contents of `site/src/pages/index.astro`:
```astro
---
import Narrative from '../layouts/Narrative.astro';
import Scene00Opening from '../components/scenes/Scene00Opening.astro';
import Scene02Rejection from '../components/scenes/Scene02Rejection.astro';
import Scene03Affirmations from '../components/scenes/Scene03Affirmations.astro';
import Scene04Commitments from '../components/scenes/Scene04Commitments.astro';
import Scene05Understanding from '../components/scenes/Scene05Understanding.astro';
import Scene06Substrate from '../components/scenes/Scene06Substrate.astro';
import Scene08DesignGoal from '../components/scenes/Scene08DesignGoal.astro';
import Scene09Invitation from '../components/scenes/Scene09Invitation.astro';
---
<Narrative title="CommonGround">
  <Scene00Opening />

  {/* Scene01 (Anchor A) added in Task 16 */}
  <section class="scene grid" style="min-height:60vh;">
    <div class="col-center"><p class="label">§ 01 — placeholder until Anchor A</p></div>
  </section>

  <Scene02Rejection />
  <div class="ornament"><span class="dot"></span></div>
  <Scene03Affirmations />
  <Scene04Commitments />
  <Scene05Understanding />
  <hr class="rule" />
  <Scene06Substrate />

  {/* Scene07 (Anchor B) added in Task 17 */}
  <section class="scene grid" style="min-height:60vh;">
    <div class="col-center"><p class="label">§ 07 — placeholder until Anchor B</p></div>
  </section>

  <Scene08DesignGoal />
  <Scene09Invitation />
</Narrative>
```

- [ ] **Step 2: Verify `/` renders all scenes in order**

Run `npm run dev`, open `http://localhost:4321/`. Expected:
- Opening plate at top.
- §01 placeholder.
- §02 rejection heading + three full-viewport plates (extractive, opaque, irreversible).
- §03, §04, §05 stanzas.
- §06 substrate pivot to ICOS.
- §07 placeholder.
- §08 design goal stanza.
- §09 invitation with two CTAs.

Stop dev server.

- [ ] **Step 3: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/pages/index.astro
git commit -m "feat(site): baseline narrative page with scenes in order"
```

---

## Task 16: Anchor A — §01 Premise type reveal

**Files:**
- Create: `site/src/components/scenes/Scene01Premise.astro`
- Create: `site/src/lib/anchors/premise.ts`
- Create: `site/tests/unit/premise.test.ts`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Write the failing test for the timeline-builder**

Create `site/tests/unit/premise.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildPremiseTimeline } from '../../src/lib/anchors/premise';

describe('buildPremiseTimeline', () => {
  it('creates a step per line with increasing startFraction', () => {
    const steps = buildPremiseTimeline(4);
    expect(steps.length).toBe(4);
    expect(steps[0].startFraction).toBe(0);
    expect(steps[3].startFraction).toBeCloseTo(0.675, 2);
    steps.forEach((s, i) => {
      if (i > 0) expect(s.startFraction).toBeGreaterThan(steps[i - 1].startFraction);
    });
  });

  it('each step has a non-zero duration within [0,1]', () => {
    const steps = buildPremiseTimeline(4);
    steps.forEach(s => {
      expect(s.durationFraction).toBeGreaterThan(0);
      expect(s.startFraction + s.durationFraction).toBeLessThanOrEqual(1);
    });
  });
});
```

- [ ] **Step 2: Run the test — expect FAIL (module does not exist)**

```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run test
```

- [ ] **Step 3: Implement `buildPremiseTimeline` + `mountPremiseAnchor`**

Create `site/src/lib/anchors/premise.ts`:
```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../scroll';

export interface PremiseStep {
  startFraction: number;
  durationFraction: number;
}

/**
 * Reveal plan: each line starts before the previous finishes for a
 * smooth cascade. Final 10% reserved for the "lift" gesture.
 */
export function buildPremiseTimeline(lineCount: number): PremiseStep[] {
  const reserved = 0.1;
  const usable = 1 - reserved;
  const stride = usable / (lineCount + 0.5);
  const duration = stride * 1.5;
  return Array.from({ length: lineCount }, (_, i) => ({
    startFraction: Number((i * stride).toFixed(4)),
    durationFraction: Number(duration.toFixed(4)),
  }));
}

export function mountPremiseAnchor(root: HTMLElement): void {
  const lines = Array.from(root.querySelectorAll<HTMLElement>('[data-premise-line]'));
  const stanza = root.querySelector<HTMLElement>('[data-premise-stanza]');
  const sectionNo = root.querySelector<HTMLElement>('[data-premise-num]');
  if (lines.length === 0 || !stanza) return;

  if (prefersReducedMotion()) {
    lines.forEach((el) => {
      el.style.opacity = '1';
      el.style.filter = 'none';
      el.style.transform = 'none';
    });
    return;
  }

  gsap.set(lines, { opacity: 0, filter: 'blur(6px)', y: 16 });

  const steps = buildPremiseTimeline(lines.length);
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=250%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
    },
  });

  steps.forEach((step, i) => {
    tl.to(
      lines[i],
      { opacity: 1, filter: 'blur(0px)', y: 0, duration: step.durationFraction, ease: 'none' },
      step.startFraction,
    );
  });

  tl.to(stanza, { y: -24, duration: 0.1, ease: 'none' }, 0.9);
  if (sectionNo) tl.to(sectionNo, { opacity: 0, duration: 0.1, ease: 'none' }, 0.9);
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test
```
Expected: all tests passing.

- [ ] **Step 5: Write `Scene01Premise.astro`**

Create `site/src/components/scenes/Scene01Premise.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
---
<section class="scene scene-premise grid" data-scene="premise">
  <div data-premise-num>
    <SectionNumber n="01" act="I · Diagnosis" />
  </div>
  <div class="col-center premise-stanza" data-premise-stanza>
    <p class="label" style="margin-bottom:24px;">We believe</p>
    <p class="premise-line" data-premise-line>Systems ignoring human development create fragmentation.</p>
    <p class="premise-line" data-premise-line>Centralized power leads to capture.</p>
    <p class="premise-line" data-premise-line>Democracy without structure becomes noise.</p>
    <p class="premise-line" data-premise-line>Structure without participation becomes domination.</p>
  </div>
</section>

<script>
  import { mountPremiseAnchor } from '../../lib/anchors/premise';
  const root = document.querySelector<HTMLElement>('[data-scene="premise"]');
  if (root) mountPremiseAnchor(root);
</script>

<style>
  .scene-premise { min-height: 100vh; align-items: center; }
  .premise-stanza p {
    font-family: var(--font-display);
    font-size: clamp(28px, 3.4vw, 44px);
    line-height: 1.25;
    margin: 0 0 28px;
  }
  .premise-stanza .premise-line:last-child { margin-bottom: 0; }
</style>
```

- [ ] **Step 6: Replace the §01 placeholder in `index.astro`**

Modify `site/src/pages/index.astro`:
- Add `import Scene01Premise from '../components/scenes/Scene01Premise.astro';` at the top.
- Replace the `{/* Scene01 placeholder */}` block and its inline `<section>` with `<Scene01Premise />`.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, open `/`. Scroll from top. Expected:
- Section pins when `§01` reaches the top.
- Lines fade and de-blur in sequence as you scroll.
- Near the end of the pin, the stanza lifts upward and the `§01` label fades.
- Section unpins and `§02` appears below.
- In DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce", all four lines render static, no pin.

Stop dev server.

- [ ] **Step 8: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/components/scenes/Scene01Premise.astro \
        site/src/lib/anchors/premise.ts \
        site/tests/unit/premise.test.ts \
        site/src/pages/index.astro
git commit -m "feat(site): Anchor A — §01 premise type reveal"
```

---

## Task 17: Anchor B — §07 Five layers stack-build

**Files:**
- Create: `site/src/components/scenes/Scene07Layers.astro`
- Create: `site/src/lib/anchors/layers.ts`
- Create: `site/tests/unit/layers.test.ts`
- Modify: `site/src/pages/index.astro`

- [ ] **Step 1: Write the failing test**

Create `site/tests/unit/layers.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { buildLayerSchedule } from '../../src/lib/anchors/layers';

describe('buildLayerSchedule', () => {
  it('divides scroll progress evenly across layers', () => {
    const schedule = buildLayerSchedule(5);
    expect(schedule.length).toBe(5);
    expect(schedule[0].enterAt).toBe(0);
    expect(schedule[4].enterAt).toBeCloseTo(0.8, 3);
    schedule.forEach((s, i) => {
      if (i > 0) expect(s.enterAt).toBeGreaterThan(schedule[i - 1].enterAt);
    });
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm run test
```

- [ ] **Step 3: Implement the anchor module**

Create `site/src/lib/anchors/layers.ts`:
```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../scroll';

export interface LayerStep {
  enterAt: number;
  settledAt: number;
}

export function buildLayerSchedule(layerCount: number): LayerStep[] {
  const stride = 1 / layerCount;
  return Array.from({ length: layerCount }, (_, i) => ({
    enterAt: Number((i * stride).toFixed(4)),
    settledAt: Number(((i + 1) * stride).toFixed(4)),
  }));
}

export function mountLayersAnchor(root: HTMLElement): void {
  const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-layer-id]'));
  const captionName = root.querySelector<HTMLElement>('[data-caption-name]');
  const captionTag = root.querySelector<HTMLElement>('[data-caption-tag]');
  const captionDesc = root.querySelector<HTMLElement>('[data-caption-desc]');
  const footer = root.querySelector<HTMLElement>('[data-footer-line]');
  if (layers.length === 0) return;

  const captions = [
    { name: 'L1 · Personal',    tag: 'self-awareness',      desc: 'The base layer. Presence, reflection, inner coherence — the ground every other layer rests on.' },
    { name: 'L2 · Relational',  tag: 'group coordination',  desc: 'Dyads, teams, circles. The mechanics of understanding and being understood at small scale.' },
    { name: 'L3 · Collective',  tag: 'governance',          desc: 'Decisions held by groups larger than trust. Structured deliberation, revocable authority, transparent process.' },
    { name: 'L4 · Ecological',  tag: 'stewardship',         desc: 'The commons beyond humans — land, water, knowledge, time. Governance for things no one should own.' },
    { name: 'L5 · AI',          tag: 'sensemaking',         desc: 'Machine intelligence as participant, not owner — helping groups see patterns they would otherwise miss.' },
  ];

  if (prefersReducedMotion()) {
    layers.forEach(l => { l.style.opacity = '1'; l.style.transform = 'none'; });
    if (captionName) captionName.textContent = 'Five layers';
    if (captionTag) captionTag.textContent = 'from self to sensemaking';
    if (captionDesc) captionDesc.textContent = 'Static diagram — motion disabled per user preference.';
    if (footer) footer.style.opacity = '1';
    return;
  }

  gsap.set(layers, { opacity: 0, y: 24 });
  if (footer) gsap.set(footer, { opacity: 0 });

  const schedule = buildLayerSchedule(layers.length);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: '+=500%',
      pin: true,
      scrub: 0.5,
      anticipatePin: 1,
    },
  });

  schedule.forEach((step, i) => {
    const cap = captions[i];
    tl.to(
      layers[i],
      { opacity: 1, y: 0, duration: 0.5 / layers.length, ease: 'none' },
      step.enterAt,
    );
    tl.call(
      () => {
        if (captionName) captionName.textContent = cap.name;
        if (captionTag) captionTag.textContent = cap.tag;
        if (captionDesc) captionDesc.textContent = cap.desc;
      },
      [],
      step.enterAt + 0.02,
    );
  });

  if (footer) tl.to(footer, { opacity: 1, duration: 0.05, ease: 'none' }, 0.98);
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm run test
```

- [ ] **Step 5: Write `Scene07Layers.astro`**

Create `site/src/components/scenes/Scene07Layers.astro`:
```astro
---
import SectionNumber from '../SectionNumber.astro';
import LayerDiagram from '../LayerDiagram.astro';
---
<section class="scene scene-layers" data-scene="layers">
  <div class="layers-head grid">
    <SectionNumber n="07" act="III · Architecture" />
    <h2 class="layers-heading col-center">Five layers. One substrate.</h2>
  </div>

  <div class="layers-body">
    <aside class="layers-caption">
      <p class="label" data-caption-name>L1 · Personal</p>
      <p class="caption-tag" data-caption-tag>self-awareness</p>
      <p class="caption-desc" data-caption-desc>The base layer. Presence, reflection, inner coherence — the ground every other layer rests on.</p>
    </aside>
    <div class="layers-stack">
      <LayerDiagram variant="interactive" />
      <p class="label layers-footer" data-footer-line>Five layers · one substrate · ICOS</p>
    </div>
  </div>
</section>

<script>
  import { mountLayersAnchor } from '../../lib/anchors/layers';
  const root = document.querySelector<HTMLElement>('[data-scene="layers"]');
  if (root) mountLayersAnchor(root);
</script>

<style>
  .scene-layers { min-height: 100vh; padding: 80px 0; }
  .layers-head { margin-bottom: 64px; }
  .layers-heading { font-size: var(--fs-h2); }

  .layers-body {
    display: grid;
    grid-template-columns: 40% 60%;
    gap: var(--gutter);
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 0 48px;
    min-height: 60vh;
  }
  .layers-caption {
    position: sticky; top: 30vh; align-self: start;
    padding-right: 24px;
  }
  .layers-caption .label { color: var(--accent); margin-bottom: 12px; }
  .caption-tag {
    font-family: var(--font-display); font-style: italic;
    font-size: 28px; margin: 0 0 20px;
  }
  .caption-desc {
    font-family: var(--font-body);
    font-size: 17px; line-height: 1.55; color: var(--ink);
    max-width: 38ch; margin: 0;
  }
  .layers-stack { display: flex; flex-direction: column; }
  .layers-footer { text-align: right; margin-top: 16px; color: var(--muted); }
</style>
```

- [ ] **Step 6: Replace the §07 placeholder in `index.astro`**

Modify `site/src/pages/index.astro`:
- Add `import Scene07Layers from '../components/scenes/Scene07Layers.astro';` at the top.
- Replace the `{/* Scene07 placeholder */}` block and its inline `<section>` with `<Scene07Layers />`.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, open `/`. Scroll through to §07. Expected:
- Section pins.
- Layers L1–L5 fade/slide in one at a time as you scroll.
- Caption text swaps synchronized with each layer's entry.
- At the end, "Five layers · one substrate · ICOS" appears.
- Reduced-motion: all layers render static, caption shows "Five layers / from self to sensemaking", no pin.

Stop dev server.

- [ ] **Step 8: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/components/scenes/Scene07Layers.astro \
        site/src/lib/anchors/layers.ts \
        site/tests/unit/layers.test.ts \
        site/src/pages/index.astro
git commit -m "feat(site): Anchor B — §07 five layers stack-build"
```

---

## Task 18: Baseline scroll-reveal for all non-anchor scenes

**Files:**
- Modify: `site/src/lib/scroll.ts`
- Modify: `site/src/layouts/Narrative.astro`
- Modify: all `site/src/components/scenes/Scene0{2..9}*.astro` (add `data-reveal` attribute to stanzas)

- [ ] **Step 1: Add `installBaselineReveal` to `scroll.ts`**

Append to `site/src/lib/scroll.ts`:
```ts
export function installBaselineReveal(root: Document | HTMLElement = document): void {
  if (typeof window === 'undefined') return;
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (targets.length === 0) return;

  if (prefersReducedMotion()) {
    targets.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  gsap.set(targets, { opacity: 0, y: 12 });
  targets.forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'cubic-bezier(0.16,1,0.3,1)',
      scrollTrigger: { trigger: el, start: 'top 80%', once: true },
    });
  });
}
```

- [ ] **Step 2: Call it from `Narrative.astro`**

Modify the `<script>` block in `site/src/layouts/Narrative.astro`:
```astro
<script>
  import { initScroll, installBaselineReveal } from '../lib/scroll';
  initScroll();
  installBaselineReveal();
</script>
```

- [ ] **Step 3: Add `data-reveal` to each non-anchor scene stanza**

In each of the following files, add `data-reveal` to the top-level stanza wrapper:
- `Scene02Rejection.astro`: add `data-reveal` to `.reject-head`, and to each `.plate`.
- `Scene03Affirmations.astro`: add `data-reveal` to `.stanza`.
- `Scene04Commitments.astro`: add `data-reveal` to `.stanza`.
- `Scene05Understanding.astro`: add `data-reveal` to `.stanza`.
- `Scene06Substrate.astro`: add `data-reveal` to `.substrate`.
- `Scene08DesignGoal.astro`: add `data-reveal` to `.stanza`.
- `Scene09Invitation.astro`: add `data-reveal` to `.invite`.

(Do NOT add to `Scene00Opening.astro` or the anchor scenes — those have their own motion.)

- [ ] **Step 4: Manual verification**

Run `npm run dev`, open `/`, scroll through. Expected: each stanza fades + slides in as it enters the viewport. Reduced-motion mode: everything static.

- [ ] **Step 5: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/src/lib/scroll.ts site/src/layouts/Narrative.astro site/src/components/scenes
git commit -m "feat(site): baseline scroll-reveal for non-anchor scenes"
```

---

## Task 19: Playwright smoke tests

**Files:**
- Create: `site/playwright.config.ts`
- Create: `site/tests/smoke/routes.spec.ts`
- Create: `site/tests/smoke/reduced-motion.spec.ts`

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/smoke',
  fullyParallel: true,
  reporter: 'list',
  webServer: {
    command: 'npm run build && npm run preview -- --port 4321',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 2: Write `routes.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

const routes = [
  { path: '/',              expectText: 'CommonGround' },
  { path: '/manifesto',     expectText: 'We believe' },
  { path: '/constitution',  expectText: 'Constitution' },
  { path: '/covenant',      expectText: 'Covenant' },
  { path: '/protocol',      expectText: 'Protocol' },
  { path: '/overview',      expectText: 'Integral Commons OS' },
  { path: '/docs',          expectText: 'All source documents' },
  { path: '/docs/manifesto',expectText: 'We believe' },
];

for (const r of routes) {
  test(`route ${r.path} returns 200 and renders expected text`, async ({ page }) => {
    const resp = await page.goto(r.path);
    expect(resp?.status(), `status for ${r.path}`).toBe(200);
    await expect(page.locator('body')).toContainText(r.expectText);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.waitForLoadState('networkidle');
    expect(errors, `console errors on ${r.path}`).toEqual([]);
  });
}
```

- [ ] **Step 3: Write `reduced-motion.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('premise lines are fully visible under reduced-motion', async ({ page }) => {
  await page.goto('/');
  const lines = page.locator('[data-premise-line]');
  await expect(lines).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    const opacity = await lines.nth(i).evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0.99);
  }
});

test('layer rows are fully visible under reduced-motion', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-scene="layers"]').scrollIntoViewIfNeeded();
  const rows = page.locator('[data-scene="layers"] [data-layer-id]');
  await expect(rows).toHaveCount(5);
  for (let i = 0; i < 5; i++) {
    const opacity = await rows.nth(i).evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0.99);
  }
});
```

- [ ] **Step 4: Run smoke tests**

```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run test:smoke
```
Expected: all tests passing. If any fail, fix the source and re-run — do not mark complete until green.

- [ ] **Step 5: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/playwright.config.ts site/tests/smoke
git commit -m "test(site): playwright smoke tests for routes and reduced-motion"
```

---

## Task 20: Lighthouse performance verification

**Files:** none created — verification only.

- [ ] **Step 1: Produce a production build**

```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run build
```
Expected: `dist/` produced, no warnings about oversized assets.

- [ ] **Step 2: Serve the build and run Lighthouse**

In one terminal:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run preview -- --port 4321
```

In another terminal:
```bash
npx lighthouse http://localhost:4321/ \
  --preset=desktop \
  --only-categories=performance,accessibility,best-practices \
  --output=json \
  --output-path=/tmp/lh-home.json \
  --chrome-flags="--headless"
```
Expected: `performance >= 0.95`, `accessibility >= 0.95`, `best-practices >= 0.95`.

Repeat for `/manifesto` and `/overview` (most content-heavy sub-pages).

- [ ] **Step 3: If any page misses the budget, diagnose**

Most likely culprits and fixes:
- GSAP loaded on sub-pages → ensure it only imports on `/`. Sub-pages should not include GSAP.
- Font FOIT → verify `font-display: swap` and `<link rel="preload">` present.
- Large `dist/_astro/*.js` chunk → check bundle analysis with `npm run build -- --verbose`.

Iterate until all three pages hit ≥95.

- [ ] **Step 4: Commit any fixes (if made) and record scores**

Append a `PERFORMANCE.md` file with the scores you measured:
```bash
cd /Users/andrewpennell/Projects/ICOS/site
cat > PERFORMANCE.md <<'EOF'
# Lighthouse scores (desktop preset)

Measured on `npm run preview` locally. Production deploy should match or exceed.

| Route | Performance | Accessibility | Best Practices |
|---|---|---|---|
| / | 0.XX | 0.XX | 0.XX |
| /manifesto | 0.XX | 0.XX | 0.XX |
| /overview | 0.XX | 0.XX | 0.XX |
EOF
```
(Replace `0.XX` with actual scores.)

Commit:
```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/PERFORMANCE.md site/
git commit -m "chore(site): record Lighthouse scores"
```

---

## Task 21: Accessibility verification

**Files:** none created — verification only.

- [ ] **Step 1: Keyboard walkthrough**

Run `npm run dev`. On `/`:
- Tab from the top. First focusable element should be the skip link (`Skip to main content`). Pressing Enter should jump focus past the header.
- Tab through the page. Every focusable element must have a visible focus outline.
- Scroll using Page Down / Space / arrow keys — should work (Lenis does not block keyboard scroll).

- [ ] **Step 2: Screen-reader outline check**

In Chrome DevTools → Accessibility pane → inspect the document outline.
Expected on `/`:
- Exactly one `<h1>` (the wordmark).
- `<h2>` elements for act headings ("We reject", "Five layers. One substrate.", "Read further. Or build with us.").
- No empty headings, no skipped heading levels.

On sub-pages:
- Exactly one `<h1>` (the page title).
- Markdown-derived headings form a logical hierarchy.

- [ ] **Step 3: Color contrast**

Use DevTools color picker on:
- Body text (`--ink` on `--paper`) — expect ≥ 7:1.
- Muted labels (`--muted` on `--paper`) — expect ≥ 4.5:1. If below, darken `--muted` by 5% and re-verify.
- Accent text on paper (`--accent` on `--paper`) — expect ≥ 4.5:1.

- [ ] **Step 4: Fix any issues and commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add -A
git commit -m "fix(site): accessibility tweaks after a11y review" || echo "no changes"
```

---

## Task 22: Cloudflare Pages deploy config

**Files:**
- Create: `site/wrangler.toml`
- Create: `site/README.md`

- [ ] **Step 1: Write `site/wrangler.toml`**

```toml
name = "commonground-site"
pages_build_output_dir = "dist"
compatibility_date = "2026-04-01"
```

- [ ] **Step 2: Write `site/README.md`**

```markdown
# CommonGround Narrative Site

Static Astro site built from the documents in `../docs/`.

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # outputs to dist/
npm run preview      # serve dist/ locally
```

## Tests

```bash
npm run test         # vitest unit tests
npm run test:smoke   # playwright smoke tests (requires build)
```

## Deploy (Cloudflare Pages)

1. Connect the repo to Cloudflare Pages, selecting `site/` as the project root.
2. Build command: `npm run build`
3. Build output: `dist`
4. Environment variable (none required for v1).

`wrangler.toml` in this directory pins the compatibility date.
```

- [ ] **Step 3: Commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git add site/wrangler.toml site/README.md
git commit -m "chore(site): Cloudflare Pages config and README"
```

---

## Task 23: Final verification against success criteria

**Files:** none — verification only.

- [ ] **Step 1: Walk the spec's §11 success-criteria list**

Verify each one:

1. All 9 scenes render on `/` with copy sourced live from `docs/`. → Manual check.
2. Anchors A and B function in Chrome, Safari, Firefox (current – 2). → Manual check in three browsers.
3. Reduced-motion paths verified manually. → DevTools reduced-motion emulation on `/`.
4. All 7 sub-pages render `docs/` markdown with correct typography. → `/manifesto`, `/constitution`, `/covenant`, `/protocol`, `/overview`, `/docs`, plus at least one `/docs/<slug>` page.
5. Lighthouse Performance ≥ 95 on `/` (mobile throttle). → Re-run Lighthouse with `--preset=mobile`.
6. Deployed to Cloudflare Pages at a chosen domain. → Deferred until domain is chosen (tracked in spec §13).
7. No console errors on any route. → Covered by Playwright smoke tests.

- [ ] **Step 2: Run all automated tests one more time**

```bash
cd /Users/andrewpennell/Projects/ICOS/site
npm run test && npm run test:smoke
```
Expected: all green.

- [ ] **Step 3: Re-run Lighthouse with mobile preset**

```bash
npx lighthouse http://localhost:4321/ --preset=mobile --only-categories=performance --chrome-flags="--headless"
```
Expected: performance ≥ 0.95. If it misses, iterate.

- [ ] **Step 4: Tag a release candidate commit**

```bash
cd /Users/andrewpennell/Projects/ICOS
git tag -a site-v1-rc1 -m "CommonGround site v1 — release candidate 1"
```

The three deferred items (domain, GitHub repo link target, whether `/covenant` is superseded) per spec §13 are pre-launch, not pre-merge. They're recorded in `docs/superpowers/specs/2026-04-19-commonground-narrative-site-design.md`.

---

## Self-review notes

- **Spec coverage:** Each §4 scene has a scene component (Task 14, 16, 17). Each §7 route has a page (Tasks 7, 8). Anchors A and B detailed in §6 have dedicated tasks (16, 17) plus tests. Visual system §5 lands in tokens + global styles (Task 4) and component styles. Tech stack §8 realized in Tasks 1, 2, 22. File layout §9 maps task-for-task to files above. Budgets §10 verified in Tasks 20, 21. Success criteria §11 covered in Task 23. Out-of-scope §12 items are **not** in any task — intentional.
- **Type consistency:** `mountPremiseAnchor(root)`, `mountLayersAnchor(root)`, `initScroll()`, `installBaselineReveal()`, `prefersReducedMotion()` are the complete lib surface; each is defined in exactly one file and consumed by matching imports.
- **Placeholders:** none.
