# Data Model: CommonGround v1

## Metadata
- Feature ID: 001-commonground
- Companion to: `plan.md`
- Phase: 2 (Plan)
- Date: 2026-04-21

---

## Conventions

- **Primary keys:** ULID (26-char string, monotonic-friendly, URL-safe). Stored as `text` in Postgres with a `CHECK (char_length(id) = 26)` constraint. Not UUID — ULIDs sort chronologically, which makes timeline queries cheap.
- **Timestamps:** `created_at` and `updated_at` on every mutable table. Type: `timestamptz`. Always UTC. Server-generated; client never sends timestamps.
- **Soft-delete:** NOT used. Everything that matters is append-only (via TimelineEvents) or has explicit "removal" semantics (e.g., `revoked_at`, `removed_at`). There is no `deleted_at` column.
- **Enums:** stored as PostgreSQL ENUM types (`CREATE TYPE ... AS ENUM (...)`) for database-level integrity. Adding a value is a migration; removing a value is rare and also a migration.
- **JSONB:** used sparingly. Only for `governance_profile` (large, heterogeneous, rarely queried by inner fields) and `timeline_events.payload` (heterogeneous by event_type).
- **Foreign keys:** declared at the DB level with `ON DELETE RESTRICT` unless noted. Nothing cascades. Deletion is rare and explicit.
- **Indexes:** declared alongside table definitions. Default indexing strategy: every FK, every slug-or-email lookup, every `(space_id, status)` filter.

---

## Entities

### Member

Purpose: identifies a human account across the system. One Member per email address.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| email | text | nullable (set to null on Right-to-be-Forgotten) |
| display_name | text | nullable (redacted on RTBF) |
| created_at | timestamptz | server set |
| updated_at | timestamptz | server set on every mutation |
| deleted_at | timestamptz | nullable; set on RTBF. UI renders as "[removed member]" |

Indexes:
- `UNIQUE (email) WHERE email IS NOT NULL` — enforces one Member per email while allowing RTBF nulls.

Invariants:
- Email must be lowercased at write time (service-layer normalization).
- Setting `deleted_at` implies `email IS NULL` and `display_name IS NULL`. Enforced by a CHECK.

Satisfies: NFR-014 (identity primitive), CR-002 (exit rights — RTBF is part of exit).

---

### Space

Purpose: a governing group's container. Every Issue, Perspective, Decision Record, and Membership belongs to exactly one Space.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| name | text | not null |
| slug | text | not null, unique — URL-safe, derived from name at creation |
| description | text | nullable |
| governance_profile | jsonb | default `'{}'`. Stores per-Space configurable thresholds, taxonomy vocabulary, scope-tag vocabulary, decision-method default. See `docs/commonground-default-governance-policy.md` for schema. |
| bootstrap_completed_at | timestamptz | nullable; set when Bootstrap Issue's Decision Record is finalized (FR-009) |
| digest_cadence_default | text | default 'weekly'; values 'daily' \| 'weekly' \| 'monthly' \| 'off' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `UNIQUE (slug)`.

Invariants:
- `bootstrap_completed_at` MAY be null (pre-Bootstrap) or a timestamp; once set, the system permits non-Bootstrap Issue creation (FR-009 guard at service layer).
- `governance_profile` JSONB is validated by a Zod schema at the service layer on every update; the DB does not enforce its shape beyond "is valid JSON".

Satisfies: FR-001, FR-004, FR-036, FR-045, FR-048, FR-052.

---

### Membership

Purpose: a Member's relationship to a Space. Intentionally simple: there is no tiered role system. Everyone is either invited, active, or departed.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| space_id | text FK → spaces.id | |
| member_id | text FK → members.id | |
| status | enum `membership_status` | values: `invited` \| `active` \| `departed` |
| invited_at | timestamptz | not null |
| joined_at | timestamptz | nullable; set when invitation accepted |
| departed_at | timestamptz | nullable |
| departure_issue_id | text FK → issues.id | nullable; populated when departure was a governance-driven removal (CR-001) |
| digest_cadence | text | nullable; per-member override of Space default. Never raises above the Space default. |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `UNIQUE (space_id, member_id)` — one membership per (Space, Member).
- `INDEX (space_id, status)` — common list query.

