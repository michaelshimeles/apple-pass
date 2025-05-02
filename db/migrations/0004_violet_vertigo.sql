ALTER TABLE "pass_installs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "pass_installs" ADD COLUMN "ip" text;--> statement-breakpoint
ALTER TABLE "pass_installs" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "pass_installs" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "pass_installs" DROP COLUMN "added_at";