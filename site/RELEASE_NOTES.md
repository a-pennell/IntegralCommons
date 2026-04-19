# CommonGround Site v1 — Release Candidate 1

**Tag:** `site-v1-rc1`
**Branch:** `site/narrative-v1`

## Verification

| Gate | Result |
|---|---|
| vitest unit tests | 5/5 passing |
| Playwright smoke tests | 19/19 passing |
| Lighthouse desktop (/)  | perf 1.00 · a11y 1.00 · best-practices 1.00 |
| Lighthouse mobile (/) performance | 1.00 |
| Axe-core (6 routes) | 0 violations at any impact |
| Build | 30 static pages, 0 errors |
| Scenes on / | 9/9 verified (all copy sourced from docs/) |
| Sub-pages in dist/ | 7/7 exist with non-zero size |

## Deferred items (not blocking RC)

- Final domain. `astro.config.mjs` has placeholder `site: 'https://commonground.page'`.
- GitHub repo URL for `§09` "Build with us" CTA — currently links to `/docs` as a safe fallback.
- Confirmation whether `/covenant` is superseded by `commonground-constitution-v3.md` — both routes exist.

## Next steps

1. Pick a domain and update `astro.config.mjs`.
2. Connect the repo to Cloudflare Pages, build from `site/`.
3. Decide on the "Build with us" CTA destination.
4. Resolve the /covenant question.
