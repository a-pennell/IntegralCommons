# Tasks: CommonGround v1 (Phase 1 MVP)

**Prerequisites:** `spec.md` (v1, 53 FR / 12 CR / 15 NFR), `plan.md` (v1, M1–M5), `data-model.md` (21 tables), `contracts/` (8 stubs).

## Metadata
- Feature ID: 001-commonground
- Phase: 3 (Tasks)
- Date: 2026-04-21
- Target duration: 12–14 weeks, five deployable milestones

## Format

```
- [ ] [TaskID] [P?] [USx?] Description — path/location
```

- `[P]` — parallelizable (no shared files, no order dependency with siblings).
- `[USx]` — belongs to User Story x. Tasks without `[USx]` are Setup / Foundational / Polish.
- File paths are relative to `/Users/andrewpennell/Projects/ICOS/app/` unless noted.

## Milestone ↔ Phase map

| Milestone | Phases | Stories | Weeks |
|---|---|---|---|
| M1 — Auth + Spaces + Membership | 1, 2 (partial), 3 (partial), 4 | US1 (partial), US2 | 1–2 |
| M2 — Issues + Perspectives + Civic Memory read | 5, 6 | US3, US4 | 3–5 |
| M3 — Decision Records + consent + delegation + bootstrap | 3 (finish), 7 | US1 (finish), US5 | 6–8 |
| M4 — Quorum + rate limits + referenda + digest + export | 8–12 | US6, US8, US10, US11 | 9–12 |
| M5 — Constitutional hardening + WCAG + hosted deploy | 13, 14 | US7, US9 | 13–14 |

---

## Phase 1: Setup

**Purpose:** Create the `app/` workspace and lock the toolchain.

- [x] T001 Create `app/` directory at repo root, initialize `package.json` with pnpm, workspace-relative to existing `site/`
- [x] T002 [P] Add Next.js 15 with App Router, TypeScript strict, React 19 — `app/next.config.ts`, `app/tsconfig.json`
- [x] T003 [P] Add Tailwind CSS v4 config matching `site/` tokens — `app/tailwind.config.ts`, `app/src/styles/globals.css`
- [x] T004 [P] Add Drizzle + `drizzle-kit` + `pg` driver, initialize `app/drizzle.config.ts`
- [x] T005 [P] Add Vitest + `@testcontainers/postgresql` + Playwright, config files in `app/`
- [x] T006 [P] Add ESLint (flat config) with `no-restricted-imports` rule to prevent cross-module internal reach, Prettier with project preset — `app/eslint.config.js`, `app/.prettierrc`
- [x] T007 [P] Add `pino`, `zod`, `pg-boss`, `remark`, `rehype-sanitize`, `ulid` runtime deps
- [x] T008 [P] Add shadcn/ui baseline (Radix primitives) via shadcn CLI — `app/components.json`
- [x] T009 [P] Write `app/docker-compose.yml` with `app`, `postgres:16`, `mailhog` services; volumes for Postgres data
- [x] T010 [P] Write `app/Dockerfile` multi-stage (build + runtime), dual entrypoints for `next start` and `node ./dist/worker.js`
- [x] T011 [P] Write `app/.env.example` documenting every env var (DB_URL, EMAIL_ADAPTER, RESEND_API_KEY, SMTP_*, OTEL_EXPORTER_OTLP_ENDPOINT, SESSION_SECRET)
- [x] T012 [P] Add AGPL-3.0 `LICENSE` file to `app/`
- [x] T013 Wire GitHub Actions: lint + typecheck + unit + integration + constitutional, blocking merge on any red — `.github/workflows/app.yml`

**Checkpoint:** `pnpm --filter app build` succeeds, `pnpm --filter app test` runs zero tests green, Docker Compose `up` boots the three services.

---

## Phase 2: Foundational

**Purpose:** Shared infrastructure every User Story depends on. Cross-cutting wiring; no feature behaviour yet.

⚠️ Nothing in Phases 3+ can start until every task here lands.

### Database schema scaffolding

