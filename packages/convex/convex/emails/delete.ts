import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Delete email
 */
export const deleteEmail = mutation({
  args: {
    emailId: v.id("emails"),
  },
  returns: v.null(),
  handler: async (ctx, { emailId }) => {
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

    const email = await ctx.db.get(emailId);

    if (!email) {
      throw new Error("Email não encontrado");
    }

    // Verify ownership through lead
    const lead = await ctx.db.get(email.leadId);
    if (!lead || lead.userId !== user._id) {
      throw new Error("Você não tem permissão para excluir este email");
    }

    // Prevent deleting sent emails
    if (email.status === "enviado") {
      throw new Error("Não é possível excluir emails já enviados");
    }

    await ctx.db.delete(emailId);

    return null;
  },
});
