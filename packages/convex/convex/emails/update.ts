import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Update email content
 */
export const updateEmail = mutation({
  args: {
    emailId: v.id("emails"),
    assunto: v.optional(v.string()),
    corpo: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("emails"),
    _creationTime: v.number(),
    leadId: v.id("leads"),
    assunto: v.string(),
    corpo: v.string(),
    status: v.string(),
    enviadoEm: v.optional(v.number()),
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

    const email = await ctx.db.get(args.emailId);

    if (!email) {
      throw new Error("Email não encontrado");
    }

    // Verify ownership through lead
    const lead = await ctx.db.get(email.leadId);
    if (!lead || lead.userId !== user._id) {
      throw new Error("Você não tem permissão para editar este email");
    }

    // Prevent editing sent emails
    if (email.status === "enviado") {
      throw new Error("Não é possível editar emails já enviados");
    }

    const updateData: {
      assunto?: string;
      corpo?: string;
    } = {};

    if (args.assunto !== undefined) {
      const trimmed = args.assunto.trim();
      if (trimmed.length === 0) {
        throw new Error("Assunto não pode estar vazio");
      }
      updateData.assunto = trimmed;
    }

    if (args.corpo !== undefined) {
      const trimmed = args.corpo.trim();
      if (trimmed.length === 0) {
        throw new Error("Corpo do email não pode estar vazio");
      }
      updateData.corpo = trimmed;
    }

    await ctx.db.patch(args.emailId, updateData);

    const updatedEmail = await ctx.db.get(args.emailId);
    
    if (!updatedEmail) {
      throw new Error("Erro ao atualizar email");
    }

    return updatedEmail;
  },
});

/**
 * Update email status (rascunho -> enviado)
 */
export const updateEmailStatus = mutation({
  args: {
    emailId: v.id("emails"),
    status: v.string(),
  },
  returns: v.object({
    _id: v.id("emails"),
    _creationTime: v.number(),
    leadId: v.id("leads"),
    assunto: v.string(),
    corpo: v.string(),
    status: v.string(),
    enviadoEm: v.optional(v.number()),
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

    const email = await ctx.db.get(args.emailId);

    if (!email) {
      throw new Error("Email não encontrado");
    }

    // Verify ownership through lead
    const lead = await ctx.db.get(email.leadId);
    if (!lead || lead.userId !== user._id) {
      throw new Error("Você não tem permissão para editar este email");
    }

    const trimmedStatus = args.status.trim();
    if (trimmedStatus.length === 0) {
      throw new Error("Status não pode estar vazio");
    }

    const updateData: {
      status: string;
      enviadoEm?: number;
    } = { status: trimmedStatus };

    // Set enviadoEm when status changes to "enviado"
    if (trimmedStatus === "enviado" && email.status !== "enviado") {
      updateData.enviadoEm = Date.now();
    }

    await ctx.db.patch(args.emailId, updateData);

    const updatedEmail = await ctx.db.get(args.emailId);
    
    if (!updatedEmail) {
      throw new Error("Erro ao atualizar status do email");
    }

    return updatedEmail;
  },
});
