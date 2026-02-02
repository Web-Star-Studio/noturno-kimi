import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * SearchJob object validator
 */
const searchJobValidator = v.object({
  _id: v.id("searchJobs"),
  _creationTime: v.number(),
  userId: v.id("users"),
  icpId: v.id("icps"),
  status: v.string(),
  totalLeads: v.optional(v.number()),
  progresso: v.number(),
  erro: v.optional(v.string()),
});

/**
 * Get search job by ID
 */
export const getSearchJob = query({
  args: {
    jobId: v.id("searchJobs"),
  },
  returns: v.union(searchJobValidator, v.null()),
  handler: async (ctx, { jobId }) => {
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

    const job = await ctx.db.get(jobId);

    if (!job) {
      return null;
    }

    if (job.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar este job");
    }

    return job;
  },
});

/**
 * List search jobs for user
 */
export const listSearchJobs = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    jobs: v.array(searchJobValidator),
    nextCursor: v.optional(v.string()),
    hasMore: v.boolean(),
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

    const limit = args.limit ?? 20;
    const cursor = args.cursor;

    let query = ctx.db
      .query("searchJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    const jobs = await query.take(limit + 1);
    
    const hasMore = jobs.length > limit;
    const jobsToReturn = hasMore ? jobs.slice(0, limit) : jobs;
    
    const nextCursor = hasMore && jobsToReturn.length > 0 
      ? jobsToReturn[jobsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      jobs: jobsToReturn,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * List active/pending search jobs
 */
export const listActiveSearchJobs = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    jobs: v.array(searchJobValidator),
    nextCursor: v.optional(v.string()),
    hasMore: v.boolean(),
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

    const limit = args.limit ?? 20;
    const cursor = args.cursor;

    // Query active statuses (pending, running, etc.)
    const activeStatuses = ["pending", "running", "active"];
    
    let query = ctx.db
      .query("searchJobs")
      .withIndex("by_user_status", (q) => q.eq("userId", user._id).eq("status", "pending"));

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    // Get all jobs and filter by active status
    const allJobs = await ctx.db
      .query("searchJobs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const activeJobs = allJobs.filter(j => activeStatuses.includes(j.status));
    
    // Manual pagination
    const startIndex = cursor ? allJobs.findIndex(j => j._creationTime > parseInt(cursor)) : 0;
    const jobs = activeJobs.slice(0, limit + 1);
    
    const hasMore = jobs.length > limit;
    const jobsToReturn = hasMore ? jobs.slice(0, limit) : jobs;
    
    const nextCursor = hasMore && jobsToReturn.length > 0 
      ? jobsToReturn[jobsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      jobs: jobsToReturn,
      nextCursor,
      hasMore,
    };
  },
});
