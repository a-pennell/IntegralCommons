# Implementation Plan: CommonGround v1 (Phase 1 MVP)

## Metadata
- Feature ID: 001-commonground
- Spec: `.sdd/specs/001-commonground/spec.md` (v1, 468 lines, 0 clarifications outstanding)
- Phase: 2 (Plan)
- Date: 2026-04-21
- Status: Draft

---

## Summary

This plan translates the CommonGround v1 specification into an implementable technical design. The spec defines WHAT: a structured deliberation system for small-group governance, built on three first-class objects (Issues, Perspectives, Decision Records), a three-tier quorum model, per-Issue liquid delegation, and a two-tier constitutional framework. This plan defines HOW: a single Next.js 15 monolith, backed by PostgreSQL 16 via Drizzle, delivered as a Docker-Compose self-host bundle with an optional hosted reference on Fly.io / Railway.

The plan covers the Phase 1 surface in full: FR-001 through FR-053 (all 53 functional requirements), NFR-001 through NFR-015 (all 15 non-functional requirements), and CR-001 through CR-012 (all 12 constitutional requirements). Every FR and CR maps to a named module in the `app/src/server/` tree; every Tier 1 CR is enforced at the database layer where structurally possible, at the service layer otherwise, and covered by a dedicated constitutional test suite regardless.