- [x] T014 Create `app/src/db/enums.ts` declaring every Postgres ENUM: `membership_status`, `issue_status`, `stall_reason`, `delegation_grant_source`, `delegation_capability`, `referendum_target`, `referendum_status`, `referendum_outcome`, `vote_choice`, `timeline_event_type`, `rate_limited_action`
- [x] T015 Create `app/src/db/index.ts` — Drizzle client, connection pool, transaction helper
- [x] T016 [P] Schema: `members` table — `app/src/db/schema/members.ts` (data-model §Member)
- [x] T017 [P] Schema: `spaces` table — `app/src/db/schema/spaces.ts`
- [x] T018 [P] Schema: `memberships` table — `app/src/db/schema/memberships.ts`
- [x] T019 [P] Schema: `invitations` table — `app/src/db/schema/invitations.ts`
- [x] T020 [P] Schema: `issues` + `issue_views` tables — `app/src/db/schema/issues.ts`
- [x] T021 [P] Schema: `perspectives` table with CHECK for single-level nesting — `app/src/db/schema/perspectives.ts`
- [x] T022 [P] Schema: `decision_records` — `app/src/db/schema/decision_records.ts`
- [x] T023 [P] Schema: `delegations` (no `irrevocable` column — structural CR-005) — `app/src/db/schema/delegations.ts`
- [x] T024 [P] Schema: `referenda`, `referendum_votes`, `referendum_supporters` — `app/src/db/schema/referenda.ts`
- [x] T025 [P] Schema: `quorum_states` — `app/src/db/schema/quorum_states.ts`
- [x] T026 [P] Schema: `timeline_events` — `app/src/db/schema/timeline_events.ts`
- [x] T027 [P] Schema: `official_summaries` — `app/src/db/schema/official_summaries.ts`
- [x] T028 [P] Schema: `rate_limit_buckets` — `app/src/db/schema/rate_limit_buckets.ts`
- [x] T029 [P] Schema: `magic_link_tokens`, `sessions` — `app/src/db/schema/auth.ts`
- [x] T030 [P] Schema: `digest_deliveries` — `app/src/db/schema/digest_deliveries.ts`
- [x] T031 Compose schema index — `app/src/db/schema/index.ts` re-exports every table
- [x] T032 Write `app/src/db/triggers.sql` — `issue_status_consistency_trigger` (FR-014) and the `civic_memory_role` grants (INSERT, SELECT only on `timeline_events`; UPDATE/DELETE revoked)
- [x] T033 Author first `drizzle-kit generate` migration + raw-SQL tail that applies `triggers.sql` post-migration — `app/drizzle/migrations/0000_initial.sql`

### Shared library

- [x] T034 [P] `app/src/lib/result.ts` — `Result<Ok, Err>` helper with `ok()`, `err()`, `isOk()`, `isErr()`, `map()`, `flatMap()`
- [x] T035 [P] `app/src/lib/errors.ts` — discriminated-union `AppError` taxonomy (ValidationError, NotAuthenticated, NotAuthorized, ConstitutionalViolation, QuorumNotMet, RateLimited, StabilityPeriodActive, NotFound, Conflict, InternalError)
- [x] T036 [P] `app/src/lib/logger.ts` — pino instance with PII allowlist (no emails, no Perspective bodies, no DR text)
- [x] T037 [P] `app/src/lib/telemetry.ts` — OpenTelemetry init, OTLP exporter, disabled when env var absent
- [x] T038 [P] `app/src/lib/markdown.ts` — remark + rehype-sanitize pipeline with conservative allowlist
- [x] T039 [P] `app/src/lib/ulid.ts` — ULID generator wrapping `ulid` dep

### Contracts package