Invariants:
- Status transitions: `invited → active → departed` (one-way; re-invitation creates a new Membership row, not a resurrection).
- `departed_at IS NULL` XOR `status = 'departed'`. Enforced by CHECK.
- NOTE: status is intentionally NOT a tiered score; there is no "admin" role. Admin-equivalent authority is a Delegation.

Satisfies: FR-002, FR-003, CR-001 (removal tracking).

---

### Invitation

Purpose: pending invitation record. Separate from Membership so that an invitation can exist without creating a Member until acceptance (in case the invitee never logs in).

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| space_id | text FK → spaces.id | |
| invited_email | text | lowercased |
| invited_by_member_id | text FK → members.id | |
| token_hash | text | SHA-256 of the invitation token |
| expires_at | timestamptz | default: 14 days after creation |
| accepted_at | timestamptz | nullable |
| accepted_membership_id | text FK → memberships.id | nullable; set on accept |
| created_at | timestamptz | |

Indexes:
- `INDEX (token_hash)` — lookup on accept.
- `INDEX (invited_email, space_id)` — prevents duplicate pending invites.

Invariants:
- `accepted_at` and `accepted_membership_id` are both set or both null (CHECK).

Satisfies: FR-002.

---

### Issue

Purpose: the central first-class object. Every decision happens in an Issue.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| space_id | text FK → spaces.id | |
| title | text | not null, 1–200 chars |
| slug | text | derived from title; unique within Space |
| scope | text | 1–500 chars; short plain-text description of the Issue's scope |
| status | enum `issue_status` | values: `open` \| `exploring` \| `decided` \| `reopened` \| `archived` \| `stalled` |
| stall_reason | enum `stall_reason` | nullable; currently only `insufficient_participation` |
| current_decision_record_id | text FK → decision_records.id | nullable; populated when status=decided |
| scope_tags | text[] | array of scope-tag slugs drawn from the Space's `governance_profile.scope_tag_vocabulary` |
| structured_sections | jsonb | `{ problem_framings: [...], constraints: [...], stakeholders: [...], known_facts: [...], open_questions: [...] }` |
| decision_method | text | nullable; overrides Space default. Values: `consent` (Phase 1). Phase 2 adds `majority`, `quadratic`, etc. |
| review_date | date | nullable; set from the Decision Record's review_date when Issue transitions to decided |
| is_bootstrap | boolean | default false; set true on the Space's first "How should we make decisions?" Issue |
| reopen_reason | text | nullable; required (enforced at service layer) when status transitions to `reopened` (FR-015) |
| created_by_member_id | text FK → members.id | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `UNIQUE (space_id, slug)`.
- `INDEX (space_id, status)`.
- `INDEX (space_id, is_bootstrap) WHERE is_bootstrap = true` — partial index for the single-bootstrap lookup.

Invariants:
- An Issue transitioning to `status='decided'` MUST have `current_decision_record_id IS NOT NULL`. Enforced by a DB trigger (`issue_status_consistency_trigger`) and service-layer guard.
- An Issue transitioning to `status='reopened'` MUST have `reopen_reason IS NOT NULL AND length(reopen_reason) > 0`. Service-layer guard (not easily expressed as a simple CHECK because the prior value matters).
- Only one `is_bootstrap = true` Issue per Space. Enforced by the partial unique index.
- Issues with `status='stalled'` MAY NOT transition to `decided` (FR-039). Service-layer guard.

Satisfies: FR-004, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-039.

---

### Perspective

Purpose: a member's structured contribution to an Issue. First-class, not a comment.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| issue_id | text FK → issues.id | |
| author_id | text FK → members.id | |
| body_markdown | text | 1–10,000 chars |
| taxonomy_type | text | one of the Space's configured taxonomy types (defaults: `values`, `risk`, `equity`, `feasibility`, `relational`, `temporal`) |
| from_direct_experience | boolean | default false (FR-020) |
| parent_perspective_id | text FK → perspectives.id | nullable; at most ONE level of nesting (FR-021) |
| created_at | timestamptz | |
| edited_at | timestamptz | nullable; set on any edit. Prior versions land in `timeline_events`. |