The plan explicitly defers: AI perspective auto-classification, decision methods beyond consent, federation, passkey auth, SSO, governance-profile templates, automated diversity-of-participation detection (Clarification #11 — fallback is visibility-without-algorithm), and cross-module ICOS integrations (Personal Vault, Conflict Repair, Knowledge Commons, Stewardship, Ecological Commons, Federated AI Guide). These appear in Phase 2 / Phase 3 work items, not here.

Phase 1 is sized at 12–14 weeks of focused build plus hardening, broken into five deployable milestones (M1–M5). Each milestone terminates in a running, testable vertical slice. The marketing site at `site/` is untouched; CommonGround lives as a sibling directory at `app/` with its own deploy target.

The plan is written to be read top-to-bottom once, then used as a reference during `tasks.md` generation. It is prescriptive about boundaries and invariants, and deliberately light on concrete UI work — that belongs to later phases once the kernel compiles.

---

## Technical Context

All technology choices below are locked. Each is justified against a specific NFR, CR, or PRD constraint. No choice is provisional.

### Framework — Next.js 15 (App Router, React Server Components)
- **Rationale:** The dominant read path in CommonGround is an Issue page (scope, structured sections, perspectives list, civic-memory timeline, decision record). That page is 95% server-rendered, 5% interactive. React Server Components are a near-perfect fit: heavy read data is assembled on the server, streamed as HTML, and the client bundle stays small. This directly serves NFR-011 (text-first, low-compute).
- **Typescript strict mode:** mandatory. Every schema boundary (server action inputs, API responses, database rows) is typed end-to-end via Zod inference + Drizzle inference.
- **Server Actions** handle Perspective / Decision Record / Delegation writes, removing the need for a parallel REST layer. The Zod schemas in `contracts/` are the shared source of truth for validation.

### Runtime — Node.js 22 LTS
- **Rationale:** Current LTS line through April 2027. Stable `node:test`, stable `fetch`, native `--watch`. Matches self-host expectations (widely packaged, well-documented).

### Database — PostgreSQL 16+
- **Rationale:** The data model leans heavily on referential integrity, ENUMs, CHECK constraints, partial unique indexes, row-level triggers for append-only civic memory, and a JSONB column for governance profiles. SQLite cannot express the full constitutional layer at the database level; Postgres can. Also enables `pg-boss` queue without a second datastore dependency (see below) — directly serving NFR-008 (self-hostable, no Redis required).

### ORM — Drizzle
- **Rationale:** Type-safe, SQL-first. Schema-as-TypeScript, migrations via `drizzle-kit`. Prisma's query engine binary is a sharp edge for self-hosters (ARM vs x86 builds, Alpine vs glibc); Drizzle is a pure TypeScript library. Fits NFR-008 and NFR-011. Also: Drizzle's `sql` template lets us drop down to raw SQL where constitutional invariants need a trigger or a partial index, without fighting the ORM.

### Auth — email + magic-link
- **Rationale:** NFR-014 is explicit: email + magic-link, no passwords, no SSO in Phase 1.
- **Implementation:** see `research.md`. Final call in the research doc; stack-level shape is: a `magic_link_tokens` table + a `sessions` table + server actions `requestMagicLink()` and `verifyMagicLink()`. Tokens are single-use, 15-minute TTL, SHA-256-hashed at rest.

### Email delivery — adapter pattern
- **Rationale:** NFR-008 requires self-hostability. A hard Resend dependency would break self-hosters. So email is a `EmailAdapter` interface with three concrete implementations: `ResendAdapter` (hosted reference), `SmtpAdapter` (self-hosters with their own SMTP), `MailhogAdapter` (dev / Docker Compose). Selected at boot via `EMAIL_ADAPTER` env var.

### Styling — Tailwind CSS v4
- **Rationale:** Matches the marketing site at `site/` (consistent dev ergonomics across the repo). V4's Oxide engine is fast enough to not need a build watcher in dev.

### UI primitives — shadcn/ui (Radix-backed)
- **Rationale:** Radix provides keyboard handling, focus management, and ARIA-correct primitives out of the box. This is the cheapest path to NFR-012 (WCAG 2.2 AA). shadcn's copy-paste philosophy keeps the app dependency-light (no megabyte UI library).

### Validation — Zod at every boundary
- **Rationale:** Every server action, every API route, every job handler input, every inbound email payload is parsed through a Zod schema before entering the service layer. The service layer may then trust its inputs. This is the keystone of our error-taxonomy (see Error Handling section).

### Testing — Vitest + Playwright
- **Vitest** for unit (pure logic: quorum math, rate-limit math, constitutional predicates) and integration (against an ephemeral Postgres via `@testcontainers/postgresql`).
- **Playwright** for end-to-end covering the P1 user-story set (Bootstrap → Issue → Perspective → Decision Record → Civic Memory).
- **Dedicated constitutional test suite** (`app/tests/constitutional/`) attempts to violate every CR and asserts the system refuses. This suite is gated in CI: a failing constitutional test cannot merge.

### Rich text / markdown — plain Markdown only (Phase 1)
- **Rationale:** No WYSIWYG. Author input is a `<textarea>` with a Markdown live preview. Rendering uses `remark` + `rehype-sanitize` server-side. This is deliberately low-friction and directly serves NFR-004 (clarity over expressiveness) and NFR-011.

### Background jobs — pg-boss
- **Rationale:** Postgres-native queue (uses `SKIP LOCKED`). No Redis required — that's the decisive factor for NFR-008. Handles rhythm digests (FR-044), scheduled stability-period checks (CR-008), quorum extension / stall transitions (FR-038, FR-039), and asynchronous email dispatch. See `research.md` for alternatives considered.

### Deployment
- **Self-host:** single Docker Compose file at `app/docker-compose.yml` with three services: `app` (Next.js), `postgres` (Postgres 16), and `mailhog` (dev SMTP capture). Production self-hosters swap `mailhog` for a real SMTP provider via the `SmtpAdapter`.
- **Hosted reference:** Fly.io or Railway. Not Vercel — Vercel's serverless functions don't fit pg-boss's long-running worker model, and AGPL+serverless-platform is a values-alignment miss. Single-region Postgres colocation keeps p95 latency inside NFR-013.
- **Marketing site:** continues on Cloudflare Pages via the existing `site/` Astro project; unaffected by this plan.

### Observability
- **Logs:** `pino` structured JSON; one logger per request, trace-id propagated through server actions and pg-boss jobs.
- **Traces:** OpenTelemetry, emitted over OTLP. Off by default for self-hosters (set `OTEL_EXPORTER_OTLP_ENDPOINT` to enable). Hosted reference points at a Honeycomb-free-tier or similar.
- **No product analytics.** NFR-001 and the manifesto both rule out engagement tracking. The only usage signals collected are quorum counts (which are a product feature, not analytics).

### License
- **AGPL-3.0** (NFR-007). Copyleft including network-use provision.

---

## Architecture Overview

CommonGround is a single Next.js 15 application. Not a microservice mesh. Not a distributed monolith. One deployable unit plus a Postgres database plus a pg-boss worker process (which runs inside the same Node image — the image just has two entry points: `next start` and `node ./dist/worker.js`).

```
┌──────────────────────────────────────────────────────────┐
│                       Browser                            │
│       (React Server Component payloads + minimal JS)     │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────┐
│                   Next.js 15 (app/)                      │
│  ┌────────────────────┐      ┌───────────────────────┐   │
│  │  Server Components │      │   Server Actions      │   │
│  │  (read paths)      │      │   (write paths)       │   │
│  └─────────┬──────────┘      └───────────┬───────────┘   │
│            │                             │               │
│            ▼                             ▼               │
│  ┌──────────────────────────────────────────────────┐    │
│  │                 Service Layer                    │    │
│  │  spaces / issues / perspectives / decisions /    │    │
│  │  delegations / quorum / civic-memory / export /  │    │
│  │  constitution (enforcement) / governance-config  │    │
│  └────────────────────────┬─────────────────────────┘    │
│                           │                              │
│         ┌─────────────────┼─────────────────┐            │
│         ▼                 ▼                 ▼            │
│  ┌────────────┐   ┌───────────────┐   ┌───────────────┐  │
│  │  Drizzle   │   │ EmailAdapter  │   │  pg-boss      │  │
│  │            │   │ (Resend/SMTP/ │   │  (enqueue)    │  │
│  │            │   │   Mailhog)    │   │               │  │
│  └─────┬──────┘   └───────┬───────┘   └───────┬───────┘  │
└────────┼──────────────────┼───────────────────┼──────────┘
         │                  │                   │
         ▼                  ▼                   ▼
   ┌─────────────┐    ┌──────────┐     ┌────────────────┐
   │ PostgreSQL  │    │  SMTP /  │     │  pg-boss       │
   │     16      │    │  Resend  │     │  worker (same  │
   │             │    │          │     │  Node image)   │
   └─────────────┘    └──────────┘     └────────┬───────┘
         ▲                                      │
         └──────────────────────────────────────┘
                   (jobs poll Postgres)
```

Key architectural commitments:

1. **Read-heavy paths are Server Components.** Issue list, Issue detail, Civic Memory timeline, Space home — all rendered server-side, streamed to the client. This keeps the JS bundle small (NFR-011) and the keyboard navigation simple (NFR-012).
2. **Write paths are Server Actions.** Zod-parsed at the boundary. Every action returns a typed `Result<Ok, ErrorTaxonomy>` shape — no thrown exceptions crossing the boundary.
3. **The service layer is the trusted boundary.** By the time a function in `app/src/server/<module>/` runs, inputs have been validated. The service layer enforces business rules (including all CRs) and speaks Drizzle to the database.
4. **The decision-method module is pluggable.** A `DecisionMethod` interface with one concrete implementation in Phase 1 (`ConsentMethod`). Phase 2 adds siblings without touching the Issue pipeline.
5. **Adapters at external edges:** `EmailAdapter`, `AIAdapter` (Phase 2 stub in Phase 1 — the interface exists, the `NullAIAdapter` is the only Phase 1 implementation), `StorageAdapter` (Phase 1 writes to the local filesystem or S3-compatible; only ever used for export bundles).
6. **pg-boss jobs are idempotent by design.** A job's effect is a row write with a unique key (e.g., `DigestDelivery(member_id, scheduled_for)`). Re-running a job is a no-op.

---

## Module Boundaries

Each module lives at `app/src/server/<module>/` with an `index.ts` exporting only the public surface. Internal helpers stay file-local. This is enforced by ESLint `no-restricted-imports`.

- `auth/` — magic-link issue + verify, session creation, session lookup. Owns `magic_link_tokens` and `sessions` tables. Satisfies: NFR-014.
- `spaces/` — Space lifecycle (create, rename, configure), membership records, invitations, invite acceptance. Owns `spaces`, `memberships`, `invitations` tables. Satisfies: FR-001, FR-002, FR-003, FR-004.
- `issues/` — Issue CRUD, status state machine (Open → Exploring → Decided → Reopened → Archived), scope-tag resolution (CR-007 hybrid rule), structured sections, navigation-over-feed presentation. Owns `issues`, `issue_sections`, `issue_scope_tags` (or jsonb — see data-model.md). Satisfies: FR-010 through FR-016, CR-007.
- `perspectives/` — Perspective CRUD, taxonomy tagging, one-level-deep response constraint, direct-experience flag. Owns `perspectives`. Satisfies: FR-017 through FR-022.
- `decisions/` — Decision Record drafting, finalization, versioning. Consent-method adapter. Owns `decision_records`. Satisfies: FR-014, FR-023, FR-024, FR-046, FR-047, FR-048, FR-049.
- `delegations/` — Grant, revoke, list delegations. Per-Issue and space-wide. Owns `delegations`. Satisfies: FR-027, FR-028, FR-029, FR-030, CR-005.
- `referenda/` — Initiate, deliberate, vote, close referenda; targeting delegations or decisions. Owns `referenda`. Satisfies: FR-030, FR-031, FR-033, FR-034, CR-006, CR-008, CR-010.
- `quorum/` — Three-tier quorum tracking (awareness / participation / decision), stall transition, extension period. Owns `quorum_states`. Satisfies: FR-035 through FR-039, CR-011.
- `civic-memory/` — Append-only timeline events. Database privileges: INSERT and SELECT only, no UPDATE or DELETE (enforced at the Postgres role level). Owns `timeline_events`. Satisfies: FR-025, FR-026.
- `digest/` — Rhythm-based digest generator. pg-boss scheduled job, per-member cadence. Owns `digest_deliveries`. Satisfies: FR-042, FR-043, FR-044, FR-045, NFR-001, NFR-005.
- `export/` — Own-data export (zero gate, always available) + space-wide export (gated by Issue-driven authorization). Satisfies: FR-050, FR-051, NFR-010, CR-002, CR-003.
- `governance-config/` — Per-Space configurable thresholds, scope-tag vocabulary, taxonomy vocabulary. All changes routed through Issues (FR-004, FR-053). Owns fields on `spaces.governance_profile` (JSONB). Satisfies: FR-036, FR-048, FR-052, FR-053, CR-009.
- `constitution/` — Runtime enforcement of CR-001 through CR-012. Pure-function predicates called by the other modules; does not own any tables. Satisfies: all CRs.
- `rate-limits/` — Per-member rate buckets. Checked by `referenda/` and `issues/`. Owns `rate_limit_buckets`. Satisfies: FR-032, CR-009.

**Module non-goals (deliberate):**

- No `users/` module — there is no user concept distinct from Member + Session.
- No `admin/` module — there is no admin role (FR-003).
- No `notifications/` module — notifications are not a product concept (FR-042, NFR-001); digests are the only outbound push.
- No `analytics/` module — explicitly excluded by NFR-001, NFR-005, NFR-006.

---

## Project Structure

```
/Users/andrewpennell/Projects/ICOS/
├── site/                        (existing Astro marketing site, unchanged)
├── docs/                        (existing product / governance docs)
├── .sdd/
│   └── specs/
│       └── 001-commonground/
│           ├── spec.md
│           ├── plan.md          ← this file
│           ├── data-model.md
│           ├── research.md
│           └── contracts/
│               ├── README.md
│               ├── auth.ts
│               ├── spaces.ts
│               ├── issues.ts
│               ├── perspectives.ts
│               ├── decisions.ts
│               ├── delegations.ts
│               ├── referenda.ts
│               └── export.ts
└── app/                         ← NEW: CommonGround application
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── drizzle.config.ts
    ├── docker-compose.yml
    ├── Dockerfile
    ├── .env.example
    ├── drizzle/
    │   └── migrations/          ← generated SQL migrations
    ├── public/
    └── src/
        ├── app/                 ← Next.js App Router
        │   ├── layout.tsx
        │   ├── page.tsx
        │   ├── (marketing)/     ← optional app-root landing; separate from site/
        │   ├── (auth)/
        │   │   ├── login/
        │   │   └── verify/
        │   ├── spaces/
        │   │   ├── page.tsx              (member's space list)
        │   │   └── [spaceSlug]/
        │   │       ├── page.tsx          (space home, issue navigation)
        │   │       ├── bootstrap/
        │   │       ├── issues/
        │   │       │   ├── page.tsx      (issue list, by status)
        │   │       │   ├── new/
        │   │       │   └── [issueSlug]/
        │   │       │       ├── page.tsx  (issue detail)
        │   │       │       ├── perspectives/
        │   │       │       ├── decision/
        │   │       │       └── timeline/
        │   │       ├── delegations/
        │   │       ├── referenda/
        │   │       └── settings/         (all settings are read-only views of
        │   │                              governance_profile; edits route to issues)
        │   └── api/
        │       └── health/
        ├── server/              ← service layer (trusted boundary)
        │   ├── auth/
        │   ├── spaces/
        │   ├── issues/
        │   ├── perspectives/
        │   ├── decisions/
        │   ├── delegations/
        │   ├── referenda/
        │   ├── quorum/
        │   ├── civic-memory/
        │   ├── digest/
        │   ├── export/
        │   ├── governance-config/
        │   ├── constitution/     ← pure predicates, no DB ownership
        │   ├── rate-limits/
        │   └── jobs/             ← pg-boss job definitions + scheduler
        │       ├── worker.ts
        │       ├── digest-job.ts
        │       ├── quorum-check-job.ts
        │       ├── stability-check-job.ts
        │       └── email-dispatch-job.ts
        ├── db/
        │   ├── schema/           ← one file per table, composed in index.ts
        │   ├── index.ts          ← drizzle client
        │   ├── enums.ts          ← PostgreSQL enum types
        │   └── triggers.sql      ← raw SQL for append-only civic-memory enforcement
        ├── lib/
        │   ├── adapters/
        │   │   ├── email/
        │   │   │   ├── types.ts
        │   │   │   ├── resend.ts
        │   │   │   ├── smtp.ts
        │   │   │   ├── mailhog.ts
        │   │   │   └── index.ts   ← selectAdapter() based on env
        │   │   ├── ai/
        │   │   │   ├── types.ts
        │   │   │   └── null.ts    ← Phase 1 no-op
        │   │   └── storage/
        │   │       ├── types.ts
        │   │       ├── local.ts
        │   │       └── s3.ts
        │   ├── result.ts          ← Result<Ok, Err> helper
        │   ├── errors.ts          ← error taxonomy definitions
        │   ├── logger.ts          ← pino instance
        │   ├── telemetry.ts       ← OpenTelemetry setup
        │   └── markdown.ts        ← remark + rehype-sanitize pipeline
        ├── contracts/             ← Zod schemas imported by both UI and server
        │   └── (mirrors .sdd/specs/001-commonground/contracts/)
        ├── components/            ← React + shadcn/ui components
        └── styles/
            └── globals.css
    ├── tests/
    │   ├── unit/                 ← vitest, pure logic
    │   ├── integration/          ← vitest + testcontainers Postgres
    │   ├── constitutional/       ← dedicated CR enforcement suite
    │   │   ├── cr-001-removal.test.ts
    │   │   ├── cr-002-commons-protection.test.ts
    │   │   ├── cr-003-forkability.test.ts
    │   │   ├── cr-004-bootstrap.test.ts
    │   │   ├── cr-005-revocability.test.ts
    │   │   ├── cr-006-bounded-referendum.test.ts
    │   │   ├── cr-007-scope-subsidiarity.test.ts
    │   │   ├── cr-008-temporal-stability.test.ts
    │   │   ├── cr-009-rate-limiting.test.ts
    │   │   ├── cr-010-deliberation-first.test.ts
    │   │   ├── cr-011-participation-integrity.test.ts
    │   │   └── cr-012-conflict-resolution.test.ts
    │   └── e2e/                  ← playwright, P1 story coverage
    │       ├── us1-founder-bootstrap.spec.ts
    │       ├── us2-member-orients.spec.ts
    │       ├── us3-create-issue.spec.ts
    │       ├── us4-add-perspective.spec.ts
    │       └── us5-decision-record.spec.ts
    └── scripts/
        ├── seed-dev.ts            ← deterministic dev fixture
        └── export-bundle.ts       ← CLI for space-wide export dry-runs
```

The `app/src/contracts/` directory contains copies (or symlinks) of the Zod schemas developed in `.sdd/specs/001-commonground/contracts/`. The SDD-owned contracts are the source of truth; the app imports them. (Open question for tasks phase: monorepo via pnpm workspace vs. copy-on-commit via a small script. See "Open Questions" below.)

---

## Error Handling & Validation Strategy

### Boundary model

```
Untrusted input  →  Zod parse  →  Service layer (trusted)  →  Drizzle  →  DB
       ^               |                  |                      |
       |               ▼                  ▼                      ▼
    reject       ValidationError    Typed domain errors      DB errors wrapped
                                                             as InternalError
```

Three rules:
1. Nothing crosses the service-layer boundary without a Zod parse.
2. The service layer returns `Result<Ok, AppError>` — it never throws for expected errors.
3. The only errors that propagate as thrown exceptions are genuinely internal bugs (null deref, invariant violation inside the service layer). These surface as 500s with a trace ID and never leak details to the UI.

### Error taxonomy

Defined in `app/src/lib/errors.ts` as a discriminated union:

- `ValidationError` — Zod parse failed. UI: inline field error.
- `NotAuthenticated` — no valid session. UI: redirect to `/login`.
- `NotAuthorized` — session valid, but actor lacks capability (e.g., not the Issue's delegated facilitator). UI: explanation of who holds the needed delegation, with a link to view it.
- `ConstitutionalViolation` — the requested action would breach a CR. UI: dedicated dialog citing the principle number and short explanation. Never silently refused.
- `QuorumNotMet` — action requires awareness/participation/decision quorum that isn't reached. UI: current counts vs. thresholds, next cadence checkpoint.
- `RateLimited` — CR-009 bucket full. UI: the cadence (e.g., "you've initiated your 1 referendum for this 7-day window") + the unlock time.
- `StabilityPeriodActive` — CR-008 prevents challenge. UI: days remaining and the exceptional-conditions threshold.
- `NotFound` — resource id doesn't exist or isn't visible to this actor.
- `Conflict` — optimistic concurrency loss (e.g., two facilitators finalizing the same Decision Record). UI: reload and reconcile.
- `InternalError` — thrown and caught at the action boundary; logged with trace ID.

Each error variant carries enough structured data to render the UI without re-querying.

### Input validation rules of thumb
- Markdown body fields: length cap (10,000 chars for Perspective body, 20,000 for Decision Record narrative fields), server-side sanitization via `rehype-sanitize` with a conservative allowlist.
- Email: validate with Zod `.email()`, then normalize (lowercase, trim).
- Slugs: derived server-side from titles; member cannot supply raw slugs.
- Timestamps: always UTC, server-generated. Client never sends timestamps.

---

## Security & Privacy Considerations

### Authentication
- **Magic-link tokens:** 15-minute TTL, single-use (consumed_at is set on first redemption), stored only as SHA-256 hash, never as plaintext. Rotated on every login — no token reuse across sessions.
- **Sessions:** secure httpOnly cookies, `SameSite=Lax`, 30-day sliding expiry (every request refreshes `last_used_at`), session ID is a 256-bit random value, not a JWT (simpler revocation).
- **Session revocation** works because the session table is the source of truth; there's no stateless token to re-verify against a blacklist.

### Authorization
- All capability checks run in the service layer, never the UI. The UI may hide affordances the member can't use, but the server re-checks every mutation.
- **Subject-member-may-not-vote rule (CR-001):** enforced at the service layer by a guard in `referenda/castVote()`. A subject member may submit Perspectives on their own removal but `castVote()` returns `ConstitutionalViolation` with CR-001 citation.
- **Export authority (FR-050):**
  - Own-data export bypasses all gating — a member's session alone is sufficient. This is enforced by the `export/own.ts` service, which only queries rows where `author_id = currentMemberId`.
  - Space-wide export requires an active delegation tied to an Issue whose Decision Record granted the export. No shortcut path.

### PII handling
- Logs never include email addresses, display names, Perspective bodies, or Decision Record text. Logger has an allowlist of safe fields (trace ID, member ID, issue ID, action name, timing, outcome).
- Exports include PII by design (that's the point). They are authenticated downloads, never public URLs. Expiring signed URLs (1 hour).

### CSRF
- Next.js server actions include built-in CSRF protection (origin check + action id). We rely on this; we do not roll our own.

### Rate limiting
- CR-009 is the product-level rate limit. A second, infrastructure-level rate limit protects against brute force on magic-link requests: 5 per email per hour, 20 per IP per hour.

### No per-member aggregate scoring
- Principle inherited from `docs/kindred-design-principles.md §6`. The system does not compute any per-member metric (reputation, trust, activity score, etc.). Quorum counts are per-Issue and transient; they do not accumulate.

### Deletion vs. removal
- "Right to be forgotten": `members.email` and `members.display_name` are nullable; deletion sets them to null and writes a TimelineEvent `member_removed` on every Space the member participated in. Their Perspectives and Decision Record contributions remain — redacted to `[removed member]` — because erasing them would corrupt the Civic Memory record (and violate CR-002). This trade-off is called out in the privacy notice; it matches the PRD's stance.

---

## Testing Strategy

### Unit (Vitest)
- Pure-function logic: quorum math, rate-limit bucket arithmetic, constitutional predicates, markdown sanitization, scope-tag resolution.
- Fast (<3s for the whole suite), runs on every save in dev.

### Integration (Vitest + testcontainers)
- Ephemeral Postgres container per test file; schema migrated fresh; data seeded deterministically.
- Covers every service-layer entry point with the actual database underneath.
- CI runtime target: <5 minutes for the full integration suite.

### Constitutional (Vitest, dedicated suite)
- For each of CR-001 through CR-012, at least one test that attempts a violation and asserts the system refuses.
- Example: `cr-005-revocability.test.ts` writes a delegation with `revoked_at=null`, then calls `delegations.revoke()`, then calls `delegations.revoke()` again — expected: first succeeds, second is a no-op. Then attempts to insert a delegation with a non-existent `irrevocable=true` flag — expected: compile error (the column doesn't exist, by design).
- Marked as a required CI check; PR merge blocked if any constitutional test fails.

### E2E (Playwright)
- Covers the P1 user-story set (US1 through US5) end to end.
- Runs against a Docker-Compose-provided Postgres + the real Next.js dev server.
- Storage state is reset between suites; no shared fixtures across specs.

### What we do NOT test
- Visual regression (too expensive for the value at this stage).
- Load / performance beyond NFR-013's p95 targets validated by a simple `autocannon` run in CI.
- Cross-browser beyond Chromium + Firefox via Playwright.

---

## Phased Delivery Within Phase 1

Five milestones. Each milestone is a deployable slice — we could ship it to a pilot group and it would be incomplete but not broken. No milestone blocks the next by more than its own duration.

### M1 — Auth + Spaces + Membership (Week 1–2)
- Email magic-link flow working end-to-end with Mailhog in dev.
- Space create + invite + accept.
- Member baseline capability model.
- Database schema through `memberships`, `magic_link_tokens`, `sessions`, `invitations`.
- **FR coverage:** FR-001, FR-002, FR-003. **NFR:** NFR-014.
- **Deployable outcome:** A founder can create a Space and invite three members who can log in and see it. Nothing else.

### M2 — Issues + Perspectives + Civic Memory read model (Week 3–5)
- Issue CRUD + status state machine (write paths for Open/Exploring only).
- Structured sections (problem framing, constraints, stakeholders, facts, questions).
- Perspective CRUD with taxonomy tagging + one-level-deep response.
- TimelineEvent table, append-only trigger, civic-memory UI on Issue detail page.
- **FR coverage:** FR-010 through FR-022 (except FR-014, FR-015 — those need Decision Records), FR-025.
- **Deployable outcome:** A Space can reason about a question with structured Perspectives, but cannot yet decide anything.

### M3 — Decision Records + consent method + delegation (Week 6–8)
- `DecisionMethod` interface + `ConsentMethod` implementation.
- Decision Record drafting + finalize with all five required fields (FR-023).
- Issue status transition to Decided + Reopened + Archived (FR-012, FR-013, FR-014, FR-015).
- Per-Issue delegation grant / revoke.
- Bootstrap flow (FR-005 through FR-009).
- **FR coverage:** FR-014, FR-015, FR-023, FR-024, FR-027, FR-028, FR-029, FR-046, FR-047, FR-049. **CR:** CR-004, CR-005.
- **Deployable outcome:** A Space can Bootstrap and then govern a single Issue end-to-end: Open → Exploring → Decided with a Decision Record.

### M4 — Quorum + rate limits + referenda + rhythm digest + export (Week 9–12)
- Three-tier quorum tracking + UI counts (FR-035, FR-036, FR-037).
- Extension / stall mechanism (FR-038, FR-039).
- pg-boss worker spun up; scheduled jobs for quorum checks, stability period checks, digest delivery.
- Rate-limit buckets + enforcement (FR-032, CR-009).
- Referendum lifecycle: initiate → deliberate → vote → close (FR-030 through FR-034, CR-006, CR-008, CR-010).
- Rhythm digest generator + per-member cadence override (FR-042 through FR-045).
- Own-data export + space-wide export path (FR-050, FR-051, NFR-010).
- **FR coverage:** FR-030 through FR-045, FR-050, FR-051. **CR:** CR-006, CR-008, CR-009, CR-010, CR-011. **NFR:** NFR-001, NFR-005, NFR-010.
- **Deployable outcome:** A Space can run its governance sustainably — quorum protects against silent-majority, rate limits protect against churn, referenda revoke misused delegations, digests are the only push channel, export works.

### M5 — Constitutional hardening + WCAG audit + hosted deploy (Week 13–14)
- Complete constitutional test suite (all 12 CRs).
- WCAG 2.2 AA audit pass + fixes (NFR-012). Uses `axe-core` in CI + manual screen-reader pass on the P1 flow.
- Governance-profile change flow via Issue (FR-052, FR-053, US9).
- Configurable taxonomy + scope-tag vocabulary wired through (FR-022).
- Tier 1 CR enforcement on all configurable surfaces (CR-001, CR-002, CR-003).
- Conflict-resolution surfacing (CR-012) — when two deliberable principles conflict, the system opens a meta-Issue.
- Hosted reference deployment on Fly.io or Railway.
- **FR coverage:** closes remaining FR-003, FR-004, FR-052, FR-053. **CR:** all remaining CRs, especially CR-001, CR-002, CR-003, CR-007, CR-011, CR-012. **NFR:** NFR-007, NFR-008, NFR-012, NFR-013, NFR-015.
- **Deployable outcome:** Pilot-ready. A group can use this to govern real issues.

### Milestone verification gate

Each milestone ends with:
1. All prior unit + integration + constitutional tests green.
2. The milestone's new user stories executable end-to-end via Playwright.
3. A deploy to a staging Fly.io app that a human can click through.
4. A short written summary of what works and what doesn't.

No milestone is "done" without all four.

---

## Phase 2 / Phase 3 Deferred

The following are explicitly deferred and are NOT part of this plan. This list is the authoritative "not in Phase 1" roster; `tasks.md` must not generate tasks for them.

**Phase 2:**
- AI perspective auto-classification by taxonomy type.
- AI clustering of similar viewpoints.
- AI agreement-point / disagreement-typology surfacing.
- AI epistemic-uncertainty labeling.
- AI-generated editable summaries alongside manual ones.
- Additional decision methods: quadratic voting, sociocracy variants, sortition, liquid democracy, deliberative polling.
- Passkey (WebAuthn) auth.
- Richer Decision Record rationale capture beyond the five required fields.
- Automatic diversity-of-participation detection (Clarification #11). Phase 1 fallback: visibility without algorithmic judgment.

**Phase 3:**
- Governance profile templates (co-op, board, indigenous, consensus) as community-contributed presets.
- Delegation visibility dashboards and analytics beyond per-Issue timeline.
- Federation between Spaces; cross-Space Issues.
- SSO / federated identity.
- Cooperative hosting partnerships (the operational / legal side of NFR-015; the software side is present in Phase 1).
- Bridges to other ICOS modules (Personal Vault, Conflict Repair, Knowledge Commons, Stewardship, Ecological Commons, Federated AI Guide).

**Permanently excluded (not deferred):**
- Real-time notifications, badges, unread counts, urgency cues (NFR-001, FR-042).
- Gamification, leaderboards, streaks, points, engagement mechanics.
- AI that recommends decisions, ranks people, predicts outcomes, or displays support/oppose ratios.
- Anonymous mass participation / public debate at scale.
- Replacing formal legal processes.

---

## Open Questions for Tasks Phase

These cannot be answered until `tasks.md` is written; flagging them so the tasks phase owns resolving each.

1. **Contracts sharing mechanism:** pnpm workspace linking `.sdd/specs/001-commonground/contracts/` into `app/src/contracts/` vs. a copy-on-commit pre-commit hook. Workspace is cleaner but adds monorepo tooling; copy is simpler but risks drift.
2. **Ordering within M2:** build Perspective write path before Issue structured sections, or after? Perspectives unblock Playwright smoke tests faster, but structured sections are what make the Issue feel real for pilot feedback.
3. **Test-database lifecycle:** testcontainers spin up per test file (isolation, slower) vs. per test suite (faster, shared state risks). Default to per-file for integration; per-suite for E2E.
4. **Seed fixture strategy:** hand-written deterministic seed vs. faker-based randomized seed. Hand-written is easier to reason about in demos; randomized finds edge cases. Probably both: hand-written for demos, randomized for integration-test `arbitraries`.
5. **Bootstrap meta-method UI:** does Bootstrap get a bespoke wizard UI, or does it just use the regular Issue + Decision Record flow with a banner? Cheaper to use the regular flow; easier to explain with a bespoke wizard. Recommend regular flow + banner.
6. **pg-boss worker packaging:** run the worker in the same container as Next.js (simpler self-host, single process boundary) vs. separate container (cleaner separation, 2x container count). For single-server self-hosters, same-container is kinder; for hosted reference, either works. Recommend same-container with a distinct entrypoint chosen at `CMD` time.

---

## Appendix A — FR → Module ownership map

This matrix is the authoritative answer to "which module owns this requirement?" The tasks phase should use it to partition work within each milestone.

| FR | Module | Enforcement level |
|---|---|---|
| FR-001 | spaces | service |
| FR-002 | spaces | service + invitations table |
| FR-003 | spaces (no-admin invariant) | service + absence of admin column |
| FR-004 | governance-config (writes route through issues) | service |
| FR-005 through FR-009 | issues (bootstrap path) + decisions | service |
| FR-010 through FR-016 | issues | service + DB trigger (FR-014) |
| FR-017 through FR-022 | perspectives | service + DB CHECK (FR-021) |
| FR-023, FR-024 | decisions | service |
| FR-025, FR-026 | civic-memory | DB role privilege (append-only) |
| FR-027 through FR-030 | delegations | service |
| FR-031 through FR-034 | referenda | service + rate-limits integration |
| FR-035 through FR-039 | quorum + scheduled job | service + pg-boss |
| FR-040, FR-041 | civic-memory (official summaries) | service |
| FR-042 through FR-045 | digest | scheduled job |
| FR-046 through FR-049 | decisions (consent method) | service |
| FR-050, FR-051 | export | service + `own-data` always-on guard |
| FR-052, FR-053 | governance-config | service |

## Appendix B — CR → Enforcement mechanism map

| CR | Enforcement mechanism | Module |
|---|---|---|
| CR-001 (Removal due process) | service guard in `referenda.castVote()` (subject may not vote); `Membership.departure_issue_id` captures legitimacy | constitution + referenda + spaces |
| CR-002 (Commons protection) | predicate set in `constitution/cr002-predicates.ts`; blocks DR finalize | constitution + decisions |
| CR-003 (Forkability) | architectural — `export` always produces full-featured bundles; E2E test reimports | export |
| CR-004 (Bootstrap) | `is_bootstrap` flag + hardcoded `ConsentMethod` regardless of Space config | issues + decisions |
| CR-005 (Revocability) | **structural:** no `irrevocable` column anywhere | delegations |
| CR-006 (Bounded referendum) | `ReferendumSupporter` threshold check at initiate | referenda |
| CR-007 (Scope + subsidiarity) | hybrid rule resolver: `scope_tags` auto-include + self-declare | issues + referenda |
| CR-008 (Temporal stability) | service guard in `referenda.initiate()` + stability-check job | referenda + scheduled job |
| CR-009 (Rate limiting) | `RateLimitBucket` table + service guards | rate-limits |
| CR-010 (Deliberation first) | referendum state machine: `voting_started_at > deliberation_started_at + min` | referenda |
| CR-011 (Participation integrity) | three-tier quorum tracking | quorum |
| CR-012 (Conflict resolution) | service guard that opens a meta-Issue when two deliberable principles collide | constitution |

## Self-review notes (for the reviewer of this plan)

- Every FR from the spec maps to a module in "Module Boundaries" and is listed in Appendix A. Checked: FR-001 through FR-053 all have an owner.
- Every CR from the spec maps to either a DB-level constraint (where structurally expressible), a service-layer guard, or the constitutional test suite — see Appendix B.
- Every NFR maps to a specific technology choice in "Technical Context" or a section in this document.
- Every P1 user story (US1–US5) is covered by an M1–M3 milestone; every P2 story (US6, US7, US8, US10, US11) is covered by M4 or M5; the P3 story (US9) is covered by M5.
- No spec FR / CR is unowned.
- The stack choice does not contradict any NFR. NFR-008 (self-hostable) is the tightest constraint; pg-boss instead of Redis is the decisive accommodation.

---

*End of plan. The data model below (`data-model.md`) and the contract stubs (`contracts/`) are the other two artifacts this phase produces.*
