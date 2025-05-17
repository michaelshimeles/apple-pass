import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const passes = pgTable("passes", {
  id: serial("id").primaryKey(),
  passShareId: text("pass_share_id"),

  name: text("name").notNull(),
  description: text("description").notNull(),

  fileUrl: text("file_url").notNull(),
  authenticationToken: text("authentication_token").notNull(),
  slug: text("slug").notNull(),
  serialNumber: text("serialNumber").notNull().unique(),

  userId: text("created_by").notNull(),

  // Custom visual fields
  logoText: text("logo_text"),
  backgroundColor: text("background_color"),
  textColor: text("text_color"),
  // Images
  logoUrl: text("logo_url"),
  stripImage: text("strip_image"),

  // Pass fields
  secondaryLeftLabel: text("secondary_left_label"),
  secondaryLeftValue: text("secondary_left_value"),
  secondaryRightLabel: text("secondary_right_label"),
  secondaryRightValue: text("secondary_right_value"),

  // Barcode and links
  barcodeValue: text("barcode_value"),
  barcodeFormat: text("barcode_format"),
  websiteUrl: text("website_url"),
  headerFieldLabel: text("header_field_label"),
  headerFieldValue: text("header_field_value"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const passInstalls = pgTable("pass_installs", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id")
    .references(() => passes.id)
    .notNull(),
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
  passId: integer("pass_id")
    .references(() => passes.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passMessages = pgTable("pass_messages", {
  id: serial("id").primaryKey(),
  passId: integer("pass_id")
    .notNull()
    .references(() => passes.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAnalytics = pgTable("user_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Optional: use Clerk userId if logged in
  userId: text("user_id"),

  // Required: link to pass
  passId: integer("pass_id")
    .references(() => passes.id)
    .notNull(),

  // Device + Browser Info
  os: text("os"),
  browser: text("browser"),
  deviceType: text("device_type"), // mobile / tablet / desktop

  // Region Info
  country: text("country"),
  region: text("region"),
  city: text("city"),

  // Optional: frontend metrics
  screenSize: text("screen_size"),
  timezone: text("timezone"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
