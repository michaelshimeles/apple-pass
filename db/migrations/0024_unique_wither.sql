ALTER TABLE "onboarding_info" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "onboarding_info" ADD COLUMN "position" text NOT NULL;