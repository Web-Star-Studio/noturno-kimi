import { betterAuth } from "better-auth";
import { convex } from "@convex-dev/better-auth/plugins";

export const auth = betterAuth({
  database: convexAdapter(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: {},
});

export type Auth = typeof auth;