Indexes:
- `INDEX (issue_id, created_at DESC)` — default render order.
- `INDEX (author_id)` — for own-data export.
- `INDEX (parent_perspective_id) WHERE parent_perspective_id IS NOT NULL`.

Invariants:
- **One-level nesting:** `parent_perspective_id` MUST reference a perspective whose own `parent_perspective_id IS NULL`. Enforced by:
  ```sql
  ALTER TABLE perspectives ADD CONSTRAINT perspective_single_level
    CHECK (
      parent_perspective_id IS NULL
      OR (SELECT parent_perspective_id FROM perspectives p WHERE p.id = parent_perspective_id) IS NULL
    );
  ```
  (CHECK with subquery requires Postgres 16+; for portability we also enforce at the service layer.)
- `taxonomy_type` MUST be a member of the Space's configured taxonomy vocabulary at the time of write. Service-layer validation.
- `body_markdown` sanitized via `rehype-sanitize` before rendering; raw stored.

Satisfies: FR-017 through FR-022.

---

### DecisionRecord

Purpose: the persistent, revisable record of a decision. Required for status=decided.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| issue_id | text FK → issues.id | |
| drafted_by_member_id | text FK → members.id | must hold current facilitation delegation on the Issue |
| what_text | text | 1–20,000 chars. "What was decided." |
| how_method | text | decision method used: `consent` (Phase 1) |
| rationale_text | text | 1–20,000 chars. "Key rationales." |
| unresolved_objections_text | text | nullable; 0–20,000 chars. Captured even if none (stand-asides listed here). |
| review_date | date | required (FR-023) |
| finalized_at | timestamptz | nullable; null = draft; set = published |
| finalized_by_member_id | text FK → members.id | nullable; set on finalize |
| supersedes_decision_record_id | text FK → decision_records.id | nullable; set when a Reopen → new Decision Record chain happens |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `INDEX (issue_id, finalized_at DESC)` — find the current DR for an Issue.
- `INDEX (supersedes_decision_record_id) WHERE supersedes_decision_record_id IS NOT NULL`.

Invariants:
- Finalization is one-way: once `finalized_at IS NOT NULL`, the row becomes effectively immutable (only `supersedes_decision_record_id` may later be set on a NEW row that supersedes this one). Service-layer guard; TimelineEvent records the finalization.
- `review_date` is required (FR-023) and must be in the future relative to `finalized_at`.
- All five required elements are present: `what_text`, `how_method`, `rationale_text`, `unresolved_objections_text` (nullable but intentionally captured), `review_date`. Enforced by NOT NULL and length checks.

Satisfies: FR-014, FR-023, FR-024.

---

### Delegation

Purpose: a capability granted to a member, either per-Issue or Space-wide. Revocable by design.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| space_id | text FK → spaces.id | |
| issue_id | text FK → issues.id | nullable. NULL = space-wide capability. NOT NULL = per-Issue. |
| grantee_member_id | text FK → members.id | |
| granted_by_type | enum `delegation_grant_source` | `group_consent` \| `predecessor_delegation` \| `bootstrap` |
| granted_by_decision_record_id | text FK → decision_records.id | nullable; populated when granted via a DR |
| capability | enum `delegation_capability` | values: `facilitation` (Phase 1). Phase 2 adds more. |
| granted_at | timestamptz | |
| expires_at | timestamptz | nullable; time-bounded per FR-029. NULL = no expiry (discouraged but permitted). |
| revoked_at | timestamptz | nullable |
| revoked_by_referendum_id | text FK → referenda.id | nullable |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `INDEX (space_id, issue_id, capability) WHERE revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now())` — fast "who currently holds capability X on Issue Y?" lookup. Postgres partial index.
- `INDEX (grantee_member_id) WHERE revoked_at IS NULL`.

Invariants:
- **No irrevocable flag exists, by design.** This enforces CR-005 structurally. A delegation with an impossibly far `expires_at` is still revocable via referendum.
- A Delegation is either per-Issue (`issue_id NOT NULL`) OR space-wide (`issue_id IS NULL`). The column is nullable; there is no combined state.
- `revoked_at > granted_at` when set.
- `revoked_by_referendum_id` may be set only when `revoked_at IS NOT NULL`.

