CREATE TYPE "public"."allocation_status" AS ENUM('proposed', 'consented', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."consent_status" AS ENUM('pending', 'consented', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."declaration_kind" AS ENUM('surplus', 'shortage');--> statement-breakpoint
CREATE TYPE "public"."declaration_status" AS ENUM('active', 'fulfilled', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."exchange_terms" AS ENUM('free', 'exchange', 'cost_recovery');--> statement-breakpoint
CREATE TYPE "public"."producer_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."synapse_resource_type" AS ENUM('vegetables', 'fruit', 'grains', 'legumes', 'herbs', 'dairy', 'eggs', 'meat', 'honey', 'seeds', 'other');--> statement-breakpoint
CREATE TABLE "producers" (
	"id" text PRIMARY KEY NOT NULL,
	"managed_by_member_id" text NOT NULL,
	"org_name" text NOT NULL,
	"location_description" text NOT NULL,
	"bio" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"status" "producer_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "producers_id_ulid_length" CHECK (char_length("producers"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "surplus_shortage_declarations" (
	"id" text PRIMARY KEY NOT NULL,
	"producer_id" text NOT NULL,
	"kind" "declaration_kind" NOT NULL,
	"resource_type" "synapse_resource_type" NOT NULL,
	"resource_detail" text,
	"quantity" numeric(10, 2),
	"unit" text,
	"available_from" date NOT NULL,
	"available_until" date,
	"location_description" text,
	"exchange_terms" "exchange_terms" DEFAULT 'free' NOT NULL,
	"conditions" text,
	"status" "declaration_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "declarations_id_ulid_length" CHECK (char_length("surplus_shortage_declarations"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "allocation_consents" (
	"id" text PRIMARY KEY NOT NULL,
	"proposal_id" text NOT NULL,
	"consenting_member_id" text NOT NULL,
	"representing_producer_id" text,
	"status" "consent_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "allocation_consents_id_ulid_length" CHECK (char_length("allocation_consents"."id") = 26)
);
--> statement-breakpoint
CREATE TABLE "allocation_proposals" (
	"id" text PRIMARY KEY NOT NULL,
	"proposed_by_member_id" text NOT NULL,
	"surplus_declaration_id" text NOT NULL,
	"shortage_declaration_id" text,
	"quantity" numeric(10, 2),
	"notes" text,
	"status" "allocation_status" DEFAULT 'proposed' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "allocation_proposals_id_ulid_length" CHECK (char_length("allocation_proposals"."id") = 26)
);
--> statement-breakpoint
ALTER TABLE "producers" ADD CONSTRAINT "producers_managed_by_member_id_members_id_fk" FOREIGN KEY ("managed_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surplus_shortage_declarations" ADD CONSTRAINT "surplus_shortage_declarations_producer_id_producers_id_fk" FOREIGN KEY ("producer_id") REFERENCES "public"."producers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_consents" ADD CONSTRAINT "allocation_consents_proposal_id_allocation_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."allocation_proposals"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_consents" ADD CONSTRAINT "allocation_consents_consenting_member_id_members_id_fk" FOREIGN KEY ("consenting_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_consents" ADD CONSTRAINT "allocation_consents_representing_producer_id_producers_id_fk" FOREIGN KEY ("representing_producer_id") REFERENCES "public"."producers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_proposals" ADD CONSTRAINT "allocation_proposals_proposed_by_member_id_members_id_fk" FOREIGN KEY ("proposed_by_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_proposals" ADD CONSTRAINT "allocation_proposals_surplus_declaration_id_surplus_shortage_declarations_id_fk" FOREIGN KEY ("surplus_declaration_id") REFERENCES "public"."surplus_shortage_declarations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "allocation_proposals" ADD CONSTRAINT "allocation_proposals_shortage_declaration_id_surplus_shortage_declarations_id_fk" FOREIGN KEY ("shortage_declaration_id") REFERENCES "public"."surplus_shortage_declarations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "producers_member_idx" ON "producers" USING btree ("managed_by_member_id");--> statement-breakpoint
CREATE INDEX "producers_status_idx" ON "producers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "declarations_producer_idx" ON "surplus_shortage_declarations" USING btree ("producer_id");--> statement-breakpoint
CREATE INDEX "declarations_status_kind_idx" ON "surplus_shortage_declarations" USING btree ("status","kind");--> statement-breakpoint
CREATE INDEX "declarations_resource_type_idx" ON "surplus_shortage_declarations" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "allocation_consents_proposal_idx" ON "allocation_consents" USING btree ("proposal_id");--> statement-breakpoint
CREATE INDEX "allocation_consents_member_idx" ON "allocation_consents" USING btree ("consenting_member_id");--> statement-breakpoint
CREATE INDEX "allocation_proposals_status_idx" ON "allocation_proposals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "allocation_proposals_surplus_idx" ON "allocation_proposals" USING btree ("surplus_declaration_id");