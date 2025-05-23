import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Organizational roles
export enum OrganizationRole {
  ADMIN = "admin",
  MEMBER = "member",
}

// Passes table
export const passes = pgTable(
  "passes",
  {
    id: serial("id").primaryKey(),
    pass_share_id: text("pass_share_id").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    file_url: text("file_url").notNull(),
    authentication_token: text("authentication_token").notNull(),
    slug: text("slug").notNull(),
    serial_number: text("serial_number").notNull(),
    user_id: text("user_id").notNull(),
    logo_text: text("logo_text"),
    background_color: text("background_color"),
    text_color: text("text_color"),
    logo_url: text("logo_url"),
    strip_image: text("strip_image"),
    secondary_left_label: text("secondary_left_label"),
    secondary_left_value: text("secondary_left_value"),
    secondary_right_label: text("secondary_right_label"),
    secondary_right_value: text("secondary_right_value"),
    barcode_value: text("barcode_value"),
    barcode_format: text("barcode_format"),
    website_url: text("website_url"),
    header_field_label: text("header_field_label"),
    header_field_value: text("header_field_value"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    uniqueShareId: uniqueIndex("uq_passes_share_id").on(table.pass_share_id),
    uniqueSerial: uniqueIndex("uq_passes_serial_number").on(
      table.serial_number,
    ),
    uniqueSlugPerOrg: uniqueIndex("uq_passes_org_slug").on(table.slug),
  }),
);

// Pass installs
export const pass_installs = pgTable("pass_installs", {
  id: serial("id").primaryKey(),
  pass_id: integer("pass_id")
    .notNull()
    .references(() => passes.id),
  user_agent: text("user_agent"),
  ip: text("ip"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pass registrations
export const pass_registrations = pgTable("pass_registrations", {
  id: serial("id").primaryKey(),
  device_library_identifier: text("device_library_identifier").notNull(),
  push_token: text("push_token").notNull(),
  pass_type_identifier: text("pass_type_identifier").notNull(),
  authentication_token: text("authentication_token").notNull(),
  serial_number: text("serial_number").notNull(),
  pass_id: integer("pass_id")
    .notNull()
    .references(() => passes.id),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Pass messages
export const pass_messages = pgTable("pass_messages", {
  id: serial("id").primaryKey(),
  pass_id: integer("pass_id")
    .notNull()
    .references(() => passes.id),
  message: text("message").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const onboarding_info = pgTable("onboarding_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id").notNull(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  company_url: text("company_url").notNull(),
  total_visitors: text("total_visitors").notNull(),
});
