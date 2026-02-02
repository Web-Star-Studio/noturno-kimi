import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Update search job status and progress
 */
export const updateSearchJobStatus = mutation({
  args: {
    jobId: v.id("searchJobs"),
    status: v.optional(v.string()),
    progresso: v.optional(v.number()),
  },
  returns: v.object({
    _id: v.id("searchJobs"),
    _creationTime: v.number(),
    userId: v.id("users"),
    icpId: v.id("icps"),
    status: v.string(),
    totalLeads: v.optional(v.number()),
    progresso: v.number(),
    erro: v.optional(v.string()),
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

    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job não encontrado");
    }

    if (job.userId !== user._id) {
      throw new Error("Você não tem permissão para atualizar este job");
    }

    const updateData: {
      status?: string;
      progresso?: number;
    } = {};

    if (args.status !== undefined) {
      const trimmed = args.status.trim();
      if (trimmed.length === 0) {
        throw new Error("Status não pode estar vazio");
      }
      updateData.status = trimmed;
    }

    if (args.progresso !== undefined) {
      if (args.progresso < 0 || args.progresso > 100) {
        throw new Error("Progresso deve estar entre 0 e 100");
      }
      updateData.progresso = args.progresso;
    }

    await ctx.db.patch(args.jobId, updateData);

    const updatedJob = await ctx.db.get(args.jobId);
    
    if (!updatedJob) {
      throw new Error("Erro ao atualizar job");
    }

    return updatedJob;
  },
});

/**
 * Mark search job as completed with total leads
 */
export const completeSearchJob = mutation({
  args: {
    jobId: v.id("searchJobs"),
    totalLeads: v.number(),
  },
  returns: v.object({
    _id: v.id("searchJobs"),
    _creationTime: v.number(),
    userId: v.id("users"),
    icpId: v.id("icps"),
    status: v.string(),
    totalLeads: v.optional(v.number()),
    progresso: v.number(),
    erro: v.optional(v.string()),
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

    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job não encontrado");
    }

    if (job.userId !== user._id) {
      throw new Error("Você não tem permissão para completar este job");
    }

    if (args.totalLeads < 0) {
      throw new Error("Total de leads não pode ser negativo");
    }

    await ctx.db.patch(args.jobId, {
      status: "completed",
      progresso: 100,
      totalLeads: args.totalLeads,
    });

    const updatedJob = await ctx.db.get(args.jobId);
    
    if (!updatedJob) {
      throw new Error("Erro ao completar job");
    }

    return updatedJob;
  },
});

/**
 * Mark search job as failed with error
 */
export const failSearchJob = mutation({
  args: {
    jobId: v.id("searchJobs"),
    erro: v.string(),
  },
  returns: v.object({
    _id: v.id("searchJobs"),
    _creationTime: v.number(),
    userId: v.id("users"),
    icpId: v.id("icps"),
    status: v.string(),
    totalLeads: v.optional(v.number()),
    progresso: v.number(),
    erro: v.optional(v.string()),
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

    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job não encontrado");
    }

    if (job.userId !== user._id) {
      throw new Error("Você não tem permissão para marcar este job como falho");
    }

    const trimmedError = args.erro.trim();
    if (trimmedError.length === 0) {
      throw new Error("Mensagem de erro não pode estar vazia");
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      erro: trimmedError,
    });

    const updatedJob = await ctx.db.get(args.jobId);
    
    if (!updatedJob) {
      throw new Error("Erro ao marcar job como falho");
    }

    return updatedJob;
  },
});
