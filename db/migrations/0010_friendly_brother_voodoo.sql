CREATE TABLE "pass_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"pass_id" integer NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pass_messages" ADD CONSTRAINT "pass_messages_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE no action ON UPDATE no action;