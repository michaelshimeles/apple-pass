ALTER TABLE "organization_members" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "organizations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_analytics" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "organization_members" CASCADE;--> statement-breakpoint
DROP TABLE "organizations" CASCADE;--> statement-breakpoint
DROP TABLE "user_analytics" CASCADE;--> statement-breakpoint
ALTER TABLE "onboarding_info" DROP CONSTRAINT "onboarding_info_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "passes" DROP CONSTRAINT "passes_organization_id_organizations_id_fk";
--> statement-breakpoint
DROP INDEX "uq_passes_org_slug";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_passes_org_slug" ON "passes" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "onboarding_info" DROP COLUMN "organization_id";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "organization_id";