Satisfies: FR-027, FR-028, FR-029, FR-030, CR-005.

---

### Referendum

Purpose: a structured challenge to a Delegation or Decision Record, with a deliberation phase before any vote.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| space_id | text FK → spaces.id | |
| initiated_by_member_id | text FK → members.id | |
| target_type | enum `referendum_target` | `delegation` \| `decision_record` \| `governance_profile_change` |
| target_delegation_id | text FK → delegations.id | nullable |
| target_decision_record_id | text FK → decision_records.id | nullable |
| target_issue_id | text FK → issues.id | nullable; for governance_profile_change, references the proposing Issue |
| status | enum `referendum_status` | `initiating` \| `deliberating` \| `voting` \| `closed` |
| minimum_threshold_required | int | snapshot of the threshold at initiation |
| minimum_threshold_reached_at | timestamptz | nullable |
| deliberation_started_at | timestamptz | nullable |
| voting_started_at | timestamptz | nullable |
| closed_at | timestamptz | nullable |
| outcome | enum `referendum_outcome` | nullable; `affirmed` \| `revoked` \| `insufficient_quorum` |
| created_at | timestamptz | |
| updated_at | timestamptz | |

Indexes:
- `INDEX (space_id, status)`.
- `INDEX (initiated_by_member_id, created_at DESC)` — rate-limit lookup.
- `INDEX (target_delegation_id) WHERE target_delegation_id IS NOT NULL`.

Invariants:
- Exactly ONE of (`target_delegation_id`, `target_decision_record_id`, `target_issue_id`) is non-null. Enforced by CHECK.
- Status lifecycle is strictly forward: `initiating → deliberating → voting → closed`. Enforced by service layer (no back-transitions).
- A closed Referendum cannot be deleted or updated. Enforced at civic-memory-role level.
- Deliberation phase MUST precede voting (CR-010). Service-layer guard: voting_started_at > deliberation_started_at + minimum_deliberation_period.

Satisfies: FR-030 through FR-034, CR-006, CR-010.

---

### ReferendumVote

Purpose: individual vote on a referendum.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| referendum_id | text FK → referenda.id | |
| voter_member_id | text FK → members.id | |
| choice | enum `vote_choice` | `support` \| `oppose` \| `stand_aside` |
| cast_at | timestamptz | |

Indexes:
- `UNIQUE (referendum_id, voter_member_id)` — one vote per member per referendum.

Invariants:
- Votes are immutable once cast (no update, no delete via normal roles).
- Votes can only be cast while parent referendum's status = 'voting'. Service-layer guard.
- Subject member of a removal referendum may not cast a vote on that referendum (CR-001). Service-layer guard in `referenda.castVote()`.

Satisfies: FR-033, CR-001, CR-010.

---

### ReferendumSupporter

Purpose: members who have endorsed a referendum's initiation, for threshold tracking (CR-006).

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| referendum_id | text FK → referenda.id | |
| supporter_member_id | text FK → members.id | |
| supported_at | timestamptz | |

Indexes:
- `UNIQUE (referendum_id, supporter_member_id)`.

Satisfies: FR-031, CR-006.

---

### QuorumState

Purpose: tracks three-tier quorum for an Issue. Updated by the service layer and a scheduled pg-boss job; denormalized for fast reads.

| Column | Type | Notes |
|---|---|---|
| issue_id | text PK FK → issues.id | one row per Issue |
| awareness_count | int | default 0 |
| awareness_required | int | snapshot from governance_profile at Issue creation |
| participation_count | int | default 0 |
| participation_required | int | snapshot |
| decision_quorum_met | boolean | default false; computed based on decision method |
| deliberation_period_ends_at | timestamptz | initial deliberation deadline |
| extension_period_ends_at | timestamptz | nullable; set when first deadline elapses without awareness quorum |
| stalled_at | timestamptz | nullable; set when extension elapses without awareness quorum (FR-039) |
| unstalled_at | timestamptz | nullable; set when a stalled Issue later reaches awareness quorum |
| updated_at | timestamptz | |

