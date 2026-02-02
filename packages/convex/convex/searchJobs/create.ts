import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create new search job
 */
export const createSearchJob = mutation({
  args: {
    icpId: v.id("icps"),
  },
  returns: v.id("searchJobs"),
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

    // Verify ICP ownership
    const icp = await ctx.db.get(icpId);
    if (!icp) {
      throw new Error("ICP não encontrado");
    }
    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para criar jobs neste ICP");
    }

    const jobId = await ctx.db.insert("searchJobs", {
      userId: user._id,
      icpId: icpId,
      status: "pending",
      progresso: 0,
    });

    return jobId;
  },
});
