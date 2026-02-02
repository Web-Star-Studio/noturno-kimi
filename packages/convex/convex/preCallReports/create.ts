import { mutation, action } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create report for lead
 */
export const createPreCallReport = mutation({
  args: {
    leadId: v.id("leads"),
    conteudo: v.string(),
    resumo: v.string(),
  },
  returns: v.id("preCallReports"),
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
      throw new Error("Você não tem permissão para criar relatório para este lead");
    }

    // Check if report already exists for this lead
    const existingReport = await ctx.db
      .query("preCallReports")
      .withIndex("by_lead", (q) => q.eq("leadId", args.leadId))
      .unique();

    if (existingReport) {
      throw new Error("Já existe um relatório para este lead");
    }

    // Validation
    if (args.conteudo.trim().length === 0) {
      throw new Error("Conteúdo do relatório é obrigatório");
    }

    if (args.resumo.trim().length === 0) {
      throw new Error("Resumo do relatório é obrigatório");
    }

    const reportId = await ctx.db.insert("preCallReports", {
      leadId: args.leadId,
      conteudo: args.conteudo.trim(),
      resumo: args.resumo.trim(),
    });

    return reportId;
  },
});

/**
 * Action to generate via OpenAI (placeholder)
 * This runs in a separate execution context and can make external API calls
 */
export const generatePreCallReport = action({
  args: {
    leadId: v.id("leads"),
  },
  returns: v.union(
    v.object({
      success: v.literal(true),
      reportId: v.id("preCallReports"),
    }),
    v.object({
      success: v.literal(false),
      error: v.string(),
    })
  ),
  handler: async (ctx, { leadId }) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      
      if (!identity) {
        return { success: false, error: "Não autenticado" };
      }

      // Get user
      const user = await ctx.runQuery(async (queryCtx) => {
        return await queryCtx.db
          .query("users")
          .withIndex("by_better_auth_id", (q) => q.eq("betterAuthId", identity.subject))
          .unique();
      });

      if (!user) {
        return { success: false, error: "Usuário não encontrado" };
      }

      // Get lead
      const lead = await ctx.runQuery(async (queryCtx) => {
        return await queryCtx.db.get(leadId);
      });

      if (!lead) {
        return { success: false, error: "Lead não encontrado" };
      }

      if (lead.userId !== user._id) {
        return { success: false, error: "Você não tem permissão para gerar relatório para este lead" };
      }

      // Check if report already exists
      const existingReport = await ctx.runQuery(async (queryCtx) => {
        return await queryCtx.db
          .query("preCallReports")
          .withIndex("by_lead", (q) => q.eq("leadId", leadId))
          .unique();
      });

      if (existingReport) {
        return { success: false, error: "Já existe um relatório para este lead" };
      }

      // TODO: Implement OpenAI integration
      // This is a placeholder for the actual OpenAI API call
      // const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {...});
      
      // For now, create a placeholder report
      const placeholderConteudo = `Relatório de Pré-ligação para ${lead.nomeEmpresa}\n\n` +
        `Contato: ${lead.nomeContato || "Não informado"}\n` +
        `Email: ${lead.email || "Não informado"}\n` +
        `Telefone: ${lead.telefone || "Não informado"}\n` +
        `Website: ${lead.website || "Não informado"}\n\n` +
        `[Este é um relatório placeholder. Integração com OpenAI a ser implementada]`;

      const placeholderResumo = `Resumo da empresa ${lead.nomeEmpresa}. ` +
        `Contato principal: ${lead.nomeContato || "Não informado"}. ` +
        `[Resumo gerado via placeholder - integração OpenAI pendente]`;

      const reportId = await ctx.runMutation(async (mutationCtx) => {
        return await mutationCtx.db.insert("preCallReports", {
          leadId,
          conteudo: placeholderConteudo,
          resumo: placeholderResumo,
        });
      });

      return { success: true, reportId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao gerar relatório";
      return { success: false, error: errorMessage };
    }
  },
});
