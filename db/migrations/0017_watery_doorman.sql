CREATE TABLE "user_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"pass_id" integer NOT NULL,
	"os" text,
	"browser" text,
	"device_type" text,
	"country" text,
	"region" text,
	"city" text,
	"screen_size" text,
	"timezone" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE no action ON UPDATE no action;