Indexes:
- `INDEX (deliberation_period_ends_at) WHERE stalled_at IS NULL` — scheduled job scans this.

Invariants:
- `awareness_count` is count of distinct Members who have viewed the Issue at least once (tracked via a lightweight `issue_views` table, not shown here as it's a simple (issue_id, member_id) UNIQUE set).
- `participation_count` is count of distinct Members who have authored a Perspective on the Issue.
- Recomputation is lazy on read AND eager on key writes (Perspective create, Issue view). Eventual consistency is acceptable; the scheduled job reconciles.

Satisfies: FR-035 through FR-039, CR-011.

---

### TimelineEvent (Civic Memory)

Purpose: append-only record of everything that happened on an Issue. The Civic Memory.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| issue_id | text FK → issues.id | |
| event_type | enum `timeline_event_type` | see below |
| actor_member_id | text FK → members.id | nullable (e.g., system events) |
| payload | jsonb | shape depends on event_type. Schema validated at write by Zod per event_type. |
| occurred_at | timestamptz | |

Event types (Phase 1):
- `issue_created`
- `issue_status_changed` (payload: from, to, actor, reason)
- `perspective_added`
- `perspective_edited`
- `summary_published` (payload: version, author, content_hash)
- `decision_record_drafted`
- `decision_record_finalized` (payload: decision_record_id)
- `decision_record_superseded`
- `delegation_granted`
- `delegation_revoked`
- `referendum_initiated`
- `referendum_deliberation_started`
- `referendum_voting_started`
- `referendum_closed`
- `quorum_stalled`
- `quorum_unstalled`
- `governance_profile_changed`
- `member_removed` (cross-space; may also appear as a Space-level event if we extend)
- `export_performed`
- `export_attempt_denied`

Indexes:
- `INDEX (issue_id, occurred_at DESC)` — timeline render.

Invariants:
- **APPEND-ONLY.** The `civic_memory_role` Postgres role has INSERT and SELECT privileges only. UPDATE and DELETE are REVOKEd. Application code writes TimelineEvents as the `civic_memory_role`; any UPDATE/DELETE attempt fails at the database level.
- `payload` schema is validated by a Zod discriminated union keyed on `event_type` at the service layer.

Satisfies: FR-025, FR-026.

---

### OfficialSummary

Purpose: the manual summary written by a facilitator, versioned. Each version is a new row.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| issue_id | text FK → issues.id | |
| version | int | monotonic, unique per Issue |
| author_member_id | text FK → members.id | must hold facilitation delegation at write time |
| body_markdown | text | 1–20,000 chars |
| published_at | timestamptz | |
| content_hash | text | SHA-256 of body_markdown |

Indexes:
- `UNIQUE (issue_id, version)`.
- `INDEX (issue_id, published_at DESC)` — current summary lookup.

Invariants:
- Summaries are immutable once published. Editing produces a new version row. The prior version remains.
- Each published summary also writes a `summary_published` TimelineEvent.

Satisfies: FR-040, FR-041.

---

### ScopeTag

**Design decision:** modeled as a **JSONB field on Space** (`governance_profile.scope_tag_vocabulary`) rather than a separate table.

Rationale:
- The vocabulary is small (typically 5–30 tags per Space).
- It changes rarely and always via a governance Issue.
- Issue-level references use a `text[]` column (`issues.scope_tags`) that is validated against the Space's vocabulary at write time by the service layer.
- A separate table would require joins on every Issue read without measurable benefit.

If Phase 2 adds per-tag metadata (description, color, parent tag), we may migrate to a separate table. Until then, JSONB is simpler.

Satisfies: CR-007 (scope tag vocabulary).

---

### RateLimitBucket

Purpose: per-Member, per-action rate limiting. Enforces CR-009.

| Column | Type | Notes |
|---|---|---|
| member_id | text FK → members.id | |
| action_type | enum `rate_limited_action` | `initiate_referendum` \| `create_issue` |
| window_start | timestamptz | start of the bucket window (e.g., midnight UTC for daily, 7-day rolling for referenda) |
| count | int | default 0 |
| updated_at | timestamptz | |

Primary key: `(member_id, action_type, window_start)`.

Invariants:
- Bucket is computed on write, not read. Service layer: `SELECT count FROM rate_limit_buckets WHERE member_id = ? AND action_type = ? AND window_start = current_window();`
- Phase 1 default limits hardcoded per CR-009:
  - `initiate_referendum`: 1 per member per rolling 7-day window.
  - `create_issue`: 3 per member per calendar day (UTC).
- Spaces MAY override to *tighter* limits via governance_profile. Service layer refuses to loosen beyond defaults.

Satisfies: FR-032, CR-009.

---

### MagicLinkToken

Purpose: single-use email login tokens. 15-minute TTL.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| email | text | lowercased |
| token_hash | text | SHA-256 of the actual token; plaintext NEVER stored |
| expires_at | timestamptz | created_at + 15 minutes |
| consumed_at | timestamptz | nullable; set on first use |
| requested_from_ip | text | nullable; for abuse triage |
| created_at | timestamptz | |

Indexes:
- `INDEX (token_hash)` — verify-on-click lookup.
- `INDEX (email, created_at DESC)` — rate-limit check (max 5/hour per email).

Invariants:
- Single-use: a token with `consumed_at IS NOT NULL` is never valid again.
- Expired tokens are swept by a pg-boss scheduled job (hourly).
- Plaintext token exists only in the email body, never at rest.

Satisfies: NFR-014.

---

### Session

Purpose: authenticated session state.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK; also the session cookie value (256 bits of entropy) |
| member_id | text FK → members.id | |
| created_at | timestamptz | |
| expires_at | timestamptz | sliding: max(current + 30 days, existing) |
| last_used_at | timestamptz | updated on each request (rate-limited to 1/min to reduce write contention) |
| user_agent | text | nullable; for member's own session management UI |
| ip_at_last_use | text | nullable |

Indexes:
- `INDEX (member_id, expires_at)` — list a member's active sessions.

Invariants:
- Revocation is a plain DELETE. No blacklist needed; the session is the source of truth.

Satisfies: NFR-014.

---

### DigestDelivery

Purpose: log of rhythm-based digests sent. Idempotent: a (member_id, space_id, scheduled_for) row exists at most once.

| Column | Type | Notes |
|---|---|---|
| id | text (ULID) | PK |
| member_id | text FK → members.id | |
| space_id | text FK → spaces.id | |
| scheduled_for | timestamptz | the cadence trigger time |
| delivered_at | timestamptz | nullable; set when email dispatched |
| content_hash | text | SHA-256 of the digest body; helps detect "nothing to digest" cases |
| dispatched_adapter | text | name of email adapter used |

Indexes:
- `UNIQUE (member_id, space_id, scheduled_for)` — idempotency.

Invariants:
- If there's nothing meaningful to digest, no row is inserted (FR-044's "Given no activity warrants a digest... no digest is sent").

