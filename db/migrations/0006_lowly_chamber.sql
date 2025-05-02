CREATE TABLE "pass_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"device_library_id" text NOT NULL,
	"push_token" text NOT NULL,
	"pass_type_id" text NOT NULL,
	"serial_number" text NOT NULL,
	"pass_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pass_registrations" ADD CONSTRAINT "pass_registrations_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE no action ON UPDATE no action;