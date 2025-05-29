import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins"; // Keep this as 'organization'
import { sendOrganizationInvitation } from "../email";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { db } from "@/db/drizzle";
import { subscription } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { member, organization as organizationSchema } from "@/db/schema"; // ✅ Rename these to avoid conflict

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

async function getActiveOrganization(userId: string) {
  // First try to get organizations where user is admin
  const adminOrgs = await db
    .select({
      id: organizationSchema.id,
      name: organizationSchema.name,
      slug: organizationSchema.slug,
    })
    .from(member)
    .innerJoin(
      organizationSchema,
      eq(member.organizationId, organizationSchema.id),
    )
    .where(and(eq(member.userId, userId), eq(member.role, "admin")))
    .limit(1);

  if (adminOrgs.length > 0) {
    return adminOrgs[0];
  }

  // Fallback to any organization where user is a member
  const memberOrgs = await db
    .select({
      id: organizationSchema.id,
      name: organizationSchema.name,
      slug: organizationSchema.slug,
    })
    .from(member)
    .innerJoin(
      organizationSchema,
      eq(member.organizationId, organizationSchema.id),
    )
    .where(eq(member.userId, userId))
    .limit(1);

  if (memberOrgs.length > 0) {
    return memberOrgs[0];
  }

  // If no organization found, throw error
  throw new Error("No organization found for user");
}

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    `${process.env.NEXT_PUBLIC_APP_URL}`,
    "https://1e78-134-231-56-45.ngrok-free.app",
  ],
  allowedDevOrigins: [
    "http://localhost:3000",
    `${process.env.NEXT_PUBLIC_APP_URL}`,
    "https://1e78-134-231-56-45.ngrok-free.app",
  ],
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // Cache duration in seconds
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const organization = await getActiveOrganization(session.userId);
          return {
            data: {
              ...session,
              activeOrganizationId: organization.id,
            },
          };
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/accept-invitation/${data.id}`;
        sendOrganizationInvitation({
          email: data.email,
          invitedByUsername: data.inviter.user.name,
          invitedByEmail: data.inviter.user.email,
          teamName: data.organization.name,
          inviteLink,
        });
      },
      organizationCreation: {
        disabled: false, // Set to true to disable organization creation
        beforeCreate: async ({ organization, user }, request) => {
          console.log("organization", organization);
          console.log("user", user);
          console.log("request", request);
          // Run custom logic before organization is created
          // Optionally modify the organization data
          return {
            data: {
              ...organization,
              metadata: {
                customField: "value",
              },
            },
          };
        },
        afterCreate: async ({ organization, member, user }, request) => {
          console.log("organization", organization);
          console.log("member", member);
          console.log("user", user);
          console.log("request", request);
          // Run custom logic after organization is created
          // e.g., create default resources, send notifications
          // await setupDefaultResources(organization.id);
        },
      },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: process.env.NEXT_PUBLIC_STARTER_TIER!,
              slug: process.env.NEXT_PUBLIC_STARTER_SLUG!, // Custom slug for easy reference in Checkout URL, e.g. /checkout/Exodus-Labs
            },
            {
              productId: process.env.NEXT_PUBLIC_PROFESSIONAL_TIER!,
              slug: process.env.NEXT_PUBLIC_PROFESSIONAL_SLUG!, // Custom slug for easy reference in Checkout URL, e.g. /checkout/Exodus-Labs
            },
          ],
          successUrl: process.env.POLAR_SUCCESS_URL,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: process.env.POLAR_WEBHOOK_SECRET!,
          onPayload: async ({ data, type }) => {
            if (
              type === "subscription.created" ||
              type === "subscription.active" ||
              type === "subscription.canceled" ||
              type === "subscription.revoked" ||
              type === "subscription.uncanceled" ||
              type === "subscription.updated"
            ) {
              console.log("🎯 Processing subscription webhook:", type);
              console.log("📦 Payload data:", JSON.stringify(data, null, 2));

              try {
                // STEP 1: Extract user ID from customer data
                const userId = data.customer?.externalId;
                let organizationId = null;

                console.log("👤 Customer data:", {
                  customerId: data.customerId,
                  userId: userId,
                  polarOrgId: data.customer?.organizationId,
                });

                // STEP 2: Map to local organization
                if (userId) {
                  // First try: Get user's admin organizations (they pay for subscriptions)
                  const adminMemberships = await db
                    .select({ organizationId: member.organizationId })
                    .from(member)
                    .where(
                      and(
                        eq(member.userId, userId),
                        eq(member.role, "admin"), // Admins are the ones who can have subscriptions
                      ),
                    );

                  if (adminMemberships.length > 0) {
                    organizationId = adminMemberships[0].organizationId;
                    console.log("✅ Found admin organization:", organizationId);
                  } else {
                    // Fallback: Get any organization they're a member of
                    const anyMemberships = await db
                      .select({ organizationId: member.organizationId })
                      .from(member)
                      .where(eq(member.userId, userId))
                      .limit(1);

                    if (anyMemberships.length > 0) {
                      organizationId = anyMemberships[0].organizationId;
                      console.log(
                        "✅ Found member organization:",
                        organizationId,
                      );
                    } else {
                      console.log("❌ No organization found for user:", userId);
                    }
                  }
                }

                // STEP 3: Additional fallback - check metadata for referenceId
                if (!organizationId && data.metadata?.referenceId) {
                  // Check if referenceId is actually an organizationId
                  const orgExists = await db
                    .select({ id: organization.id })
                    .from(organizationSchema)
                    .where(eq(organization.id, data.metadata.referenceId))
                    .limit(1);

                  if (orgExists.length > 0) {
                    organizationId = data.metadata.referenceId;
                    console.log(
                      "✅ Found organization from metadata:",
                      organizationId,
                    );
                  }
                }

                // STEP 4: Build subscription data
                const subscriptionData = {
                  id: data.id,
                  createdAt: new Date(data.createdAt),
                  modifiedAt: data.modifiedAt
                    ? new Date(data.modifiedAt)
                    : null,
                  amount: data.amount,
                  currency: data.currency,
                  recurringInterval: data.recurringInterval,
                  status: data.status,
                  currentPeriodStart: new Date(data.currentPeriodStart),
                  currentPeriodEnd: new Date(data.currentPeriodEnd),
                  cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
                  canceledAt: data.canceledAt
                    ? new Date(data.canceledAt)
                    : null,
                  startedAt: new Date(data.startedAt),
                  endsAt: data.endsAt ? new Date(data.endsAt) : null,
                  endedAt: data.endedAt ? new Date(data.endedAt) : null,
                  customerId: data.customerId,
                  productId: data.productId,
                  discountId: data.discountId || null,
                  checkoutId: data.checkoutId,
                  customerCancellationReason:
                    data.customerCancellationReason || null,
                  customerCancellationComment:
                    data.customerCancellationComment || null,
                  metadata: data.metadata
                    ? JSON.stringify(data.metadata)
                    : null,
                  customFieldData: data.customFieldData
                    ? JSON.stringify(data.customFieldData)
                    : null,
                  organizationId: organizationId, // ✅ Mapped to local org
                  userId: userId,
                };

                console.log("💾 Final subscription data:", {
                  id: subscriptionData.id,
                  status: subscriptionData.status,
                  organizationId: subscriptionData.organizationId,
                  userId: subscriptionData.userId,
                  amount: subscriptionData.amount,
                });

                // STEP 5: Upsert subscription
                const existingSubscription = await db
                  .select()
                  .from(subscription)
                  .where(eq(subscription.id, data.id))
                  .limit(1);

                if (existingSubscription.length > 0) {
                  await db
                    .update(subscription)
                    .set({
                      status: subscriptionData.status,
                      currentPeriodEnd: subscriptionData.currentPeriodEnd,
                      modifiedAt: subscriptionData.modifiedAt || new Date(),
                      organizationId: organizationId!,
                      userId: userId,
                    })
                    .where(eq(subscription.id, data.id));
                  console.log("✅ Updated subscription:", data.id);
                } else {
                  if (!organizationId) {
                    console.log(
                      "⚠️ Warning: Creating subscription without organizationId",
                    );
                  }
                  await db.insert(subscription).values(subscriptionData);
                  console.log("✅ Created subscription:", data.id);
                }
              } catch (error) {
                console.error(
                  "💥 Error processing subscription webhook:",
                  error,
                );
                // Don't throw - let webhook succeed to avoid retries
              }
            }
          },
        }),
      ],
    }),
  ],
});
