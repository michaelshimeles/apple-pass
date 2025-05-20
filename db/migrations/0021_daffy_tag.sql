ALTER TABLE "organization_members" DROP CONSTRAINT "organization_members_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "passes" DROP CONSTRAINT "passes_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_org_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("org_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_organization_id_organizations_org_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("org_id") ON DELETE no action ON UPDATE no action;