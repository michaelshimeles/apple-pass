CREATE TABLE "pass_installs" (
	"id" serial PRIMARY KEY NOT NULL,
	"pass_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "id" serial PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "file_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "passes" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "pass_installs" ADD CONSTRAINT "pass_installs_pass_id_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."passes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "text";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "files";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "userId";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "passes" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "passes" ADD CONSTRAINT "passes_slug_unique" UNIQUE("slug");