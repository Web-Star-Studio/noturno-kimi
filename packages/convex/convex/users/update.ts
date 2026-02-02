import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Update current user profile
 */
export const updateUser = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    email: v.string(),
    name: v.string(),
    betterAuthId: v.string(),
  }),
  handler: async (ctx, args) => {
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

    const updateData: { name?: string; email?: string } = {};
    
    if (args.name !== undefined) {
      updateData.name = args.name;
    }
    
    if (args.email !== undefined) {
      updateData.email = args.email;
    }

    await ctx.db.patch(user._id, updateData);

    const updatedUser = await ctx.db.get(user._id);
    
    if (!updatedUser) {
      throw new Error("Erro ao atualizar usuário");
    }

    return updatedUser;
  },
});
