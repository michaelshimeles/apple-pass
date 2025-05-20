CREATE TABLE "organization_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" serial PRIMARY KEY NOT NULL,
	"org_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"admin_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "passes" DROP CONSTRAINT "passes_serialNumber_unique";--> statement-breakpoint
ALTER TABLE "pass_installs" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pass_installs" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pass_installs" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pass_messages" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pass_messages" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pass_messages" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pass_registrations" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "pass_registrations" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pass_registrations" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ALTER COLUMN "pass_share_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_analytics" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_analytics" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "pass_registrations" ADD COLUMN "device_library_identifier" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pass_registrations" ADD COLUMN "pass_type_identifier" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pass_registrations" ADD COLUMN "authentication_token" text NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "organization_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "serial_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_org_members_org_user" ON "organization_members" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_organizations_org_id" ON "organizations" USING btree ("org_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_organizations_name" ON "organizations" USING btree ("name");--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_passes_share_id" ON "passes" USING btree ("pass_share_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_passes_serial_number" ON "passes" USING btree ("serial_number");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_passes_org_slug" ON "passes" USING btree ("organization_id","slug");--> statement-breakpoint
ALTER TABLE "pass_registrations" DROP COLUMN "device_library_id";--> statement-breakpoint
ALTER TABLE "pass_registrations" DROP COLUMN "pass_type_id";--> statement-breakpoint
ALTER TABLE "pass_registrations" DROP COLUMN "authenticationToken";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "serialNumber";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "created_by";