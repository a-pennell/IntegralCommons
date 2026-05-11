CREATE TYPE "public"."charter_section_status" AS ENUM('draft', 'ratified', 'superseded');--> statement-breakpoint
CREATE TYPE "public"."credit_transaction_type" AS ENUM('earned', 'spent', 'adjustment', 'demurrage_applied');--> statement-breakpoint
CREATE TYPE "public"."delegation_capability" AS ENUM('facilitation');--> statement-breakpoint
CREATE TYPE "public"."delegation_grant_source" AS ENUM('group_consent', 'predecessor_delegation', 'bootstrap');--> statement-breakpoint
CREATE TYPE "public"."digest_cadence" AS ENUM('daily', 'weekly', 'monthly', 'off');--> statement-breakpoint
CREATE TYPE "public"."exchange_mode" AS ENUM('gift', 'time_credit');--> statement-breakpoint
CREATE TYPE "public"."exchange_request_status" AS ENUM('pending', 'accepted', 'declined', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('open', 'exploring', 'decided', 'reopened', 'archived', 'stalled');--> statement-breakpoint
CREATE TYPE "public"."membership_status" AS ENUM('invited', 'active', 'departed');--> statement-breakpoint
CREATE TYPE "public"."need_offer_status" AS ENUM('active', 'fulfilled', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."need_offer_type" AS ENUM('need', 'offer');--> statement-breakpoint
CREATE TYPE "public"."neighborhood_membership_role" AS ENUM('member', 'steward', 'anonymous');--> statement-breakpoint
CREATE TYPE "public"."neighborhood_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."rate_limited_action" AS ENUM('initiate_referendum', 'create_issue');--> statement-breakpoint
CREATE TYPE "public"."referendum_outcome" AS ENUM('affirmed', 'revoked', 'insufficient_quorum');--> statement-breakpoint
CREATE TYPE "public"."referendum_status" AS ENUM('initiating', 'deliberating', 'voting', 'closed');--> statement-breakpoint
CREATE TYPE "public"."referendum_target" AS ENUM('delegation', 'decision_record', 'governance_profile_change');--> statement-breakpoint
CREATE TYPE "public"."resource_kind" AS ENUM('tool', 'space', 'skill', 'material', 'other');--> statement-breakpoint
CREATE TYPE "public"."resource_status" AS ENUM('available', 'unavailable', 'removed');--> statement-breakpoint
CREATE TYPE "public"."stall_reason" AS ENUM('insufficient_participation');--> statement-breakpoint
CREATE TYPE "public"."stewardship_entry_type" AS ENUM('action_taken', 'member_care', 'resource_noted', 'charter_note', 'handover');--> statement-breakpoint
CREATE TYPE "public"."timeline_event_type" AS ENUM('issue_created', 'issue_status_changed', 'issue_edited', 'perspective_added', 'perspective_edited', 'summary_published', 'decision_record_drafted', 'decision_record_finalized', 'decision_record_superseded', 'delegation_granted', 'delegation_revoked', 'referendum_initiated', 'referendum_deliberation_started', 'referendum_voting_started', 'referendum_closed', 'quorum_stalled', 'quorum_unstalled', 'governance_profile_changed', 'member_removed', 'export_performed', 'export_attempt_denied');--> statement-breakpoint
CREATE TYPE "public"."vote_choice" AS ENUM('support', 'oppose', 'stand_aside');--> statement-breakpoint
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
	CONSTRAINT "perspectives_body_length" CHECK (char_length("perspectives"."body_markdown") BETWEEN 1 AND 10000)
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
CREATE TABLE "neighborhoods" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" "neighborhood_status" DEFAULT 'active' NOT NULL,
	"linked_space_id" text,
	"created_by_member_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "neighborhoods_id_ulid_length" CHECK (char_length("neighborhoods"."id") = 26),
	CONSTRAINT "neighborhoods_name_length" CHECK (char_length("neighborhoods"."name") BETWEEN 1 AND 200)
);
--> statement-breakpoint
CREATE TABLE "neighborhood_memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"neighborhood_id" text NOT NULL,
	"member_id" text NOT NULL,
	"role" "neighborhood_membership_role" DEFAULT 'member' NOT NULL,
	"trust_level" integer DEFAULT 0 NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"left_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "neighborhood_memberships_id_ulid_length" CHECK (char_length("neighborhood_memberships"."id") = 26),
	CONSTRAINT "neighborhood_memberships_trust_level_range" CHECK ("neighborhood_memberships"."trust_level" BETWEEN 0 AND 3),
	CONSTRAINT "neighborhood_memberships_left_after_joined" CHECK ("neighborhood_memberships"."left_at" IS NULL OR "neighborhood_memberships"."left_at" > "neighborhood_memberships"."joined_at")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" text PRIMARY KEY NOT NULL,
	"neighborhood_id" text NOT NULL,
	"offered_by_member_id" text,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"kind" "resource_kind" NOT NULL,
	"status" "resource_status" DEFAULT 'available' NOT NULL,
	"location_hint" text,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "resources_id_ulid_length" CHECK (char_length("resources"."id") = 26),
	CONSTRAINT "resources_title_length" CHECK (char_length("resources"."title") BETWEEN 1 AND 200)
);
--> statement-breakpoint
CREATE TABLE "needs_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"neighborhood_id" text NOT NULL,
	"posted_by_member_id" text,
	"type" "need_offer_type" NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"is_urgent" boolean DEFAULT false NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"status" "need_offer_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "needs_offers_id_ulid_length" CHECK (char_length("needs_offers"."id") = 26),
	CONSTRAINT "needs_offers_title_length" CHECK (char_length("needs_offers"."title") BETWEEN 1 AND 200)
);
--> statement-breakpoint
CREATE TABLE "exchange_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"need_offer_id" text NOT NULL,
	"requester_member_id" text NOT NULL,
	"mode" "exchange_mode" NOT NULL,
	"credit_amount" text,
	"status" "exchange_request_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exchange_requests_id_ulid_length" CHECK (char_length("exchange_requests"."id") = 26),
	CONSTRAINT "exchange_requests_credit_amount_consistent" CHECK (
        ("exchange_requests"."mode" = 'gift' AND "exchange_requests"."credit_amount" IS NULL)
        OR
        ("exchange_requests"."mode" = 'time_credit' AND "exchange_requests"."credit_amount" IS NOT NULL)
      ),
	CONSTRAINT "exchange_requests_completed_at_consistent" CHECK ("exchange_requests"."completed_at" IS NULL OR "exchange_requests"."status" = 'completed')
);
--> statement-breakpoint
CREATE TABLE "stewardship_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"neighborhood_id" text NOT NULL,
	"actor_member_id" text NOT NULL,
	"subject_member_id" text,
	"entry_type" "stewardship_entry_type" NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"linked_resource_id" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stewardship_entries_id_ulid_length" CHECK (char_length("stewardship_entries"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"neighborhood_id" text NOT NULL,
	"member_id" text NOT NULL,
	"transaction_type" "credit_transaction_type" NOT NULL,
	"amount_text" text NOT NULL,
	"exchange_request_id" text,
	"memo" text,
	"recorded_by_member_id" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credit_transactions_id_ulid_length" CHECK (char_length("credit_transactions"."id") = 26),
	CONSTRAINT "credit_transactions_amount_not_empty" CHECK (char_length("credit_transactions"."amount_text") > 0)
);
--> statement-breakpoint
CREATE TABLE "commons_charter_sections" (
	"id" text PRIMARY KEY NOT NULL,
	"neighborhood_id" text NOT NULL,
	"section_key" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" charter_section_status DEFAULT 'draft' NOT NULL,
	"ratified_at" timestamp with time zone,
	"ratified_by_member_id" text,
	"superseded_by_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "commons_charter_sections_id_ulid_length" CHECK (char_length("commons_charter_sections"."id") = 26),
	CONSTRAINT "commons_charter_sections_key_length" CHECK (char_length("commons_charter_sections"."section_key") BETWEEN 1 AND 100),
	CONSTRAINT "commons_charter_sections_ratified_consistent" CHECK (
        ("commons_charter_sections"."status" = 'ratified' AND "commons_charter_sections"."ratified_at" IS NOT NULL)
        OR "commons_charter_sections"."status" != 'ratified'
      ),
	CONSTRAINT "commons_charter_sections_version_positive" CHECK ("commons_charter_sections"."version" >= 1)
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
ALTER TABLE "neighborhoods" ADD CONSTRAINT "neighborhoods_created_by_member_id_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhood_memberships" ADD CONSTRAINT "neighborhood_memberships_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhood_memberships" ADD CONSTRAINT "neighborhood_memberships_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_offered_by_member_id_members_id_fk" FOREIGN KEY ("offered_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs_offers" ADD CONSTRAINT "needs_offers_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "needs_offers" ADD CONSTRAINT "needs_offers_posted_by_member_id_members_id_fk" FOREIGN KEY ("posted_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_need_offer_id_needs_offers_id_fk" FOREIGN KEY ("need_offer_id") REFERENCES "public"."needs_offers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_requester_member_id_members_id_fk" FOREIGN KEY ("requester_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stewardship_entries" ADD CONSTRAINT "stewardship_entries_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stewardship_entries" ADD CONSTRAINT "stewardship_entries_actor_member_id_members_id_fk" FOREIGN KEY ("actor_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stewardship_entries" ADD CONSTRAINT "stewardship_entries_subject_member_id_members_id_fk" FOREIGN KEY ("subject_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_recorded_by_member_id_members_id_fk" FOREIGN KEY ("recorded_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commons_charter_sections" ADD CONSTRAINT "commons_charter_sections_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commons_charter_sections" ADD CONSTRAINT "commons_charter_sections_ratified_by_member_id_members_id_fk" FOREIGN KEY ("ratified_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "delegations_active_idx" ON "delegations" USING btree ("space_id","issue_id","capability") WHERE "delegations"."revoked_at" IS NULL;--> statement-breakpoint
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
CREATE UNIQUE INDEX "digest_deliveries_idempotency_uniq" ON "digest_deliveries" USING btree ("member_id","space_id","scheduled_for");--> statement-breakpoint
CREATE UNIQUE INDEX "neighborhoods_slug_uniq" ON "neighborhoods" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "neighborhoods_status_idx" ON "neighborhoods" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "neighborhood_memberships_member_neighborhood_uniq" ON "neighborhood_memberships" USING btree ("neighborhood_id","member_id");--> statement-breakpoint
CREATE INDEX "neighborhood_memberships_active_idx" ON "neighborhood_memberships" USING btree ("neighborhood_id","role") WHERE "neighborhood_memberships"."left_at" IS NULL;--> statement-breakpoint
CREATE INDEX "resources_neighborhood_kind_idx" ON "resources" USING btree ("neighborhood_id","kind");--> statement-breakpoint
CREATE INDEX "resources_neighborhood_status_idx" ON "resources" USING btree ("neighborhood_id","status");--> statement-breakpoint
CREATE INDEX "needs_offers_neighborhood_type_idx" ON "needs_offers" USING btree ("neighborhood_id","type");--> statement-breakpoint
CREATE INDEX "needs_offers_active_idx" ON "needs_offers" USING btree ("neighborhood_id","status","created_at") WHERE "needs_offers"."status" = 'active';--> statement-breakpoint
CREATE INDEX "exchange_requests_need_offer_status_idx" ON "exchange_requests" USING btree ("need_offer_id","status");--> statement-breakpoint
CREATE INDEX "exchange_requests_requester_idx" ON "exchange_requests" USING btree ("requester_member_id");--> statement-breakpoint
CREATE INDEX "stewardship_entries_neighborhood_occurred_idx" ON "stewardship_entries" USING btree ("neighborhood_id","occurred_at");--> statement-breakpoint
CREATE INDEX "stewardship_entries_actor_idx" ON "stewardship_entries" USING btree ("actor_member_id");--> statement-breakpoint
CREATE INDEX "stewardship_entries_subject_idx" ON "stewardship_entries" USING btree ("subject_member_id");--> statement-breakpoint
CREATE INDEX "credit_transactions_member_neighborhood_idx" ON "credit_transactions" USING btree ("neighborhood_id","member_id","occurred_at");--> statement-breakpoint
CREATE INDEX "credit_transactions_neighborhood_occurred_idx" ON "credit_transactions" USING btree ("neighborhood_id","occurred_at");--> statement-breakpoint
CREATE INDEX "commons_charter_sections_neighborhood_section_idx" ON "commons_charter_sections" USING btree ("neighborhood_id","section_key");