- [x] T040 Decide contracts-sharing mechanism (plan Open Question #1). Recommended: pnpm workspace linking `.sdd/specs/001-commonground/contracts/` as `@commonground/contracts`. Update root `pnpm-workspace.yaml` + `app/package.json` dep
- [x] T041 [P] Elaborate `contracts/auth.ts` — RequestMagicLinkInput, VerifyMagicLinkInput, SessionSchema
- [x] T042 [P] Elaborate `contracts/spaces.ts` — CreateSpaceInput, InviteMemberInput, AcceptInvitationInput, RenameSpaceInput
- [x] T043 [P] Elaborate `contracts/issues.ts` — CreateIssueInput, UpdateIssueInput, TransitionStatusInput, StructuredSectionsSchema, ScopeTagsSchema
- [x] T044 [P] Elaborate `contracts/perspectives.ts` — SubmitPerspectiveInput (incl. taxonomy_type, from_direct_experience, parent_perspective_id), EditPerspectiveInput
- [x] T045 [P] Elaborate `contracts/decisions.ts` — DraftDecisionRecordInput, FinalizeDecisionRecordInput (what_text, how_method, rationale_text, unresolved_objections_text, review_date)
- [x] T046 [P] Elaborate `contracts/delegations.ts` — GrantDelegationInput, RevokeDelegationInput
- [x] T047 [P] Elaborate `contracts/referenda.ts` — InitiateReferendumInput, SupportReferendumInput, CastVoteInput, CloseReferendumInput
- [x] T048 [P] Elaborate `contracts/export.ts` — OwnDataExportRequest, SpaceExportRequest

### Adapters

- [x] T049 [P] `app/src/lib/adapters/email/types.ts` — `EmailAdapter` interface
- [x] T050 [P] `app/src/lib/adapters/email/mailhog.ts` — dev SMTP adapter
- [x] T051 [P] `app/src/lib/adapters/email/smtp.ts` — generic SMTP adapter for self-hosters
- [x] T052 [P] `app/src/lib/adapters/email/resend.ts` — hosted-reference adapter
- [x] T053 `app/src/lib/adapters/email/index.ts` — `selectAdapter()` dispatch on `EMAIL_ADAPTER` env
- [x] T054 [P] `app/src/lib/adapters/ai/types.ts` + `null.ts` — Phase 1 no-op
- [x] T055 [P] `app/src/lib/adapters/storage/types.ts` + `local.ts` + `s3.ts`

### Server-action boundary primitives

- [x] T056 `app/src/server/action.ts` — `createAction()` helper: Zod parse → service call → return `Result` serialized to typed response
- [x] T057 [P] `app/src/server/auth/session.ts` — `getSession()`, `requireSession()`, cookie read/write helpers
- [x] T058 [P] `app/src/server/constitution/predicates.ts` — skeleton for CR-001 through CR-012 predicates (bodies filled by story-specific tasks)

### Jobs infrastructure

- [x] T059 [P] `app/src/server/jobs/worker.ts` — pg-boss worker bootstrap + graceful shutdown
- [x] T060 [P] `app/src/server/jobs/email-dispatch-job.ts` — enqueue/handle outbound email through `EmailAdapter`

### Test infrastructure

- [x] T061 [P] `app/tests/helpers/test-db.ts` — testcontainers Postgres setup, migrations, per-file ephemeral DB
- [x] T062 [P] `app/tests/helpers/factories.ts` — deterministic factories for Member, Space, Membership, Issue, etc.
- [x] T063 [P] `app/tests/helpers/seed-dev.ts` — hand-written fixture for Playwright/demos (NOT faker — plan Open Question #4 decision)

**Checkpoint:** Migrations run on an ephemeral Postgres, Drizzle client boots, `pnpm typecheck` passes across `app/` and `contracts/`, email adapter selection works.

---

## Phase 3: User Story 1 (P1) — Founder bootstraps a new Space 🎯

**Goal (spec §US1):** A founder with an empty Space completes Bootstrap: name Space, invite members, open the first Issue "How should we make decisions?", propose a governance profile, finalize a Decision Record via hardcoded consent.

**Independent Test:** `app/tests/e2e/us1-founder-bootstrap.spec.ts` — new founder → create Space → invite 3 members → Bootstrap Issue auto-opens → consent-method Decision Record → `spaces.bootstrap_completed_at` set.

**Milestone split:** Auth + Space creation (M1) → Bootstrap Issue + DR (M3 after US5 primitives exist).

### Auth (M1)

- [x] T064 [US1] `app/src/server/auth/request-magic-link.ts` — create token, hash, enqueue email. Rate limit 5/hour/email, 20/hour/IP
- [x] T065 [US1] `app/src/server/auth/verify-magic-link.ts` — consume token (single-use), create session, set cookie
- [x] T066 [US1] `app/src/app/(auth)/login/page.tsx` + form action — request magic link
- [x] T067 [US1] `app/src/app/(auth)/verify/page.tsx` — verify handler, redirect to `/spaces`
- [x] T068 [US1] Integration test `app/tests/integration/auth.test.ts` — magic-link issue → verify → session cookie → second use of same token rejected

### Spaces + membership (M1)

- [x] T069 [P] [US1] `app/src/server/spaces/create.ts` — insert Space, create founder Membership (`status='active'`), write TimelineEvent? (no — Space creation is not yet an Issue; log to general audit once M3 lands)
- [x] T070 [P] [US1] `app/src/server/spaces/invite.ts` — create Invitation, enqueue email with token
- [x] T071 [P] [US1] `app/src/server/spaces/accept-invitation.ts` — verify token, create Member-if-absent, create Membership, set `invitation.accepted_at`
- [x] T072 [P] [US1] `app/src/server/spaces/get.ts` + `list-for-member.ts` — reads
- [x] T073 [US1] `app/src/app/spaces/page.tsx` — server-component list for current Member
- [x] T074 [US1] `app/src/app/spaces/new/page.tsx` + server action — create form
- [x] T075 [US1] `app/src/app/spaces/[spaceSlug]/page.tsx` — Space home (pre-bootstrap banner if `bootstrap_completed_at` is null)
- [x] T076 [US1] `app/src/app/spaces/[spaceSlug]/invite/page.tsx` — invite form
- [x] T077 [US1] `app/src/app/(auth)/accept/[token]/page.tsx` — invitation accept landing
- [x] T078 [US1] Integration test `app/tests/integration/spaces.test.ts` — create → invite → accept → duplicate-accept rejected

### Bootstrap flow (M3 — requires US5 primitives)

- [x] T079 [US1] `app/src/server/spaces/bootstrap.ts` — opens the mandatory Bootstrap Issue on Space create OR first-load if missing; sets `issues.is_bootstrap = true`; partial unique index enforces single bootstrap (data-model §Issue)
- [x] T080 [US1] `app/src/server/decisions/consent-method.ts` — concrete `DecisionMethod`: everyone active + no unresolved_objections = can finalize (FR-046, FR-047, FR-049)
- [ ] T081 [US1] `app/src/server/spaces/complete-bootstrap.ts` — on Bootstrap Issue's DR finalize, set `spaces.bootstrap_completed_at`, persist proposed governance_profile (FR-009, CR-004)
- [x] T082 [US1] Bootstrap UI: `app/src/app/spaces/[spaceSlug]/bootstrap/page.tsx` — banner + link to the Bootstrap Issue (regular Issue flow — plan Open Question #5 decision)
- [x] T083 [US1] Constitutional test `app/tests/constitutional/cr-004-bootstrap.test.ts` — cannot create any non-Bootstrap Issue before `bootstrap_completed_at IS NOT NULL`; Bootstrap Issue always uses `ConsentMethod` regardless of Space config
- [x] T084 [US1] E2E `app/tests/e2e/us1-founder-bootstrap.spec.ts` — end-to-end founder path

**Checkpoint (M1 portion):** Founder can create a Space and invite three members who log in via magic link. **Checkpoint (M3 portion):** Bootstrap Issue closes with a consent-method DR and unlocks the Space.

---

## Phase 4: User Story 2 (P1) — Member joins a Space and orients

**Goal (spec §US2):** A newly invited member accepts, lands on the Space, reads the active governance profile, browses Issues by status, and views any Issue's Civic Memory timeline.

**Independent Test:** `app/tests/e2e/us2-member-orients.spec.ts` — accept invitation → Space home renders → Issue list filterable by status → Issue detail renders timeline. No delegation required.

- [ ] T085 [P] [US2] `app/src/server/spaces/get-governance-profile.ts` — read-only resolver over `spaces.governance_profile` JSONB
- [x] T086 [P] [US2] `app/src/app/spaces/[spaceSlug]/settings/page.tsx` — read-only rendering of governance profile (FR-002 orientation)
- [x] T087 [P] [US2] `app/src/app/spaces/[spaceSlug]/issues/page.tsx` — Issue list (server component) filterable by status, scope tag
- [x] T088 [P] [US2] `app/src/server/civic-memory/list-events.ts` — read timeline for an Issue, ordered `occurred_at DESC`
- [x] T089 [US2] `app/src/app/spaces/[spaceSlug]/issues/[issueSlug]/timeline/page.tsx` — Civic Memory view
- [x] T090 [US2] E2E `app/tests/e2e/us2-member-orients.spec.ts`

**Checkpoint:** Invited Member can orient without any delegation or admin intervention (there is no admin — FR-003).

---

## Phase 5: User Story 3 (P1) — Member creates an Issue

**Goal (spec §US3):** A member with base capabilities creates an Issue with required fields (title, scope, status=Open), populates structured sections, and it appears in the Space's Issue list.

**Independent Test:** `app/tests/e2e/us3-create-issue.spec.ts` — Member → new Issue form → fill title/scope/sections/scope_tags → appears in list.

- [x] T091 [US3] `app/src/server/issues/create.ts` — insert Issue, write `issue_created` TimelineEvent, create QuorumState row with snapshot thresholds
- [x] T092 [US3] `app/src/server/issues/update.ts` — mutate non-finalizing fields (title, scope, structured_sections, scope_tags), write `issue_edited` TimelineEvent
- [x] T093 [US3] `app/src/server/issues/list.ts` + `get.ts` — read paths with status filter
- [x] T094 [US3] `app/src/server/issues/transition-status.ts` — state machine: Open ↔ Exploring; other transitions gated by DR existence (US5) or stall (US11)
- [x] T095 [US3] `app/src/server/governance-config/resolve-scope-tags.ts` — validates supplied `scope_tags` against Space vocabulary (FR-022); auto-includes implied tags per hybrid rule (CR-007)
- [x] T096 [US3] `app/src/server/rate-limits/check-and-bump.ts` — `create_issue` bucket enforcement (3/day/member default, CR-009)
- [x] T097 [US3] `app/src/app/spaces/[spaceSlug]/issues/new/page.tsx` + form action
- [x] T098 [US3] `app/src/app/spaces/[spaceSlug]/issues/[issueSlug]/page.tsx` — Issue detail page (server component, structured sections + perspectives list placeholder)
- [x] T099 [US3] Integration test — create Issue, verify TimelineEvent row, rate limit blocks 4th Issue in a day
- [x] T100 [US3] Constitutional test `app/tests/constitutional/cr-007-scope-subsidiarity.test.ts` — scope-tag vocabulary enforced; invalid tag rejected; hybrid inclusion rule applies

---

## Phase 6: User Story 4 (P1) — Member adds a Perspective

**Goal (spec §US4):** A member adds a Perspective to an Issue with taxonomy_type and optional from_direct_experience flag; appears as a first-class object (not threaded reply).

**Independent Test:** `app/tests/e2e/us4-add-perspective.spec.ts` — Member → Issue → new Perspective with tag → appears on Issue.

- [x] T101 [US4] `app/src/server/perspectives/submit.ts` — insert Perspective, validate taxonomy_type against Space vocabulary, validate single-level nesting (FR-021), write `perspective_added` TimelineEvent, bump QuorumState.participation_count
- [x] T102 [US4] `app/src/server/perspectives/edit.ts` — update body, set `edited_at`, write `perspective_edited` TimelineEvent with prior content snapshot
- [x] T103 [US4] `app/src/server/perspectives/list-for-issue.ts` — read, grouped by taxonomy_type; parent-then-child ordering
- [x] T104 [US4] `app/src/app/spaces/[spaceSlug]/issues/[issueSlug]/perspectives/new/page.tsx` + form action with taxonomy picker, direct-experience checkbox, markdown preview
- [ ] T105 [US4] Inline Perspective response form on Issue detail (one-level-deep only; UI hides reply button on children)
- [x] T106 [US4] Integration test — submit Perspective with nested-reply at depth 2 → rejected at service layer AND DB CHECK
- [x] T107 [US4] Integration test — invalid taxonomy_type → ValidationError
- [x] T108 [US4] E2E `app/tests/e2e/us4-add-perspective.spec.ts`

---

## Phase 7: User Story 5 (P1) — Delegated facilitator writes a Decision Record

**Goal (spec §US5):** A member holding facilitation delegation on the Issue drafts and publishes a Decision Record, which the system requires before the Issue can transition to Decided.

**Independent Test:** `app/tests/e2e/us5-decision-record.spec.ts` — grant facilitation delegation → draft DR with five required fields → finalize → Issue status → Decided.

### Decision Record

- [x] T109 [US5] `app/src/server/decisions/draft.ts` — create draft DR, require facilitation delegation on the Issue
- [x] T110 [US5] `app/src/server/decisions/finalize.ts` — run `DecisionMethod` (`ConsentMethod`), validate five required fields (FR-023), set `finalized_at`, link from `issues.current_decision_record_id`, transition status → Decided, write `decision_record_finalized` TimelineEvent
- [ ] T111 [US5] `app/src/server/decisions/supersede.ts` — reopen → new DR chain via `supersedes_decision_record_id`
- [x] T112 [US5] `app/src/server/issues/reopen.ts` — requires `reopen_reason` (FR-015), transitions to Reopened, writes TimelineEvent
- [x] T113 [US5] `app/src/server/issues/archive.ts` — final state, append-only; writes TimelineEvent

### Delegations (needed for facilitation)

- [x] T114 [P] [US5] `app/src/server/delegations/grant.ts` — insert Delegation (per-Issue or space-wide), write `delegation_granted` TimelineEvent, capture `granted_by_decision_record_id` if applicable
- [x] T115 [P] [US5] `app/src/server/delegations/revoke.ts` — set `revoked_at` (idempotent — second call is no-op), write `delegation_revoked` TimelineEvent
- [x] T116 [P] [US5] `app/src/server/delegations/list.ts` + `holder-for.ts` — active-delegation lookup using partial index
- [x] T117 [US5] Guard: `decisions/draft.ts` and `decisions/finalize.ts` check `holder-for(issue_id, 'facilitation') === currentMember`
- [x] T118 [US5] Constitutional test `app/tests/constitutional/cr-005-revocability.test.ts` — there is no `irrevocable` column; `delegations.revoke()` always succeeds; double-revoke is a no-op

### UI

- [x] T119 [US5] `app/src/app/spaces/[spaceSlug]/issues/[issueSlug]/decision/draft/page.tsx` + action
- [x] T120 [US5] `app/src/app/spaces/[spaceSlug]/issues/[issueSlug]/decision/page.tsx` — published DR view with supersession chain
- [x] T121 [US5] `app/src/app/spaces/[spaceSlug]/delegations/page.tsx` + grant/revoke actions
- [x] T122 [US5] Integration test — finalize without facilitation → NotAuthorized
- [x] T123 [US5] Integration test — transition to Decided without DR → blocked by DB trigger (FR-014)
- [x] T124 [US5] Integration test — Reopen without reason → ValidationError (FR-015)
- [x] T125 [US5] E2E `app/tests/e2e/us5-decision-record.spec.ts`

**Checkpoint (M3 close):** Space can be bootstrapped end-to-end and govern one Issue from Open → Exploring → Decided.

---

## Phase 8: User Story 6 (P2) — Member initiates a referendum against a delegation

**Goal (spec §US6):** A member initiates a referendum against an existing delegation; system verifies threshold + rate-limit; referendum enters structured deliberation before any vote.

**Independent Test:** `app/tests/e2e/us6-referendum.spec.ts` — Member initiates → rallies supporters to threshold → deliberation → voting phase → close with outcome.

### Quorum + rate limits (prerequisites)

- [x] T126 [P] `app/src/server/quorum/recompute.ts` — three-tier tracking: awareness (from `issue_views`), participation (distinct Perspective authors), decision (method-specific)
- [x] T127 [P] `app/src/server/quorum/thresholds.ts` — snapshot Space governance_profile at Issue creation into `quorum_states`
- [x] T128 [P] `app/src/server/jobs/quorum-check-job.ts` — scheduled (every 15 min): transitions deliberation → extension → stalled (FR-038, FR-039, CR-011)
- [x] T129 [P] `app/src/server/rate-limits/` — generic bucket helper used by both `create_issue` and `initiate_referendum`; refuses governance-profile changes that loosen below defaults (CR-009 floor)
- [x] T130 Constitutional test `app/tests/constitutional/cr-009-rate-limiting.test.ts` — cannot raise limits above defaults via governance_profile write
- [x] T131 Constitutional test `app/tests/constitutional/cr-011-participation-integrity.test.ts` — silent-majority Issue cannot reach Decided; stalls after extension

### Referenda

- [x] T132 [P] [US6] `app/src/server/referenda/initiate.ts` — create Referendum (target delegation/DR/governance), check rate limit, enforce stability period for governance targets (CR-008)
- [x] T133 [P] [US6] `app/src/server/referenda/support.ts` — add ReferendumSupporter (unique per voter), on threshold-reached set `minimum_threshold_reached_at`, transition `initiating → deliberating`
- [x] T134 [P] [US6] `app/src/server/referenda/start-voting.ts` — check `voting_started_at > deliberation_started_at + min` (CR-010), transition `deliberating → voting`
- [x] T135 [P] [US6] `app/src/server/referenda/cast-vote.ts` — enforce one-vote-per-member (unique constraint), reject subject-member-voting-on-own-removal (CR-001)
- [x] T136 [P] [US6] `app/src/server/referenda/close.ts` — tally, set outcome (`affirmed | revoked | insufficient_quorum`), on `revoked` targeting a Delegation also flip `delegations.revoked_at`, write TimelineEvent
- [x] T137 [P] [US6] `app/src/server/jobs/stability-check-job.ts` — scheduled: enforce CR-008 30-day minimum window
- [x] T138 [US6] `app/src/app/spaces/[spaceSlug]/referenda/page.tsx` — list
- [x] T139 [US6] `app/src/app/spaces/[spaceSlug]/referenda/new/page.tsx` + action — initiate form
- [x] T140 [US6] `app/src/app/spaces/[spaceSlug]/referenda/[id]/page.tsx` — deliberation/voting UI
- [x] T141 [US6] Constitutional test `app/tests/constitutional/cr-001-removal.test.ts` — subject member's vote on own-removal referendum rejected; their Perspectives accepted
- [x] T142 [US6] Constitutional test `app/tests/constitutional/cr-006-bounded-referendum.test.ts` — cannot enter `deliberating` without threshold; cannot enter `voting` without deliberation minimum
- [x] T143 [US6] Constitutional test `app/tests/constitutional/cr-008-temporal-stability.test.ts` — cannot initiate referendum against same governance target within 30 days
- [x] T144 [US6] Constitutional test `app/tests/constitutional/cr-010-deliberation-first.test.ts` — voting gated on deliberation floor
- [x] T145 [US6] E2E `app/tests/e2e/us6-referendum.spec.ts`

---

## Phase 9: User Story 8 (P2) — Member reads a rhythm-based digest

**Goal (spec §US8):** A member with no activity for a week receives exactly one digest at the configured cadence; zero badges, counts, push notifications.

**Independent Test:** `app/tests/e2e/us8-digest.spec.ts` — seed week-old activity → run `digest-job` with `scheduled_for=now` → exactly one email in Mailhog → re-run job → idempotent no-op.

- [x] T146 [P] [US8] `app/src/server/digest/compose.ts` — pure function: given (member, space, since) → digest body or `null` if nothing meaningful
- [x] T147 [P] [US8] `app/src/server/jobs/digest-job.ts` — scheduled per-member cadence; writes `DigestDelivery` with UNIQUE (member_id, space_id, scheduled_for) for idempotency; enqueues email dispatch
- [x] T148 [P] [US8] `app/src/server/spaces/set-digest-cadence.ts` — per-member override (FR-045); cannot raise above Space default (only lower or off)
- [x] T149 [US8] `app/src/app/spaces/[spaceSlug]/settings/notifications/page.tsx` — only cadence control; UI language emphasizes "digest" not "notifications"
- [x] T150 [US8] Integration test — digest produces no row when nothing to digest (FR-044)
- [x] T151 [US8] Integration test — re-running same `scheduled_for` sends one email total (idempotency)
- [x] T152 [US8] E2E `app/tests/e2e/us8-digest.spec.ts` against Mailhog
- [ ] T153 [US8] Audit: grep `app/src/components/**` for "badge", "unread", "count", "notification bell" — assert zero hits (NFR-001)

---

## Phase 10: User Story 10 (P2) — Admin-equivalent member exports Space data

**Goal (spec §US10):** A member with the appropriate delegation triggers a full export; receives all Space data in open, portable formats.

**Independent Test:** `app/tests/e2e/us10-export.spec.ts` — export → receive bundle → re-import into fresh DB produces identical governance state (CR-003 forkability).

- [x] T154 [P] [US10] `app/src/server/export/own-data.ts` — always-on path, queries rows where `author_id = currentMember`, no gating (FR-050, CR-002)
- [x] T155 [P] [US10] `app/src/server/export/space-wide.ts` — gated by Issue-driven authorization; verifies active delegation tied to a DR granting export
- [x] T156 [P] [US10] `app/src/server/export/bundle.ts` — assemble tar.gz with JSON tables + markdown renders; emit `export_performed` TimelineEvent; `export_attempt_denied` on failures
- [x] T157 [P] [US10] `app/src/lib/adapters/storage/` — signed-URL dispenser (1h expiry)
- [x] T158 [US10] `app/src/app/spaces/[spaceSlug]/settings/export/page.tsx` — own-data button (no gate) + space-wide button (with explanation of required delegation)
- [x] T159 [US10] `app/scripts/export-bundle.ts` — CLI dry-run
- [x] T160 [US10] Constitutional test `app/tests/constitutional/cr-002-commons-protection.test.ts` — cannot finalize DR that would restrict exit/export rights
- [x] T161 [US10] Constitutional test `app/tests/constitutional/cr-003-forkability.test.ts` — export → fresh DB import → governance state identical; no lock-in code path exists
- [ ] T162 [US10] E2E `app/tests/e2e/us10-export.spec.ts`

---

## Phase 11: User Story 11 (P2) — Group unstalls an Issue below awareness quorum

**Goal (spec §US11):** Issue failing awareness quorum within deliberation + extension gets marked Stalled and blocked from Decided until awareness recovers.

**Independent Test:** `app/tests/e2e/us11-stall.spec.ts` — create Issue → watch extension elapse → status=Stalled → add viewers to hit awareness → unstall → can proceed.

- [x] T163 [P] [US11] `app/src/server/issues/record-view.ts` — insert into `issue_views` ON CONFLICT DO NOTHING, bump `QuorumState.awareness_count`
- [x] T164 [P] [US11] `app/src/server/quorum/stall.ts` — sets `stalled_at`, writes `quorum_stalled` TimelineEvent; guard added to `issues.transition-status` rejecting Stalled → Decided
- [x] T165 [P] [US11] `app/src/server/quorum/unstall.ts` — on awareness_count ≥ required, sets `unstalled_at`, writes `quorum_unstalled` TimelineEvent
- [ ] T166 [US11] Issue page surfaces stall banner with current counts vs. thresholds
- [x] T167 [US11] Integration test — deliberation elapses → extension applied → still below → Stalled
- [x] T168 [US11] Integration test — stalled Issue rejects transition to Decided with QuorumNotMet
- [ ] T169 [US11] E2E `app/tests/e2e/us11-stall.spec.ts`

**Checkpoint (M4 close):** Quorum, rate limits, referenda, digests, and export all live. Governance survives a pilot.

---

## Phase 12: User Story 7 (P2) — Facilitator writes and revises a manual summary

**Goal (spec §US7):** Facilitator writes a summary, revises it, each version appears in Civic Memory with authorship and timestamp.

**Independent Test:** `app/tests/e2e/us7-summary.spec.ts` — facilitator → publish v1 → revise to v2 → both versions in timeline.

- [x] T170 [P] [US7] `app/src/server/civic-memory/publish-summary.ts` — require facilitation delegation, insert OfficialSummary with incremented `version`, compute `content_hash`, write `summary_published` TimelineEvent
- [x] T171 [P] [US7] `app/src/server/civic-memory/list-summaries.ts` — versions descending for an Issue
- [x] T172 [US7] `app/src/app/spaces/[spaceSlug]/issues/[issueSlug]/summary/new/page.tsx` + action
- [ ] T173 [US7] Issue detail page renders current summary + link to earlier versions
- [x] T174 [US7] Integration test — summaries immutable (no UPDATE succeeds); revision inserts v+1 row
- [ ] T175 [US7] E2E `app/tests/e2e/us7-summary.spec.ts`

---

## Phase 13: User Story 9 (P3) — Member initiates a governance-profile change via Issue

**Goal (spec §US9):** A member opens a governance-change Issue, runs it through standard deliberation + DR, and upon decision the Space's active governance_profile updates.

**Independent Test:** `app/tests/e2e/us9-governance-change.spec.ts` — open governance Issue → proposed profile diff → finalize DR → `spaces.governance_profile` mutated.

- [x] T176 [P] [US9] `app/src/server/governance-config/schema.ts` — Zod schema for `governance_profile` JSONB content (thresholds, scope-tag vocab, taxonomy vocab, decision-method default, digest cadence default)
- [x] T177 [P] [US9] `app/src/server/governance-config/propose-change.ts` — generate diff payload as structured Issue metadata
- [x] T178 [P] [US9] `app/src/server/governance-config/apply-change.ts` — post-finalize hook wired into `decisions.finalize.ts`; validates new profile against CR-009 floor (rate limits), CR-008 floor (stability 30d), CR-001–CR-003 Tier-1 predicates
- [ ] T179 [US9] `app/src/app/spaces/[spaceSlug]/issues/new?type=governance/page.tsx` — specialized form
- [ ] T180 [US9] Integration test — DR finalize mutates `spaces.governance_profile` atomically with status transition
- [ ] T181 [US9] Constitutional test — profile change that would loosen rate limits or lower stability floor → ConstitutionalViolation
- [ ] T182 [US9] E2E `app/tests/e2e/us9-governance-change.spec.ts`

---

## Phase 14: Polish & Cross-Cutting (M5)

**Purpose:** Constitutional hardening, accessibility pass, hosted deploy, observability sanity.

### Constitutional hardening

- [x] T183 [P] `app/tests/constitutional/cr-012-conflict-resolution.test.ts` — when two deliberable principles collide (e.g., participation-integrity vs. deliberation-first in a referendum edge case), service opens a meta-Issue and blocks the offending action
- [x] T184 [P] `app/src/server/constitution/meta-issue.ts` — helper that opens and links meta-Issues
- [x] T185 [P] Confirm every CR from CR-001 through CR-012 has at least one dedicated constitutional test file (checklist against plan Appendix B)
- [x] T186 Make constitutional suite a required CI gate — update `.github/workflows/app.yml`

### Accessibility (NFR-012)

- [ ] T187 [P] Add `axe-core` integration to every Playwright E2E; fail on any violation
- [ ] T188 [P] Manual screen-reader pass on US1–US5 flow; log and fix issues
- [ ] T189 [P] Keyboard-only navigation pass on all P1 pages; fix focus traps
- [ ] T190 [P] Reduced-motion / high-contrast pass against Tailwind tokens; parity with `site/` where present

### Performance (NFR-013)

- [ ] T191 [P] Add `autocannon` CI step: Issue detail p95 < 200ms, Issue list p95 < 150ms
- [ ] T192 [P] Verify RSC payload budgets: <100KB gzipped per page (NFR-011)

### Deployment

- [x] T193 Pick hosted provider (plan says Fly.io or Railway — recommend Fly for colocation). Provision app + Postgres + worker processes
- [x] T194 Write `app/fly.toml` (or Railway config); wire GH Actions deploy on main-branch merge
- [ ] T195 Smoke-test hosted deploy end-to-end; document runbook at `docs/ops/commonground-runbook.md`

### Observability

- [ ] T196 [P] Verify `pino` PII allowlist via log-capture test; no emails, no Perspective bodies, no DR text appear in logs
- [ ] T197 [P] Point hosted OTLP exporter at chosen backend (Honeycomb free tier or self-hosted); confirm traces flow

### Docs

- [x] T198 [P] `app/README.md` — quickstart, self-host, env vars, license note
- [ ] T199 [P] `docs/ops/commonground-runbook.md` — pg-boss worker restart, DB backups, upgrade path
- [ ] T200 Link from `site/` to the hosted reference when live (`site/` Astro update only; do not otherwise alter marketing site)

**Checkpoint (M5 close):** Pilot-ready. Constitutional tests green, WCAG 2.2 AA verified, hosted reference live.

---

## Dependencies

- **Phase 1 (Setup):** no deps.
- **Phase 2 (Foundational):** blocks all later phases. T032 (triggers + civic_memory_role grants) blocks everything that writes `timeline_events`.
- **Phase 3 (US1):** auth + spaces block all other stories (must log in, must belong to a Space). Bootstrap finalize (T079–T084) depends on Phase 7 (US5) `ConsentMethod` + `decisions.finalize`. Sequence: T064–T078 in M1; T079–T084 after Phase 7 in M3.
- **Phase 4 (US2):** depends on Phase 3 auth + Space list; can proceed in parallel with Phase 5.
- **Phase 5 (US3):** depends on Phase 2 `issues` schema, Phase 3 auth. No other story deps.
- **Phase 6 (US4):** depends on Phase 5 Issue existence + QuorumState row.
- **Phase 7 (US5):** depends on Phases 5 + 6 (an Issue must have Perspectives for consent to be meaningful); also produces `ConsentMethod` used by US1 Bootstrap.
- **Phase 8 (US6):** depends on Phase 7 delegations module + Phase 2 rate-limits helper.
- **Phase 9 (US8):** independent of US6/US10/US11; depends only on Phase 2 jobs infrastructure and Phases 5–7 for digest content.
- **Phase 10 (US10):** depends on Phase 7 delegations (for gating).
- **Phase 11 (US11):** depends on Phase 8 quorum module.
- **Phase 12 (US7):** depends on Phase 7 facilitation delegation.
- **Phase 13 (US9):** depends on Phase 7 DR finalize pipeline.
- **Phase 14 (Polish):** depends on everything.

## Parallel execution examples

```
# Phase 2 foundational — schema files can run in parallel:
T016, T017, T018, T019, T020, T021, T022, T023, T024, T025, T026, T027, T028, T029, T030

# Phase 2 foundational — lib files in parallel:
T034, T035, T036, T037, T038, T039

# Phase 2 foundational — contracts in parallel:
T041, T042, T043, T044, T045, T046, T047, T048

# Phase 3 US1 Spaces services (after auth lands):
T069, T070, T071, T072

# Phase 7 US5 Delegations services:
T114, T115, T116

# Phase 8 US6 Referenda services:
T132, T133, T134, T135, T136, T137
```

## Notes

- `[P]` tasks touch disjoint files and have no order dependency. Single-threaded tasks modify shared files (e.g., `app/src/db/schema/index.ts` aggregator, any file under `app/src/app/spaces/[spaceSlug]/page.tsx` surface).
- Every task includes a file path or a clear module location. Commit per task (plan-aligned); atomic diffs preferred over batched PRs.
- Each milestone (M1–M5) gate requires the plan's four verification criteria: tests green, user stories executable via Playwright, stage deploy clickthrough, written summary.
- `tasks.md` does not include any Phase 2+ deferred work (AI, federation, passkeys, SSO, templates, analytics, diversity detection, cross-module ICOS). That list is in `plan.md` and stays out until a new spec phase lands.

## Superpowers handoff

Once this `tasks.md` is approved, the recommended path is:

```
B) Convert to Superpowers plan → /superpowers:execute-plan
```

Conversion target: `docs/plans/2026-04-21-commonground-v1-implementation.md` with batches keyed to the milestone structure above and review checkpoints at each milestone gate.

---

*End of tasks. Ready for implementation.*
