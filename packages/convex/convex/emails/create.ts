import { mutation, action } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create email for lead
 */
export const createEmail = mutation({
  args: {
    leadId: v.id("leads"),
    assunto: v.string(),
    corpo: v.string(),
    status: v.optional(v.string()),
  },
  returns: v.id("emails"),
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

    // Verify lead ownership
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead não encontrado");
    }
    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para criar emails para este lead");
    }

    // Validation
    if (args.assunto.trim().length === 0) {
      throw new Error("Assunto é obrigatório");
    }

    if (args.corpo.trim().length === 0) {
      throw new Error("Corpo do email é obrigatório");
    }

    const emailId = await ctx.db.insert("emails", {
      leadId: args.leadId,
      assunto: args.assunto.trim(),
      corpo: args.corpo.trim(),
      status: args.status?.trim() || "rascunho",
    });

    return emailId;
  },
});

/**
 * Generate email via OpenAI (placeholder)
 */
export const generateEmail = action({
  args: {
    leadId: v.id("leads"),
    icpId: v.id("icps"),
    prompt: v.optional(v.string()),
  },
  returns: v.object({
    assunto: v.string(),
    corpo: v.string(),
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

    // Verify lead ownership
    const lead = await ctx.db.get(args.leadId);
    if (!lead) {
      throw new Error("Lead não encontrado");
    }
    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para gerar emails para este lead");
    }

    // Verify ICP ownership
    const icp = await ctx.db.get(args.icpId);
    if (!icp) {
      throw new Error("ICP não encontrado");
    }
    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para usar este ICP");
    }

    // Placeholder: OpenAI integration will be implemented later
    // For now, return a template
    const assunto = `Oportunidade para ${lead.nomeEmpresa}`;
    const corpo = `Olá ${lead.nomeContato || "Time"},\n\n` +
      `Espero que esteja tudo bem com você e com a ${lead.nomeEmpresa}.\n\n` +
      `Estou entrando em contato porque acredito que podemos ajudar...\n\n` +
      `Atenciosamente,\n${user.name}`;

    return {
      assunto,
      corpo,
    };
  },
});
