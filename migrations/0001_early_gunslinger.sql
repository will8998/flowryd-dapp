CREATE TYPE "public"."participant_criticality" AS ENUM('critical', 'required', 'optional');--> statement-breakpoint
CREATE TYPE "public"."participant_verification" AS ENUM('unclaimed', 'pending', 'approved', 'verified', 'rejected');--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legacy_id" varchar(64),
	"name" varchar(255) NOT NULL,
	"description" text,
	"logo_url" varchar(512),
	"website" varchar(512),
	"canton_party_id" varchar(195),
	"roles" jsonb DEFAULT '[]',
	"capabilities" jsonb DEFAULT '{}',
	"criticality" "participant_criticality" DEFAULT 'optional',
	"holdings" varchar(64),
	"validator_nodes" integer DEFAULT 0,
	"super_validator" boolean DEFAULT false,
	"verification_status" "participant_verification" DEFAULT 'unclaimed' NOT NULL,
	"claimed_by_user_id" uuid,
	"claimed_by_org_id" uuid,
	"claimed_at" timestamp with time zone,
	"reviewed_by_user_id" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"contact_email" varchar(255),
	"contact_name" varchar(255),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participants_legacy_id_unique" UNIQUE("legacy_id"),
	CONSTRAINT "participants_canton_party_id_unique" UNIQUE("canton_party_id")
);
--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_claimed_by_user_id_users_id_fk" FOREIGN KEY ("claimed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_claimed_by_org_id_organizations_id_fk" FOREIGN KEY ("claimed_by_org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_participants_legacy_id" ON "participants" USING btree ("legacy_id");--> statement-breakpoint
CREATE INDEX "idx_participants_verification" ON "participants" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_participants_canton_party_id" ON "participants" USING btree ("canton_party_id");--> statement-breakpoint
CREATE INDEX "idx_participants_name" ON "participants" USING btree ("name");