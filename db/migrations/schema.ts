import { pgTable, uniqueIndex, foreignKey, serial, text, timestamp, integer, uuid, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const passes = pgTable("passes", {
	id: serial().primaryKey().notNull(),
	passShareId: text("pass_share_id").notNull(),
	name: text().notNull(),
	description: text().notNull(),
	fileUrl: text("file_url").notNull(),
	authenticationToken: text("authentication_token").notNull(),
	slug: text().notNull(),
	serialNumber: text("serial_number").notNull(),
	userId: text("user_id").notNull(),
	logoText: text("logo_text"),
	backgroundColor: text("background_color"),
	textColor: text("text_color"),
	logoUrl: text("logo_url"),
	stripImage: text("strip_image"),
	secondaryLeftLabel: text("secondary_left_label"),
	secondaryLeftValue: text("secondary_left_value"),
	secondaryRightLabel: text("secondary_right_label"),
	secondaryRightValue: text("secondary_right_value"),
	barcodeValue: text("barcode_value"),
	barcodeFormat: text("barcode_format"),
	websiteUrl: text("website_url"),
	headerFieldLabel: text("header_field_label"),
	headerFieldValue: text("header_field_value"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	organizationId: text("organization_id"),
}, (table) => [
	uniqueIndex("uq_passes_org_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_passes_serial_number").using("btree", table.serialNumber.asc().nullsLast().op("text_ops")),
	uniqueIndex("uq_passes_share_id").using("btree", table.passShareId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "passes_organization_id_organization_id_fk"
		}),
]);

export const passInstalls = pgTable("pass_installs", {
	id: serial().primaryKey().notNull(),
	passId: integer("pass_id").notNull(),
	userAgent: text("user_agent"),
	ip: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.passId],
			foreignColumns: [passes.id],
			name: "pass_installs_pass_id_passes_id_fk"
		}),
]);

export const passMessages = pgTable("pass_messages", {
	id: serial().primaryKey().notNull(),
	passId: integer("pass_id").notNull(),
	message: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.passId],
			foreignColumns: [passes.id],
			name: "pass_messages_pass_id_passes_id_fk"
		}),
]);

export const onboardingInfo = pgTable("onboarding_info", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	name: text().notNull(),
	position: text().notNull(),
	companyUrl: text("company_url").notNull(),
	totalVisitors: text("total_visitors").notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().default(false).notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text(),
	logo: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	metadata: text(),
}, (table) => [
	unique("organization_slug_unique").on(table.slug),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const member = pgTable("member", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	userId: text().notNull(),
	role: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "member_organizationId_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "member_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
	activeOrganizationId: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.activeOrganizationId],
			foreignColumns: [organization.id],
			name: "session_activeOrganizationId_organization_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const passRegistrations = pgTable("pass_registrations", {
	id: serial().primaryKey().notNull(),
	deviceLibraryIdentifier: text("device_library_identifier").notNull(),
	pushToken: text("push_token").notNull(),
	passTypeIdentifier: text("pass_type_identifier").notNull(),
	authenticationToken: text("authentication_token").notNull(),
	serialNumber: text("serial_number").notNull(),
	passId: integer("pass_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.passId],
			foreignColumns: [passes.id],
			name: "pass_registrations_pass_id_passes_id_fk"
		}),
]);

export const invitation = pgTable("invitation", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	email: text().notNull(),
	role: text(),
	status: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	inviterId: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "invitation_organizationId_organization_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [user.id],
			name: "invitation_inviterId_user_id_fk"
		}),
]);

export const subscription = pgTable("subscription", {
	id: text().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	modifiedAt: timestamp({ mode: 'string' }),
	amount: integer().notNull(),
	currency: text().notNull(),
	recurringInterval: text().notNull(),
	status: text().notNull(),
	currentPeriodStart: timestamp({ mode: 'string' }).notNull(),
	currentPeriodEnd: timestamp({ mode: 'string' }).notNull(),
	cancelAtPeriodEnd: boolean().default(false).notNull(),
	canceledAt: timestamp({ mode: 'string' }),
	startedAt: timestamp({ mode: 'string' }).notNull(),
	endsAt: timestamp({ mode: 'string' }),
	endedAt: timestamp({ mode: 'string' }),
	customerId: text().notNull(),
	productId: text().notNull(),
	discountId: text(),
	checkoutId: text().notNull(),
	customerCancellationReason: text(),
	customerCancellationComment: text(),
	metadata: text(),
	customFieldData: text(),
	organizationId: text(),
	userId: text(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "subscription_organizationId_organization_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "subscription_userId_user_id_fk"
		}),
]);
