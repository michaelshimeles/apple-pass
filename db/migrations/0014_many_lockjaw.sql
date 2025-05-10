ALTER TABLE "passes" ALTER COLUMN "pass_share_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "passes" ALTER COLUMN "pass_share_id" DROP NOT NULL;