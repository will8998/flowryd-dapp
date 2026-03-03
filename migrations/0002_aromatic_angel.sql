CREATE TYPE "public"."canton_flow_status" AS ENUM('proven', 'design', 'active', 'planned');--> statement-breakpoint
CREATE TABLE "canton_flow_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_id" varchar(32) NOT NULL,
	"step" integer NOT NULL,
	"template_id" varchar(32) NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"action" text,
	"inputs" text,
	"outputs" text,
	"triggers_next" varchar(255),
	"canton_privacy" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canton_flows" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(128),
	"description" text,
	"source" varchar(512),
	"status" "canton_flow_status" DEFAULT 'planned',
	"step_count" integer DEFAULT 0,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canton_templates" (
	"id" varchar(32) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(128),
	"participant_column" varchar(64),
	"icon_name" varchar(64),
	"color" varchar(32),
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "canton_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "live_workflow_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"flow_id" uuid NOT NULL,
	"canton_flow_step_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"participant_legacy_id" varchar(64),
	"participant_name" varchar(255),
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" varchar(32) NOT NULL,
	"template_name" varchar(255) NOT NULL,
	"participant_legacy_id" varchar(64) NOT NULL,
	"organization" varchar(255),
	"criticality" "participant_criticality" DEFAULT 'optional',
	"is_sv" boolean DEFAULT false,
	"is_validator" boolean DEFAULT false,
	"canton_role" varchar(512),
	"foundation_category" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flow_participants" ADD COLUMN "step_number" integer;--> statement-breakpoint
ALTER TABLE "flow_participants" ADD COLUMN "template_name" varchar(255);--> statement-breakpoint
ALTER TABLE "flows" ADD COLUMN "canton_flow_id" varchar(32);--> statement-breakpoint
ALTER TABLE "canton_flow_steps" ADD CONSTRAINT "canton_flow_steps_flow_id_canton_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."canton_flows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canton_flow_steps" ADD CONSTRAINT "canton_flow_steps_template_id_canton_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."canton_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_workflow_assignments" ADD CONSTRAINT "live_workflow_assignments_flow_id_flows_id_fk" FOREIGN KEY ("flow_id") REFERENCES "public"."flows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_workflow_assignments" ADD CONSTRAINT "live_workflow_assignments_canton_flow_step_id_canton_flow_steps_id_fk" FOREIGN KEY ("canton_flow_step_id") REFERENCES "public"."canton_flow_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_workflow_assignments" ADD CONSTRAINT "live_workflow_assignments_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_participants" ADD CONSTRAINT "template_participants_template_id_canton_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."canton_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_canton_flow_step" ON "canton_flow_steps" USING btree ("flow_id","step");--> statement-breakpoint
CREATE INDEX "idx_canton_flow_steps_flow_id" ON "canton_flow_steps" USING btree ("flow_id");--> statement-breakpoint
CREATE INDEX "idx_canton_flow_steps_template_id" ON "canton_flow_steps" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_live_assignment" ON "live_workflow_assignments" USING btree ("flow_id","canton_flow_step_id");--> statement-breakpoint
CREATE INDEX "idx_live_assignments_flow_id" ON "live_workflow_assignments" USING btree ("flow_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_tmpl_participant" ON "template_participants" USING btree ("template_id","participant_legacy_id");--> statement-breakpoint
CREATE INDEX "idx_template_participants_template_id" ON "template_participants" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_template_participants_participant" ON "template_participants" USING btree ("participant_legacy_id");