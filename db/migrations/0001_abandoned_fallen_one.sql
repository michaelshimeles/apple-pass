CREATE TABLE "passes" (
	"id" integer PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"description" text NOT NULL,
	"files" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" text NOT NULL,
	"updatedAt" text NOT NULL
);
--> statement-breakpoint
DROP TABLE "todo" CASCADE;