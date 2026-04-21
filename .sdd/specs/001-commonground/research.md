# Research Notes: CommonGround v1 Phase 2 Plan

## Metadata
- Feature ID: 001-commonground
- Phase: 2 (Plan)
- Date: 2026-04-21
- Scope: three non-obvious technology choices in `plan.md`

---

## 1. Auth library — magic-link implementation

### Context
NFR-014 mandates email + magic-link as the Phase 1 identity primitive. We need a maintained library or a justifiable roll-your-own.

### Options considered

**Lucia Auth (v3):** Lucia was the canonical TypeScript session-auth library through 2024. As of early 2025, the maintainer (pilcrowOnPaper) announced Lucia v4 would not ship and recommended users either migrate to `better-auth` or adopt Lucia's patterns directly without the library. The auth primitives Lucia provided (session tables, cookie handling, CSRF) are small enough to own.

**Better-auth:** A newer TypeScript-first auth library explicitly designed to fill the post-Lucia gap. Actively maintained as of 2026-Q1. Supports magic-link out of the box via a plugin. Works with Drizzle. Reasonable docs.

**Roll-your-own:** The magic-link + session flow is ~300 lines of code: request handler that generates token, hashes it, writes to `magic_link_tokens`, dispatches email; verify handler that looks up hash, checks expiry, consumes, creates session. We control every line, no external dep, matches the text-first / low-compute ethos of NFR-011.

### Decision: **Roll-your-own magic-link + sessions**

