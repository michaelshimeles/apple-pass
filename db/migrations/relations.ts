import { relations } from "drizzle-orm/relations";
import { organization, passes, passInstalls, passMessages, user, account, member, session, passRegistrations, invitation, subscription } from "./schema";

export const passesRelations = relations(passes, ({one, many}) => ({
	organization: one(organization, {
		fields: [passes.organizationId],
		references: [organization.id]
	}),
	passInstalls: many(passInstalls),
	passMessages: many(passMessages),
	passRegistrations: many(passRegistrations),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	passes: many(passes),
	members: many(member),
	sessions: many(session),
	invitations: many(invitation),
	subscriptions: many(subscription),
}));

export const passInstallsRelations = relations(passInstalls, ({one}) => ({
	pass: one(passes, {
		fields: [passInstalls.passId],
		references: [passes.id]
	}),
}));

export const passMessagesRelations = relations(passMessages, ({one}) => ({
	pass: one(passes, {
		fields: [passMessages.passId],
		references: [passes.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	members: many(member),
	sessions: many(session),
	invitations: many(invitation),
	subscriptions: many(subscription),
}));

export const memberRelations = relations(member, ({one}) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [session.activeOrganizationId],
		references: [organization.id]
	}),
}));

export const passRegistrationsRelations = relations(passRegistrations, ({one}) => ({
	pass: one(passes, {
		fields: [passRegistrations.passId],
		references: [passes.id]
	}),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
}));

export const subscriptionRelations = relations(subscription, ({one}) => ({
	organization: one(organization, {
		fields: [subscription.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [subscription.userId],
		references: [user.id]
	}),
}));