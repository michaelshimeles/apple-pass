ALTER TABLE "passes" ADD COLUMN "strip_image" text;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "secondary_left_label" text;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "secondary_left_value" text;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "secondary_right_label" text;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "secondary_right_value" text;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "strip_image_front_url";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "strip_image_back_url";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "thumbnail_url";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "background_url";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "primary_field_label";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "primary_field_value";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "secondary_field_label";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "secondary_field_value";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "auxiliary_field_label";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "auxiliary_field_value";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "url";