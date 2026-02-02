import { httpRouter } from "../_generated/server";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

/**
 * HTTP actions for Better Auth webhooks
 * 
 * These endpoints handle auth callbacks and webhooks from Better Auth.
 */
const http = httpRouter();

/**
 * Webhook for user creation/updates from Better Auth
 */
http.route({
  path: "/auth/webhook",
  method: "POST",
  handler: action({
    args: { request: v.any() },
    returns: v.any(),
    handler: async (ctx, { request }) => {
      const body = await request.json();
      
      switch (body.event) {
        case "user.created":
        case "user.updated": {
          const { user } = body;
          await ctx.runMutation(internal.auth.syncUser, {
            betterAuthId: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
          });
          break;
        }
        case "user.deleted": {
          const { user } = body;
          await ctx.runMutation(internal.auth.deleteUser, {
            betterAuthId: user.id,
          });
          break;
        }
      }
      
      return new Response("OK", { status: 200 });
    },
  }),
});

/**
 * Health check endpoint
 */
http.route({
  path: "/health",
  method: "GET",
  handler: action({
    args: {},
    returns: v.any(),
    handler: async () => {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  }),
});

export default http;

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Sync user from Better Auth to our users table
 */
export const syncUser = internalMutation({
  args: {
    betterAuthId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  returns: v.id("users"),
  handler: async (ctx, { betterAuthId, email, name }) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", betterAuthId))
      .unique();
    
    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, { email, name });
      return existing._id;
    }
    
    // Create new user
    return await ctx.db.insert("users", {
      betterAuthId,
      email,
      name,
    });
  },
});

/**
 * Delete user when deleted from Better Auth
 */
export const deleteUser = internalMutation({
  args: {
    betterAuthId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { betterAuthId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", betterAuthId))
      .unique();
    
    if (user) {
      await ctx.db.delete(user._id);
    }
    
    return null;
  },
});
