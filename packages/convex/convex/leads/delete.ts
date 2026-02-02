import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Delete lead and associated data
 */
export const deleteLead = mutation({
  args: {
    leadId: v.id("leads"),
  },
  returns: v.null(),
  handler: async (ctx, { leadId }) => {
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

    const lead = await ctx.db.get(leadId);

    if (!lead) {
      throw new Error("Lead não encontrado");
    }

    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para excluir este lead");
    }

    // Delete associated preCallReports
    const preCallReports = await ctx.db
      .query("preCallReports")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .collect();

    for (const report of preCallReports) {
      await ctx.db.delete(report._id);
    }

    // Delete associated emails
    const emails = await ctx.db
      .query("emails")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .collect();

    for (const email of emails) {
      await ctx.db.delete(email._id);
    }

    // Delete the lead
    await ctx.db.delete(leadId);

    return null;
  },
});
