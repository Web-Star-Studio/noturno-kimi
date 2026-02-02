import { betterAuth } from "better-auth";
import { convexAdapter } from "@better-auth/convex";

export const auth = betterAuth({
  database: convexAdapter(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {},
});

export type Auth = typeof auth;
