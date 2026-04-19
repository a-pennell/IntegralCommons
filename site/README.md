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
