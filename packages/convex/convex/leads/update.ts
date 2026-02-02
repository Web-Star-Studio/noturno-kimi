import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Update lead info
 */
export const updateLead = mutation({
  args: {
    leadId: v.id("leads"),
    nomeEmpresa: v.optional(v.string()),
    nomeContato: v.optional(v.string()),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    fonte: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("leads"),
    _creationTime: v.number(),
    userId: v.id("users"),
    icpId: v.id("icps"),
    nomeEmpresa: v.string(),
    nomeContato: v.optional(v.string()),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    fonte: v.string(),
    status: v.string(),
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

    const lead = await ctx.db.get(args.leadId);

    if (!lead) {
      throw new Error("Lead não encontrado");
    }

    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para editar este lead");
    }

    const updateData: {
      nomeEmpresa?: string;
      nomeContato?: string;
      email?: string;
      telefone?: string;
      website?: string;
      fonte?: string;
    } = {};

    if (args.nomeEmpresa !== undefined) {
      const trimmed = args.nomeEmpresa.trim();
      if (trimmed.length === 0) {
        throw new Error("Nome da empresa não pode estar vazio");
      }
      updateData.nomeEmpresa = trimmed;
    }

    if (args.nomeContato !== undefined) {
      updateData.nomeContato = args.nomeContato.trim() || undefined;
    }

    if (args.email !== undefined) {
      updateData.email = args.email.trim() || undefined;
    }

    if (args.telefone !== undefined) {
      updateData.telefone = args.telefone.trim() || undefined;
    }

    if (args.website !== undefined) {
      updateData.website = args.website.trim() || undefined;
    }

    if (args.fonte !== undefined) {
      const trimmed = args.fonte.trim();
      if (trimmed.length === 0) {
        throw new Error("Fonte não pode estar vazia");
      }
      updateData.fonte = trimmed;
    }

    await ctx.db.patch(args.leadId, updateData);

    const updatedLead = await ctx.db.get(args.leadId);
    
    if (!updatedLead) {
      throw new Error("Erro ao atualizar lead");
    }

    return updatedLead;
  },
});

/**
 * Update lead status
 */
export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.string(),
  },
  returns: v.object({
    _id: v.id("leads"),
    _creationTime: v.number(),
    userId: v.id("users"),
    icpId: v.id("icps"),
    nomeEmpresa: v.string(),
    nomeContato: v.optional(v.string()),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    fonte: v.string(),
    status: v.string(),
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

    const lead = await ctx.db.get(args.leadId);

    if (!lead) {
      throw new Error("Lead não encontrado");
    }

    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para editar este lead");
    }

    const trimmedStatus = args.status.trim();
    if (trimmedStatus.length === 0) {
      throw new Error("Status não pode estar vazio");
    }

    await ctx.db.patch(args.leadId, { status: trimmedStatus });

    const updatedLead = await ctx.db.get(args.leadId);
    
    if (!updatedLead) {
      throw new Error("Erro ao atualizar status do lead");
    }

    return updatedLead;
  },
});
