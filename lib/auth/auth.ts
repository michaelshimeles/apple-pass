import { Pool } from "pg";
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
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
  // },
  plugins: [
    organization({
      organizationCreation: {
        disabled: false, // Set to true to disable organization creation
        beforeCreate: async ({ organization, user }, request) => {
          console.log("organization", organization);
          console.log("user", user);
          console.log("request", request);
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
  ],
});
