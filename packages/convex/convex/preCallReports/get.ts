import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * PreCallReport object validator
 */
const preCallReportValidator = v.object({
  _id: v.id("preCallReports"),
  _creationTime: v.number(),
  leadId: v.id("leads"),
  conteudo: v.string(),
  resumo: v.string(),
});

/**
 * Get report by lead ID
 */
export const getPreCallReport = query({
  args: {
    leadId: v.id("leads"),
  },
  returns: v.union(preCallReportValidator, v.null()),
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

    // Verify lead ownership
    const lead = await ctx.db.get(leadId);
    if (!lead) {
      throw new Error("Lead não encontrado");
    }
    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar este relatório");
    }

    const report = await ctx.db
      .query("preCallReports")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .unique();

    return report || null;
  },
});

/**
 * Get by report ID
 */
export const getPreCallReportById = query({
  args: {
    reportId: v.id("preCallReports"),
  },
  returns: v.union(preCallReportValidator, v.null()),
  handler: async (ctx, { reportId }) => {
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

    const report = await ctx.db.get(reportId);

    if (!report) {
      return null;
    }

    // Verify lead ownership through the report's lead
    const lead = await ctx.db.get(report.leadId);
    if (!lead) {
      throw new Error("Lead associado não encontrado");
    }
    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar este relatório");
    }

    return report;
  },
});
