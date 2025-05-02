ALTER TABLE "passes" RENAME COLUMN "slug" TO "serialNumber";--> statement-breakpoint
ALTER TABLE "passes" DROP CONSTRAINT "passes_slug_unique";--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_serialNumber_unique" UNIQUE("serialNumber");