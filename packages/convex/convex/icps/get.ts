import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Get ICP by ID (verify ownership)
 */
export const getICP = query({
  args: {
    icpId: v.id("icps"),
  },
  returns: v.union(
    v.object({
      _id: v.id("icps"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      nicho: v.string(),
      regiao: v.string(),
      palavrasChave: v.array(v.string()),
      isDefault: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, { icpId }) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const icp = await ctx.db.get(icpId);

    if (!icp) {
      return null;
    }

    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar este ICP");
    }

    return icp;
  },
});

/**
 * List all ICPs for current user
 */
export const listICPs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("icps"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      nicho: v.string(),
      regiao: v.string(),
      palavrasChave: v.array(v.string()),
      isDefault: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const icps = await ctx.db
      .query("icps")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return icps;
  },
});

/**
 * Get user's default ICP
 */
export const getDefaultICP = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("icps"),
      _creationTime: v.number(),
      userId: v.id("users"),
      name: v.string(),
      nicho: v.string(),
      regiao: v.string(),
      palavrasChave: v.array(v.string()),
      isDefault: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Não autenticado");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const defaultIcp = await ctx.db
      .query("icps")
      .withIndex("by_user_default", (q) => q.eq("userId", user._id).eq("isDefault", true))
      .unique();

    return defaultIcp || null;
  },
});
