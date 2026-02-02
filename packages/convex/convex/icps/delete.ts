import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Delete ICP (verify ownership)
 */
export const deleteICP = mutation({
  args: {
    icpId: v.id("icps"),
  },
  returns: v.null(),
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
      throw new Error("ICP não encontrado");
    }

    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para excluir este ICP");
    }

    // Check if there are leads or search jobs associated with this ICP
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_icp", (q) => q.eq("icpId", icpId))
      .take(1);

    if (leads.length > 0) {
      throw new Error("Não é possível excluir ICP com leads associados");
    }

    const searchJobs = await ctx.db
      .query("searchJobs")
      .withIndex("by_icp", (q) => q.eq("icpId", icpId))
      .take(1);

    if (searchJobs.length > 0) {
      throw new Error("Não é possível excluir ICP com buscas em andamento");
    }

    await ctx.db.delete(icpId);

    // If this was the default, set another as default
    if (icp.isDefault) {
      const remainingIcps = await ctx.db
        .query("icps")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .take(1);

      if (remainingIcps.length > 0) {
        await ctx.db.patch(remainingIcps[0]._id, { isDefault: true });
      }
    }

    return null;
  },
});
