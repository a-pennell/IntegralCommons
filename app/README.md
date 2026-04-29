# CommonGround

A structured deliberation system for small-group governance. Built on three first-class objects — Issues, Perspectives, and Decision Records — with liquid delegation, per-Issue quorum tracking, and a two-tier constitutional framework.

**License:** AGPL-3.0 — copyleft including network-use provision. See `LICENSE`.

---

## Quickstart (local development)

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment config
cp app/.env.example app/.env.local

# 3. Boot Postgres + Mailhog
docker compose -f app/docker-compose.yml up -d

# 4. Run migrations
pnpm --filter app db:migrate

# 5. Seed development fixtures
pnpm --filter app tsx scripts/seed-dev.ts

# 6. Start the dev server
pnpm app:dev
```

Open http://localhost:3000. Log in with any email; the magic link is captured in Mailhog at http://localhost:8025.

---

## Self-hosting

### Requirements

- Node.js 22 LTS
- PostgreSQL 16+
- An SMTP server (or Resend API key)

### Environment variables

See [`app/.env.example`](.env.example) for the full list. Minimum required:

| Variable | Description |
|---|---|
| `DATABASE_URL` | `postgres://user:pass@host:5432/dbname` |
| `SESSION_SECRET` | 32+ bytes random hex — used to sign session cookies and export URLs |
| `EMAIL_ADAPTER` | `mailhog` (dev) \| `smtp` \| `resend` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | When `EMAIL_ADAPTER=smtp` |
| `RESEND_API_KEY` | When `EMAIL_ADAPTER=resend` |

### Docker Compose (single-server)

```bash
docker compose -f app/docker-compose.yml up -d
```

This boots three services: `app` (Next.js + pg-boss worker), `postgres`, and `mailhog`. Swap Mailhog for your SMTP adapter in production.

### Database

Migrations run automatically on startup when `DATABASE_AUTO_MIGRATE=true`. For controlled upgrades, run:

```bash
pnpm --filter app db:migrate
```

---

## Architecture

```
Browser → Next.js 15 (App Router)
           ├── Server Components (reads)
           ├── Server Actions (writes, Zod-validated)
           └── Service layer (app/src/server/)
                ├── Drizzle → PostgreSQL 16
                ├── pg-boss (background jobs)
                └── EmailAdapter (Mailhog / SMTP / Resend)
```

Key directories:

- `src/server/` — domain services (issues, perspectives, decisions, delegations, quorum, …)
- `src/db/schema/` — Drizzle table definitions (21 tables)
- `src/server/constitution/` — CR-001 through CR-012 predicates (pure functions)
- `tests/constitutional/` — one test file per CR; failing blocks merge
- `tests/integration/` — Vitest + testcontainers Postgres
- `tests/e2e/` — Playwright against the running server

---

## Tests

```bash
# Unit
pnpm --filter app test

# Integration (needs Docker)
pnpm --filter app test:integration

# Constitutional (needs Docker)
pnpm --filter app test:constitutional

# End-to-end (needs running server + seeded DB)
RUN_E2E=true pnpm --filter app test:e2e
```

---

## Background worker

The pg-boss worker runs in the same Docker image with a separate entrypoint:

```bash
pnpm --filter app worker
```

Jobs: `email-dispatch`, `quorum-check` (every 15 min), `stability-check`, `digest`.

---

## Export

Members may export their own data at any time (CR-002 — exit rights are unconditional):

```bash
pnpm --filter app tsx scripts/export-bundle.ts \
  --member-id <ULID> \
  --own-data
```

Space-wide export (requires a finalized Decision Record authorizing it):

```bash
pnpm --filter app tsx scripts/export-bundle.ts \
  --member-id <ULID> \
  --space-id <ULID> \
  --dr-id <ULID>
```