Satisfies: FR-042, FR-043, FR-044, FR-045.

---

### IssueView

Purpose: minimal table tracking awareness quorum — did this Member ever view this Issue?

| Column | Type | Notes |
|---|---|---|
| issue_id | text FK → issues.id | |
| member_id | text FK → members.id | |
| first_viewed_at | timestamptz | |

Primary key: `(issue_id, member_id)`.

Invariants:
- Write-once per (issue, member). Subsequent views are no-ops at the DB level (ON CONFLICT DO NOTHING).
- Powers `QuorumState.awareness_count`.

Satisfies: FR-035, CR-011.

---

## Relationships (textual summary)

```
Member 1──N Membership N──1 Space 1──N Issue 1──N Perspective
                                       │           │
                                       │           └─(self-ref, 1 level)
                                       │
                                       ├──N DecisionRecord
                                       │
                                       ├──N TimelineEvent (APPEND-ONLY)
                                       │
                                       ├──1 QuorumState
                                       │
                                       ├──N OfficialSummary (versioned)
                                       │
                                       └──N IssueView ←→ N Member

Space 1──N Delegation ──(nullable FK)── Issue
Space 1──N Referendum ──(tagged FK to one of)── Delegation | DecisionRecord | Issue

Member 1──N MagicLinkToken (transient, 15min)
Member 1──N Session
Member 1──N RateLimitBucket (per action_type)
Member 1──N DigestDelivery
Space  1──N Invitation

Member 1──N ReferendumVote N──1 Referendum
Member 1──N ReferendumSupporter N──1 Referendum
```