Rationale:
- The full surface we need is narrow: one request-link endpoint, one verify endpoint, one session middleware, one session-revoke endpoint. ~300 lines of TypeScript.
- Zero supply-chain risk on the most security-sensitive path in the app.
- No upgrade treadmill (better-auth is young; we'd be an early adopter).
- Aligns with NFR-011 (low-compute) and keeps the dependency footprint small.
- The constitutional test suite can assert the exact auth semantics we need; we're not inheriting any library's opinions.

Tradeoff: slightly more code to write up front. But the code is straightforward and well-trodden — Anthropic's own docs, OWASP cheat sheets, and Lucia's archived source all document the pattern. The test suite will cover: token single-use, token expiry, token rotation, hash-at-rest, session sliding expiry, session revocation.

### Note on better-auth

We are not ruling it out forever. If Phase 2 adds passkey support (NFR-014 allows this as additive), better-auth's passkey plugin becomes a compelling reason to adopt it wholesale. That's a Phase 2 decision, not a Phase 1 one. Phase 1 stays minimal.

---

## 2. Background job queue — pg-boss vs. Inngest vs. cron

### Context
Phase 1 needs scheduled jobs for: rhythm digest delivery (FR-044), quorum deadline checks (FR-038, FR-039), stability-period checks (CR-008), magic-link token sweeping, and async email dispatch. These must work on a self-hosted single-server deployment (NFR-008).

### Options considered

**pg-boss:** A PostgreSQL-native job queue built on `SKIP LOCKED`. Same Postgres we already have. Supports cron-style recurrence, delayed jobs, retries with backoff, priorities. Actively maintained. Single dependency.

**Inngest:** Event-driven workflow engine. Cloud-hosted free tier or self-host via Docker. More powerful (durable workflows, step functions) but introduces a second runtime and a second data store. Overkill for Phase 1's needs and violates NFR-008's spirit (the self-host story gets harder).

**Vanilla cron (via `node-cron` or OS cron):** Simplest possible. But doesn't survive process restarts gracefully (jobs scheduled in-process disappear on restart), doesn't have a retry model, doesn't scale beyond one worker. Would bite us as soon as the hosted reference deployment has more than one replica.

**BullMQ (Redis-based):** Industry standard for Node.js job queues. Fast, well-maintained. But requires Redis, which breaks NFR-008's "self-hosting group can operate without heavyweight infrastructure" constraint — now the self-host docker-compose needs a third service.

### Decision: **pg-boss**

Rationale:
- Reuses the Postgres we already have. Docker Compose stays at 2 services (app + postgres) plus optional mailhog.
- `SKIP LOCKED` is a correct, efficient primitive for this workload at our scale (5–200 members per Space, dozens of Spaces per deployment).
- Durable: jobs survive restarts. Retries built in.
- Same transaction can enqueue a job and commit a business write — powerful for "when a Perspective is added, enqueue a quorum recalc" pattern.
- MIT-licensed, actively maintained (timgit), stable API.

Tradeoff: Postgres is not a purpose-built queue. At tens of thousands of jobs/sec it would become a bottleneck. We are nowhere near that scale and would not be for at least Phase 2. If we ever need to scale past pg-boss, migrating to BullMQ or Inngest is a bounded refactor (the job interface is ours).

### Implementation notes

- One pg-boss instance per Postgres database.
- The worker process runs in the same Node image as Next.js, via a separate entrypoint (`node ./dist/worker.js`). Self-hosters launch one container that runs both (via `tini` or a minimal supervisor); hosted reference can run them as separate processes if desired.
- All jobs are idempotent by design (keyed on `DigestDelivery (member_id, space_id, scheduled_for)` etc.). Re-running a job is a no-op.
- Scheduled jobs (cron-style) are registered at boot via `pg-boss` `.schedule()` API. Recurring jobs: hourly sweep of expired magic-link tokens, daily quorum-deadline sweep, digest cadence fan-out.

---

## 3. Email adapter pattern

### Context
NFR-008 requires self-hostability without vendor lock-in. Email is inherently vendor-dependent (SMTP is a protocol; Resend, SendGrid, Postmark are vendors). We need a mechanism that lets the hosted reference use a hosted email provider while self-hosters use their own SMTP (or none, in dev).

### Design: Adapter interface + env-var selection

```typescript
// lib/adapters/email/types.ts
export interface EmailAdapter {
  name: string;
  send(message: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    headers?: Record<string, string>;
  }): Promise<{ id: string; deliveredAt: Date }>;
}
```

Three concrete implementations:

1. **`ResendAdapter`** — uses `resend` npm package. Requires `RESEND_API_KEY`. Used by the hosted reference deployment.
2. **`SmtpAdapter`** — uses `nodemailer`. Requires `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Used by self-hosters who bring their own SMTP provider (Postfix, Mailgun SMTP, etc.).
3. **`MailhogAdapter`** — a `SmtpAdapter` preconfigured for Mailhog at `mailhog:1025`, no auth. Used in dev and the default Docker Compose bundle. Lets new self-hosters see the magic-link emails in a local UI without setting up real email.

Selection logic in `lib/adapters/email/index.ts`:

```typescript
export function selectAdapter(env: NodeJS.ProcessEnv): EmailAdapter {
  switch (env.EMAIL_ADAPTER) {
    case 'resend': return new ResendAdapter(env.RESEND_API_KEY!);
    case 'smtp':   return new SmtpAdapter({...env});
    case 'mailhog':
    default:       return new MailhogAdapter();
  }
}
```

### Rationale

- **Single narrow interface** — the rest of the app (digest job, magic-link request, invitation) speaks only `EmailAdapter`. Switching providers is an env-var change.
- **No vendor-specific features leak into business code.** Resend's "audiences" feature, SendGrid's templates, etc. — all non-goals. Our templates are server-rendered React components converted to HTML + text inside the adapter caller.
- **MailHog as the default** — means a fresh `docker-compose up` gets a working dev environment with visible email. This matters a lot for onboarding contributors and self-hosters.
- **Testable** — a `NullAdapter` for unit tests records sent messages in-memory. The integration suite uses Mailhog via the testcontainers network.

### Future adapters (Phase 2+)

- `PostmarkAdapter`, `SendGridAdapter` — trivial additions if a self-hoster prefers them.
- Federated email (e.g., via ActivityPub DM): deliberately out of scope for now; would be a full rethink of the interface.

---

## Summary table

| Decision | Choice | Why |
|---|---|---|
| Auth | Roll-your-own magic-link + sessions | ~300 LOC, zero supply chain, matches NFR-011 |
| Job queue | pg-boss | Postgres-native, no Redis, NFR-008 |
| Email | Adapter + env var (Resend / SMTP / Mailhog) | NFR-008 self-host + hosted reference both served |

---

*End of research notes.*
