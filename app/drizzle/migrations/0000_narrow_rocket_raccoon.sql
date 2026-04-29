CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "members_id_ulid_length" CHECK (char_length("members"."id") = 26),
	CONSTRAINT "members_rtbf_consistent" CHECK ("members"."deleted_at" IS NULL OR ("members"."email" IS NULL AND "members"."display_name" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"governance_profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"bootstrap_completed_at" timestamp with time zone,
	"digest_cadence_default" "digest_cadence" DEFAULT 'weekly' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "spaces_id_ulid_length" CHECK (char_length("spaces"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"member_id" text NOT NULL,
	"status" "membership_status" NOT NULL,
	"invited_at" timestamp with time zone DEFAULT now() NOT NULL,
	"joined_at" timestamp with time zone,
	"departed_at" timestamp with time zone,
	"departure_issue_id" text,
	"digest_cadence" "digest_cadence",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_id_ulid_length" CHECK (char_length("memberships"."id") = 26),
	CONSTRAINT "memberships_status_departed_consistent" CHECK (("memberships"."departed_at" IS NULL) <> ("memberships"."status" = 'departed'))
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"invited_email" text NOT NULL,
	"invited_by_member_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() + interval '14 days' NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_membership_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_id_ulid_length" CHECK (char_length("invitations"."id") = 26),
	CONSTRAINT "invitations_accepted_consistent" CHECK (("invitations"."accepted_at" IS NULL) = ("invitations"."accepted_membership_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "issue_views" (
	"issue_id" text NOT NULL,
	"member_id" text NOT NULL,
	"first_viewed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_views_issue_id_member_id_pk" PRIMARY KEY("issue_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"scope" text NOT NULL,
	"status" "issue_status" DEFAULT 'open' NOT NULL,
	"stall_reason" "stall_reason",
	"current_decision_record_id" text,
	"scope_tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"structured_sections" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"decision_method" text,
	"review_date" date,
	"is_bootstrap" boolean DEFAULT false NOT NULL,
	"reopen_reason" text,
	"created_by_member_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issues_id_ulid_length" CHECK (char_length("issues"."id") = 26),
	CONSTRAINT "issues_title_length" CHECK (char_length("issues"."title") BETWEEN 1 AND 200),
	CONSTRAINT "issues_scope_length" CHECK (char_length("issues"."scope") BETWEEN 1 AND 500)
);
--> statement-breakpoint
CREATE TABLE "perspectives" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body_markdown" text NOT NULL,
	"taxonomy_type" text NOT NULL,
	"from_direct_experience" boolean DEFAULT false NOT NULL,
	"parent_perspective_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone,
	CONSTRAINT "perspectives_id_ulid_length" CHECK (char_length("perspectives"."id") = 26),
	CONSTRAINT "perspectives_body_length" CHECK (char_length("perspectives"."body_markdown") BETWEEN 1 AND 10000),
	CONSTRAINT "perspectives_single_level_nesting" CHECK ("perspectives"."parent_perspective_id" IS NULL OR (SELECT p.parent_perspective_id FROM perspectives p WHERE p.id = "perspectives"."parent_perspective_id") IS NULL)
);
--> statement-breakpoint
CREATE TABLE "decision_records" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_id" text NOT NULL,
	"drafted_by_member_id" text NOT NULL,
	"what_text" text NOT NULL,
	"how_method" text NOT NULL,
	"rationale_text" text NOT NULL,
	"unresolved_objections_text" text DEFAULT '' NOT NULL,
	"review_date" date NOT NULL,
	"finalized_at" timestamp with time zone,
	"finalized_by_member_id" text,
	"supersedes_decision_record_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "decision_records_id_ulid_length" CHECK (char_length("decision_records"."id") = 26),
	CONSTRAINT "decision_records_what_length" CHECK (char_length("decision_records"."what_text") BETWEEN 1 AND 20000),
	CONSTRAINT "decision_records_rationale_length" CHECK (char_length("decision_records"."rationale_text") BETWEEN 1 AND 20000),
	CONSTRAINT "decision_records_objections_length" CHECK (char_length("decision_records"."unresolved_objections_text") <= 20000),
	CONSTRAINT "decision_records_finalizer_consistent" CHECK (("decision_records"."finalized_at" IS NULL) = ("decision_records"."finalized_by_member_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "delegations" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"issue_id" text,
	"grantee_member_id" text NOT NULL,
	"granted_by_type" "delegation_grant_source" NOT NULL,
	"granted_by_decision_record_id" text,
	"capability" "delegation_capability" NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"revoked_by_referendum_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "delegations_id_ulid_length" CHECK (char_length("delegations"."id") = 26),
	CONSTRAINT "delegations_revoked_after_granted" CHECK ("delegations"."revoked_at" IS NULL OR "delegations"."revoked_at" > "delegations"."granted_at"),
	CONSTRAINT "delegations_revoked_by_consistent" CHECK ("delegations"."revoked_by_referendum_id" IS NULL OR "delegations"."revoked_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "referenda" (
	"id" text PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"initiated_by_member_id" text NOT NULL,
	"target_type" "referendum_target" NOT NULL,
	"target_delegation_id" text,
	"target_decision_record_id" text,
	"target_issue_id" text,
	"status" "referendum_status" DEFAULT 'initiating' NOT NULL,
	"minimum_threshold_required" integer NOT NULL,
	"minimum_threshold_reached_at" timestamp with time zone,
	"deliberation_started_at" timestamp with time zone,
	"voting_started_at" timestamp with time zone,
	"closed_at" timestamp with time zone,
	"outcome" "referendum_outcome",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referenda_id_ulid_length" CHECK (char_length("referenda"."id") = 26),
	CONSTRAINT "referenda_exactly_one_target" CHECK ((
        (CASE WHEN "referenda"."target_delegation_id" IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN "referenda"."target_decision_record_id" IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN "referenda"."target_issue_id" IS NOT NULL THEN 1 ELSE 0 END)
      ) = 1),
	CONSTRAINT "referenda_outcome_on_close" CHECK (("referenda"."closed_at" IS NULL) = ("referenda"."outcome" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "referendum_supporters" (
	"id" text PRIMARY KEY NOT NULL,
	"referendum_id" text NOT NULL,
	"supporter_member_id" text NOT NULL,
	"supported_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referendum_supporters_id_ulid_length" CHECK (char_length("referendum_supporters"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "referendum_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"referendum_id" text NOT NULL,
	"voter_member_id" text NOT NULL,
	"choice" "vote_choice" NOT NULL,
	"cast_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referendum_votes_id_ulid_length" CHECK (char_length("referendum_votes"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "quorum_states" (
	"issue_id" text PRIMARY KEY NOT NULL,
	"awareness_count" integer DEFAULT 0 NOT NULL,
	"awareness_required" integer NOT NULL,
	"participation_count" integer DEFAULT 0 NOT NULL,
	"participation_required" integer NOT NULL,
	"decision_quorum_met" boolean DEFAULT false NOT NULL,
	"deliberation_period_ends_at" timestamp with time zone NOT NULL,
	"extension_period_ends_at" timestamp with time zone,
	"stalled_at" timestamp with time zone,
	"unstalled_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_events" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_id" text NOT NULL,
	"event_type" timeline_event_type NOT NULL,
	"actor_member_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "timeline_events_id_ulid_length" CHECK (char_length("timeline_events"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "official_summaries" (
	"id" text PRIMARY KEY NOT NULL,
	"issue_id" text NOT NULL,
	"version" integer NOT NULL,
	"author_member_id" text NOT NULL,
	"body_markdown" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" text NOT NULL,
	CONSTRAINT "official_summaries_id_ulid_length" CHECK (char_length("official_summaries"."id") = 26),
	CONSTRAINT "official_summaries_body_length" CHECK (char_length("official_summaries"."body_markdown") BETWEEN 1 AND 20000)
);
--> statement-breakpoint
CREATE TABLE "rate_limit_buckets" (
	"member_id" text NOT NULL,
	"action_type" "rate_limited_action" NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rate_limit_buckets_member_id_action_type_window_start_pk" PRIMARY KEY("member_id","action_type","window_start")
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"requested_from_ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_link_tokens_id_ulid_length" CHECK (char_length("magic_link_tokens"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_agent" text,
	"ip_at_last_use" text,
	CONSTRAINT "sessions_id_ulid_length" CHECK (char_length("sessions"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "digest_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"member_id" text NOT NULL,
	"space_id" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"delivered_at" timestamp with time zone,
	"content_hash" text NOT NULL,
	"dispatched_adapter" text NOT NULL,
	CONSTRAINT "digest_deliveries_id_ulid_length" CHECK (char_length("digest_deliveries"."id") = 26)
);
--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_member_id_members_id_fk" FOREIGN KEY ("invited_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_accepted_membership_id_memberships_id_fk" FOREIGN KEY ("accepted_membership_id") REFERENCES "public"."memberships"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_views" ADD CONSTRAINT "issue_views_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_views" ADD CONSTRAINT "issue_views_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_member_id_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perspectives" ADD CONSTRAINT "perspectives_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perspectives" ADD CONSTRAINT "perspectives_author_id_members_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perspectives" ADD CONSTRAINT "perspectives_parent_perspective_id_perspectives_id_fk" FOREIGN KEY ("parent_perspective_id") REFERENCES "public"."perspectives"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_drafted_by_member_id_members_id_fk" FOREIGN KEY ("drafted_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_finalized_by_member_id_members_id_fk" FOREIGN KEY ("finalized_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "decision_records" ADD CONSTRAINT "decision_records_supersedes_decision_record_id_decision_records_id_fk" FOREIGN KEY ("supersedes_decision_record_id") REFERENCES "public"."decision_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_grantee_member_id_members_id_fk" FOREIGN KEY ("grantee_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_granted_by_decision_record_id_decision_records_id_fk" FOREIGN KEY ("granted_by_decision_record_id") REFERENCES "public"."decision_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referenda" ADD CONSTRAINT "referenda_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referenda" ADD CONSTRAINT "referenda_initiated_by_member_id_members_id_fk" FOREIGN KEY ("initiated_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referenda" ADD CONSTRAINT "referenda_target_delegation_id_delegations_id_fk" FOREIGN KEY ("target_delegation_id") REFERENCES "public"."delegations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referenda" ADD CONSTRAINT "referenda_target_decision_record_id_decision_records_id_fk" FOREIGN KEY ("target_decision_record_id") REFERENCES "public"."decision_records"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referenda" ADD CONSTRAINT "referenda_target_issue_id_issues_id_fk" FOREIGN KEY ("target_issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referendum_supporters" ADD CONSTRAINT "referendum_supporters_referendum_id_referenda_id_fk" FOREIGN KEY ("referendum_id") REFERENCES "public"."referenda"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referendum_supporters" ADD CONSTRAINT "referendum_supporters_supporter_member_id_members_id_fk" FOREIGN KEY ("supporter_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referendum_votes" ADD CONSTRAINT "referendum_votes_referendum_id_referenda_id_fk" FOREIGN KEY ("referendum_id") REFERENCES "public"."referenda"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referendum_votes" ADD CONSTRAINT "referendum_votes_voter_member_id_members_id_fk" FOREIGN KEY ("voter_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quorum_states" ADD CONSTRAINT "quorum_states_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_actor_member_id_members_id_fk" FOREIGN KEY ("actor_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_summaries" ADD CONSTRAINT "official_summaries_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "official_summaries" ADD CONSTRAINT "official_summaries_author_member_id_members_id_fk" FOREIGN KEY ("author_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_limit_buckets" ADD CONSTRAINT "rate_limit_buckets_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digest_deliveries" ADD CONSTRAINT "digest_deliveries_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digest_deliveries" ADD CONSTRAINT "digest_deliveries_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "members_email_uniq" ON "members" USING btree ("email") WHERE "members"."email" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "members_email_created_idx" ON "members" USING btree ("email","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "spaces_slug_uniq" ON "spaces" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "memberships_space_member_uniq" ON "memberships" USING btree ("space_id","member_id");--> statement-breakpoint
CREATE INDEX "memberships_space_status_idx" ON "memberships" USING btree ("space_id","status");--> statement-breakpoint
CREATE INDEX "invitations_token_hash_idx" ON "invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invitations_email_space_idx" ON "invitations" USING btree ("invited_email","space_id");--> statement-breakpoint
CREATE UNIQUE INDEX "issues_space_slug_uniq" ON "issues" USING btree ("space_id","slug");--> statement-breakpoint
CREATE INDEX "issues_space_status_idx" ON "issues" USING btree ("space_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "issues_space_bootstrap_uniq" ON "issues" USING btree ("space_id") WHERE "issues"."is_bootstrap" = true;--> statement-breakpoint
CREATE INDEX "perspectives_issue_created_idx" ON "perspectives" USING btree ("issue_id","created_at");--> statement-breakpoint
CREATE INDEX "perspectives_author_idx" ON "perspectives" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "perspectives_parent_idx" ON "perspectives" USING btree ("parent_perspective_id") WHERE "perspectives"."parent_perspective_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "decision_records_issue_finalized_idx" ON "decision_records" USING btree ("issue_id","finalized_at");--> statement-breakpoint
CREATE INDEX "decision_records_supersedes_idx" ON "decision_records" USING btree ("supersedes_decision_record_id") WHERE "decision_records"."supersedes_decision_record_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "delegations_active_idx" ON "delegations" USING btree ("space_id","issue_id","capability") WHERE "delegations"."revoked_at" IS NULL AND ("delegations"."expires_at" IS NULL OR "delegations"."expires_at" > now());--> statement-breakpoint
CREATE INDEX "delegations_grantee_active_idx" ON "delegations" USING btree ("grantee_member_id") WHERE "delegations"."revoked_at" IS NULL;--> statement-breakpoint
CREATE INDEX "referenda_space_status_idx" ON "referenda" USING btree ("space_id","status");--> statement-breakpoint
CREATE INDEX "referenda_initiator_recency_idx" ON "referenda" USING btree ("initiated_by_member_id","created_at");--> statement-breakpoint
CREATE INDEX "referenda_target_delegation_idx" ON "referenda" USING btree ("target_delegation_id") WHERE "referenda"."target_delegation_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "referendum_supporters_one_per_member_uniq" ON "referendum_supporters" USING btree ("referendum_id","supporter_member_id");--> statement-breakpoint
CREATE UNIQUE INDEX "referendum_votes_one_per_member_uniq" ON "referendum_votes" USING btree ("referendum_id","voter_member_id");--> statement-breakpoint
CREATE INDEX "quorum_states_deliberation_due_idx" ON "quorum_states" USING btree ("deliberation_period_ends_at") WHERE "quorum_states"."stalled_at" IS NULL;--> statement-breakpoint
CREATE INDEX "timeline_events_issue_occurred_idx" ON "timeline_events" USING btree ("issue_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "official_summaries_issue_version_uniq" ON "official_summaries" USING btree ("issue_id","version");--> statement-breakpoint
CREATE INDEX "official_summaries_issue_published_idx" ON "official_summaries" USING btree ("issue_id","published_at");--> statement-breakpoint
CREATE INDEX "magic_link_tokens_hash_idx" ON "magic_link_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "magic_link_tokens_email_recency_idx" ON "magic_link_tokens" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "sessions_member_expires_idx" ON "sessions" USING btree ("member_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "digest_deliveries_idempotency_uniq" ON "digest_deliveries" USING btree ("member_id","space_id","scheduled_for");-- ============================================================================
-- Post-migration SQL. Applied after `drizzle-kit migrate` lands the tables.
--
-- This file encodes invariants that Drizzle's ORM cannot express:
--
--   1. Circular FKs (issues.current_decision_record_id ⇄ decision_records.issue_id,
--      delegations.revoked_by_referendum_id → referenda.id).
--   2. Issue status consistency trigger enforcing FR-014 at the DB level.
--   3. The `civic_memory_role` Postgres role with INSERT + SELECT only on
--      `timeline_events`; UPDATE and DELETE are REVOKEd.
--
-- The pg-boss worker's tables are managed by pg-boss itself (in a separate
-- `pgboss` schema by default). Nothing here touches them.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Deferred foreign keys (break circular references from the ORM layer).
-- ----------------------------------------------------------------------------

ALTER TABLE issues
  ADD CONSTRAINT issues_current_decision_record_fk
  FOREIGN KEY (current_decision_record_id)
  REFERENCES decision_records (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE memberships
  ADD CONSTRAINT memberships_departure_issue_fk
  FOREIGN KEY (departure_issue_id)
  REFERENCES issues (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE delegations
  ADD CONSTRAINT delegations_revoked_by_referendum_fk
  FOREIGN KEY (revoked_by_referendum_id)
  REFERENCES referenda (id)
  ON DELETE RESTRICT
  DEFERRABLE INITIALLY DEFERRED;

-- ----------------------------------------------------------------------------
-- 2. Issue status consistency trigger (FR-014).
--    An Issue with status='decided' MUST have current_decision_record_id set.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION issue_status_consistency_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'decided' AND NEW.current_decision_record_id IS NULL THEN
    RAISE EXCEPTION 'issues: status=decided requires current_decision_record_id (FR-014)'
      USING ERRCODE = 'check_violation';
  END IF;

  -- status='stalled' may not transition to 'decided' (FR-039). Service layer
  -- also enforces; this is belt-and-braces.
  IF TG_OP = 'UPDATE' AND OLD.status = 'stalled' AND NEW.status = 'decided' THEN
    RAISE EXCEPTION 'issues: stalled issue cannot transition to decided (FR-039)'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS issue_status_consistency_trigger ON issues;

CREATE TRIGGER issue_status_consistency_trigger
  BEFORE INSERT OR UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION issue_status_consistency_fn();

-- ----------------------------------------------------------------------------
-- 3. Append-only civic memory (FR-025, FR-026).
--    The `civic_memory_role` may INSERT and SELECT on timeline_events only.
--    UPDATE and DELETE are revoked. Application code that writes timeline
--    events must SET ROLE civic_memory_role for the duration of the write.
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'civic_memory_role') THEN
    CREATE ROLE civic_memory_role NOINHERIT;
  END IF;
END
$$;

-- The application role (owner of the schema) grants INSERT + SELECT to
-- civic_memory_role, and nothing else.
GRANT INSERT, SELECT ON TABLE timeline_events TO civic_memory_role;

-- Explicit REVOKE makes the intent visible in `\dp timeline_events`.
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE timeline_events FROM civic_memory_role;

-- Allow the application role to assume civic_memory_role so service-layer
-- code can `SET ROLE civic_memory_role` before writing events.
DO $$
DECLARE
  app_user text := current_user;
BEGIN
  EXECUTE format('GRANT civic_memory_role TO %I', app_user);
END
$$;

-- ----------------------------------------------------------------------------
-- 4. Referendum immutability on close (CR-010 integrity).
--    Closed referenda may not be updated or deleted.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION referenda_no_update_when_closed_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'closed' THEN
    RAISE EXCEPTION 'referenda: row is closed and cannot be updated (CR-010 integrity)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS referenda_no_update_when_closed_trigger ON referenda;

CREATE TRIGGER referenda_no_update_when_closed_trigger
  BEFORE UPDATE ON referenda
  FOR EACH ROW
  EXECUTE FUNCTION referenda_no_update_when_closed_fn();

-- ----------------------------------------------------------------------------
-- 5. Official summaries immutability once published.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION official_summaries_no_mutate_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'official_summaries: summaries are immutable once published; create a new version instead'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS official_summaries_no_mutate_trigger ON official_summaries;

CREATE TRIGGER official_summaries_no_mutate_trigger
  BEFORE UPDATE OR DELETE ON official_summaries
  FOR EACH ROW
  EXECUTE FUNCTION official_summaries_no_mutate_fn();

-- ----------------------------------------------------------------------------
-- 6. Decision records immutability once finalized.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION decision_records_no_mutate_when_finalized_fn()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow updating `supersedes_decision_record_id` elsewhere, but not on THIS row.
  IF OLD.finalized_at IS NOT NULL THEN
    RAISE EXCEPTION 'decision_records: finalized record is immutable (FR-014, FR-023)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS decision_records_no_mutate_when_finalized_trigger ON decision_records;

CREATE TRIGGER decision_records_no_mutate_when_finalized_trigger
  BEFORE UPDATE ON decision_records
  FOR EACH ROW
  EXECUTE FUNCTION decision_records_no_mutate_when_finalized_fn();
