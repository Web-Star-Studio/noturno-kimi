import type { Context } from "../_generated/api";

/**
 * Better Auth configuration for Convex
 *
 * This configuration uses the Convex adapter to store auth data
 * directly in Convex tables.
 */
export const betterAuthConfig = {
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: {
    // Using Convex adapter - data stored in Convex tables
    provider: "convex",
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      // TODO: Implement email sending via Resend
      console.log("Reset password URL:", url);
      console.log("User:", user);
    },
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // TODO: Implement email verification via Resend
      console.log("Email verification URL:", url);
      console.log("User:", user);
    },
  },
  socialProviders: {
    // Social providers can be added here
    // google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: false, // Let Convex generate IDs
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
};