---

## Invariants (enforced at the database layer where possible)

The following are the hard rules. Each is mapped to its constitutional or functional origin.

1. **One-level Perspective nesting** (FR-021): CHECK constraint on `perspectives.parent_perspective_id` preventing a grandchild. Also enforced at service layer for older Postgres versions.

2. **Decided requires Decision Record** (FR-014): DB trigger `issue_status_consistency_trigger` refuses UPDATE that sets `status='decided'` while `current_decision_record_id IS NULL`.

3. **Reopen requires reason** (FR-015): service-layer guard. Not DB-enforceable without comparing old/new, but TimelineEvent captures the reason and the Issue row must have non-empty `reopen_reason`.

4. **Delegation XOR scope** (plan integrity): `delegations.issue_id` is nullable; CHECK ensures a row is either per-Issue (issue_id NOT NULL) or space-wide (issue_id IS NULL), never both.

5. **No irrevocable delegation** (CR-005): there is no `irrevocable` column on `delegations`. Structural enforcement — no application code can set one. Attempts to add such a column would fail code review against this spec.

6. **Append-only Civic Memory** (FR-025, FR-026): Postgres role `civic_memory_role` has `INSERT, SELECT` privileges on `timeline_events` and NO `UPDATE, DELETE`. The application writes as this role. Any UPDATE/DELETE attempt errors at the DB.

7. **Magic-link plaintext never at rest** (NFR-014): `magic_link_tokens.token_hash` is SHA-256 hex. Plaintext lives only in the email body. Enforced by code review + the schema having no `token_plaintext` column.

8. **Closed Referendum immutability** (FR-034, CR-010): service-layer guard that rejects UPDATE on `referenda` where `status = 'closed'`. Plus: closed Referenda always emit a permanent TimelineEvent.

9. **Subject member may not vote on own removal** (CR-001): service-layer guard in `referenda.castVote()` that rejects when the referendum's target is a removal Issue and `voter_member_id` matches the subject.

10. **One vote per member per referendum** (CR-010 integrity): `UNIQUE (referendum_id, voter_member_id)` on `referendum_votes`.

11. **One membership per (Space, Member)** (FR-002, FR-003): `UNIQUE (space_id, member_id)` on `memberships`.

12. **Rate limit floor** (CR-009): service-layer guard that rejects `governance_profile` changes raising rate limits above the hardcoded defaults. A Space may tighten, never loosen.

13. **Temporal stability floor** (CR-008): service-layer guard enforcing a minimum 30-day stability period unless the 2/3 supermajority exception triggers. Cannot be reduced below 30 days at any Space.

14. **Commons protection** (CR-002): service-layer guard in `decisions.finalize()` that rejects any Decision Record whose effect would privatize shared infrastructure, restrict exit rights, or render governance irrevocable. Implemented as a set of predicates in `constitution/cr002-predicates.ts`.

15. **Forkability** (CR-003): architectural, not a DB constraint. The `export` module always produces a fully-featured export. There is no lock-in code path. This is tested by the `export-and-reimport` E2E test that exports a Space and loads it into a fresh DB.

---

## Phase 2 Deferred Tables

These tables are NOT created in Phase 1. Listed here so the tasks phase doesn't accidentally scaffold them.

- `ai_classifications` — perspective auto-classification (Phase 2).
- `ai_clusters` — viewpoint clustering (Phase 2).
- `ai_summaries` — AI-generated editable summaries alongside manual (Phase 2).
- `federation_peers` — Space-to-Space federation (Phase 3).
- `governance_profile_templates` — community-contributed presets (Phase 3).
- `passkey_credentials` — WebAuthn credentials (Phase 2).
- `sso_identities` — federated identity (Phase 3; likely never).
- `diversity_metrics` — automated capture detection (Phase 2 research; may remain permanently absent if the research finds no non-manipulative implementation).

---

*End of data model. Paired with `plan.md` and `contracts/`.*
