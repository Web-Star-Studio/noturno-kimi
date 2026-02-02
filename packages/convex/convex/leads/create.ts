import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Lead input validator
 */
const leadInputValidator = v.object({
  icpId: v.id("icps"),
  nomeEmpresa: v.string(),
  nomeContato: v.optional(v.string()),
  email: v.optional(v.string()),
  telefone: v.optional(v.string()),
  website: v.optional(v.string()),
  fonte: v.string(),
  status: v.optional(v.string()),
});

/**
 * Create single lead
 */
export const createLead = mutation({
  args: {
    icpId: v.id("icps"),
    nomeEmpresa: v.string(),
    nomeContato: v.optional(v.string()),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    fonte: v.string(),
    status: v.optional(v.string()),
  },
  returns: v.id("leads"),
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

    // Verify ICP ownership
    const icp = await ctx.db.get(args.icpId);
    if (!icp) {
      throw new Error("ICP não encontrado");
    }
    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para criar leads neste ICP");
    }

    // Validation
    if (args.nomeEmpresa.trim().length === 0) {
      throw new Error("Nome da empresa é obrigatório");
    }

    if (args.fonte.trim().length === 0) {
      throw new Error("Fonte é obrigatória");
    }

    const leadId = await ctx.db.insert("leads", {
      userId: user._id,
      icpId: args.icpId,
      nomeEmpresa: args.nomeEmpresa.trim(),
      nomeContato: args.nomeContato?.trim(),
      email: args.email?.trim(),
      telefone: args.telefone?.trim(),
      website: args.website?.trim(),
      fonte: args.fonte.trim(),
      status: args.status?.trim() || "novo",
    });

    return leadId;
  },
});

/**
 * Lead batch item validator
 */
const leadBatchItemValidator = v.object({
  icpId: v.id("icps"),
  nomeEmpresa: v.string(),
  nomeContato: v.optional(v.string()),
  email: v.optional(v.string()),
  telefone: v.optional(v.string()),
  website: v.optional(v.string()),
  fonte: v.string(),
  status: v.optional(v.string()),
});

/**
 * Create multiple leads (for search results)
 */
export const createLeadsBatch = mutation({
  args: {
    leads: v.array(leadBatchItemValidator),
  },
  returns: v.object({
    createdIds: v.array(v.id("leads")),
    errors: v.array(v.object({
      index: v.number(),
      error: v.string(),
    })),
    totalCreated: v.number(),
    totalErrors: v.number(),
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

    const createdIds: Id<"leads">[] = [];
    const errors: { index: number; error: string }[] = [];

    // Group leads by ICP to verify ownership efficiently
    const icpIds = [...new Set(args.leads.map(l => l.icpId))];
    
    for (const icpId of icpIds) {
      const icp = await ctx.db.get(icpId);
      if (!icp) {
        throw new Error(`ICP não encontrado: ${icpId}`);
      }
      if (icp.userId !== user._id) {
        throw new Error(`Você não tem permissão para criar leads no ICP: ${icpId}`);
      }
    }

    for (let i = 0; i < args.leads.length; i++) {
      const leadData = args.leads[i];

      try {
        // Validation
        if (leadData.nomeEmpresa.trim().length === 0) {
          errors.push({ index: i, error: "Nome da empresa é obrigatório" });
          continue;
        }

        if (leadData.fonte.trim().length === 0) {
          errors.push({ index: i, error: "Fonte é obrigatória" });
          continue;
        }

        const leadId = await ctx.db.insert("leads", {
          userId: user._id,
          icpId: leadData.icpId,
          nomeEmpresa: leadData.nomeEmpresa.trim(),
          nomeContato: leadData.nomeContato?.trim(),
          email: leadData.email?.trim(),
          telefone: leadData.telefone?.trim(),
          website: leadData.website?.trim(),
          fonte: leadData.fonte.trim(),
          status: leadData.status?.trim() || "novo",
        });

        createdIds.push(leadId);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        errors.push({ index: i, error: errorMessage });
      }
    }

    return {
      createdIds,
      errors,
      totalCreated: createdIds.length,
      totalErrors: errors.length,
    };
  },
});
