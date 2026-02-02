import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Lead object validator
 */
const leadValidator = v.object({
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
});

/**
 * Get lead by ID (verify ownership)
 */
export const getLead = query({
  args: {
    leadId: v.id("leads"),
  },
  returns: v.union(leadValidator, v.null()),
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

    const lead = await ctx.db.get(leadId);

    if (!lead) {
      return null;
    }

    if (lead.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar este lead");
    }

    return lead;
  },
});

/**
 * List all leads for user with pagination
 */
export const listLeads = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    leads: v.array(leadValidator),
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
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    const leads = await query.take(limit + 1);
    
    const hasMore = leads.length > limit;
    const leadsToReturn = hasMore ? leads.slice(0, limit) : leads;
    
    const nextCursor = hasMore && leadsToReturn.length > 0 
      ? leadsToReturn[leadsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      leads: leadsToReturn,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * List leads by ICP
 */
export const listLeadsByICP = query({
  args: {
    icpId: v.id("icps"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    leads: v.array(leadValidator),
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

    // Verify ICP ownership
    const icp = await ctx.db.get(args.icpId);
    if (!icp) {
      throw new Error("ICP não encontrado");
    }
    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar leads deste ICP");
    }

    const limit = args.limit ?? 20;
    const cursor = args.cursor;

    let query = ctx.db
      .query("leads")
      .withIndex("by_user_icp", (q) => q.eq("userId", user._id).eq("icpId", args.icpId));

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    const leads = await query.take(limit + 1);
    
    const hasMore = leads.length > limit;
    const leadsToReturn = hasMore ? leads.slice(0, limit) : leads;
    
    const nextCursor = hasMore && leadsToReturn.length > 0 
      ? leadsToReturn[leadsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      leads: leadsToReturn,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * List leads by status
 */
export const listLeadsByStatus = query({
  args: {
    status: v.string(),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    leads: v.array(leadValidator),
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

    // Query by status and filter by user (since index is by status, we filter by user)
    let query = ctx.db
      .query("leads")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .filter((q) => q.eq("userId", user._id));

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    const leads = await query.take(limit + 1);
    
    const hasMore = leads.length > limit;
    const leadsToReturn = hasMore ? leads.slice(0, limit) : leads;
    
    const nextCursor = hasMore && leadsToReturn.length > 0 
      ? leadsToReturn[leadsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      leads: leadsToReturn,
      nextCursor,
      hasMore,
    };
  },
});
