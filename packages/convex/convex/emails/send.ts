import { action } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Send email via Resend
 */
export const sendEmail = action({
  args: {
    emailId: v.id("emails"),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
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
      throw new Error("Você não tem permissão para enviar este email");
    }

    // Check if already sent
    if (email.status === "enviado") {
      return {
        success: false,
        message: "Email já foi enviado anteriormente",
      };
    }

    // Check if lead has email
    if (!lead.email) {
      return {
        success: false,
        message: "Lead não possui endereço de email",
      };
    }

    // Placeholder: Resend integration will be implemented later
    // For now, just update status
    await ctx.db.patch(emailId, {
      status: "enviado",
      enviadoEm: Date.now(),
    });

    return {
      success: true,
      message: "Email enviado com sucesso",
    };
  },
});
