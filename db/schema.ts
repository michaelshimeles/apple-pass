import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const passes = pgTable("passes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fileUrl: text("file_url").notNull(),
  authenticationToken: text("authentication_token").notNull(),
  slug: text("slug").notNull(), // short user-friendly ID for URLs
  serialNumber: text("serialNumber").notNull().unique(), // used in QR code
  userId: text("created_by").notNull(), // user who created it
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});


export const passInstalls = pgTable("pass_installs", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passRegistrations = pgTable("pass_registrations", {
  id: serial("id").primaryKey(),
  deviceLibraryIdentifier: text("device_library_id").notNull(),
  pushToken: text("push_token").notNull(),
  passTypeIdentifier: text("pass_type_id").notNull(),
  authenticationToken: text("authenticationToken").notNull(),
  serialNumber: text("serial_number").notNull(),
  passId: integer("pass_id").references(() => passes.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


export const passMessages = pgTable("pass_messages", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id").notNull().references(() => passes.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
