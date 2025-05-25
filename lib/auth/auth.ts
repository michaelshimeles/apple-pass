import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
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
import { eq } from "drizzle-orm";

const polarClient = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  // Use 'sandbox' if you're using the Polar Sandbox environment
  // Remember that access tokens, products, etc. are completely separated between environments.
  // Access tokens obtained in Production are for instance not usable in the Sandbox environment.
  server: "sandbox",
});

export const auth = betterAuth({
  trustedOrigins: [
    "http://localhost:3000",
    `${process.env.NEXT_PUBLIC_APP_URL}`,
  ],
  allowedDevOrigins: [
    "http://localhost:3000",
    `${process.env.NEXT_PUBLIC_APP_URL}`,
  ],
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // Cache duration in seconds
  },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // emailVerification: {
  //   sendVerificationEmail: async ({ user, url }) => {
  //     console.log(user);
  //     console.log(url);
  //     // implement your logic here to send email verification
  //   },
  // }
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
      // allowUserToCreateOrganization: async (user) => {
      //   // const subscription = await getSubscription(user.id);
      //   // return subscription.plan === "pro";
      // },
      // organizationCreation: {
      // disabled: false, // Set to true to disable organization creation
      // beforeCreate: async ({ organization, user }, request) => {
      // console.log("organization", organization);
      // console.log("user", user);
      // console.log("request", request);
      // Run custom logic before organization is created
      // Optionally modify the organization data
      // return {
      //   data: {
      //     ...organization,
      //     metadata: {
      //       customField: "value",
      //     },
      //   },
      // };
      // },
      // afterCreate: async ({ organization, member, user }, request) => {
      // console.log("organization", organization);
      // console.log("member", member);
      // console.log("user", user);
      // console.log("request", request);
      // Run custom logic after organization is created
      // e.g., create default resources, send notifications
      // await setupDefaultResources(organization.id);
      // },
      // },
    }),
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "e464123f-2fb7-4d84-9a2d-d94034da1f14",
              slug: "Exodus-Labs", // Custom slug for easy reference in Checkout URL, e.g. /checkout/Exodus-Labs
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
              console.log("payload data", JSON.stringify(data, null, 2));

              try {
                const subscriptionData = {
                  id: data.id,
                  createdAt: new Date(data?.createdAt),
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
                  canceledAt: data.cancelAtPeriodEnd
                    ? new Date(data.cancelAtPeriodEnd)
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
                    data.customerCancellationReason || null,
                  metadata: data.metadata
                    ? JSON.stringify(data.metadata)
                    : null,
                  customFieldData: data.customFieldData
                    ? JSON.stringify(data.customFieldData)
                    : null,
                  organizationId: data.organizationId || null,
                  userId: data.userId || null,
                };

                // Use upsert logic - insert if not exists, update if exists
                const existingSubscription = await db
                  .select()
                  .from(subscription)
                  .where(eq(subscription.id, data.id))
                  .limit(1);

                if (existingSubscription.length > 0) {
                  // Update existing subscription
                  await db
                    .update(subscription)
                    .set(subscriptionData)
                    .where(eq(subscription.id, data.id));
                  console.log(`Updated subscription: ${data.id}`);
                } else {
                  // Insert new subscription
                  await db.insert(subscription).values(subscriptionData);
                  console.log(`Created subscription: ${data.id}`);
                }
              } catch (error) {
                console.error("Error processing subscription webhook:", error);
              }
            }
          }, // Catch-all for all events
        }),
      ],
    }),
  ],
});
