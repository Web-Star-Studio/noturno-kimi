import { createAuthClient } from "better-auth/client";
import { convexClient } from "@better-auth/convex/client";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
