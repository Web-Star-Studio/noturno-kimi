import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create new ICP with validation
 */
export const createICP = mutation({
  args: {
    name: v.string(),
    nicho: v.string(),
    regiao: v.string(),
    palavrasChave: v.array(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  returns: v.id("icps"),
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

    // Validation
    if (args.name.trim().length === 0) {
      throw new Error("Nome do ICP é obrigatório");
    }

    if (args.nicho.trim().length === 0) {
      throw new Error("Nicho é obrigatório");
    }

    if (args.regiao.trim().length === 0) {
      throw new Error("Região é obrigatória");
    }

    if (args.palavrasChave.length === 0) {
      throw new Error("Pelo menos uma palavra-chave é obrigatória");
    }

    // If this is the first ICP, make it default
    const existingIcps = await ctx.db
      .query("icps")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const shouldBeDefault = args.isDefault ?? existingIcps.length === 0;

    // If setting as default, unset others
    if (shouldBeDefault) {
      for (const icp of existingIcps) {
        if (icp.isDefault) {
          await ctx.db.patch(icp._id, { isDefault: false });
        }
      }
    }

    const icpId = await ctx.db.insert("icps", {
      userId: user._id,
      name: args.name.trim(),
      nicho: args.nicho.trim(),
      regiao: args.regiao.trim(),
      palavrasChave: args.palavrasChave.map(p => p.trim()).filter(p => p.length > 0),
      isDefault: shouldBeDefault,
    });

    return icpId;
  },
});
