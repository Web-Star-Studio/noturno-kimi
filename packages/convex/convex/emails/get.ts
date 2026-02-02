import { query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Email object validator
 */
const emailValidator = v.object({
  _id: v.id("emails"),
  _creationTime: v.number(),
  leadId: v.id("leads"),
  assunto: v.string(),
  corpo: v.string(),
  status: v.string(),
  enviadoEm: v.optional(v.number()),
});

/**
 * Get email by ID (verify ownership)
 */
export const getEmail = query({
  args: {
    emailId: v.id("emails"),
  },
  returns: v.union(emailValidator, v.null()),
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
      return null;
    }

    // Verify ownership through lead
    const lead = await ctx.db.get(email.leadId);
    if (!lead || lead.userId !== user._id) {
      throw new Error("Você não tem permissão para acessar este email");
    }

    return email;
  },
});

/**
 * Get email by lead ID
 */
export const getEmailByLead = query({
  args: {
    leadId: v.id("leads"),
  },
  returns: v.union(emailValidator, v.null()),
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
      throw new Error("Você não tem permissão para acessar emails deste lead");
    }

    const email = await ctx.db
      .query("emails")
      .withIndex("by_lead", (q) => q.eq("leadId", leadId))
      .unique();

    return email;
  },
});

/**
 * List emails for user with pagination
 */
export const listEmails = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    emails: v.array(emailValidator),
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

    // Get all leads for user first
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const leadIds = leads.map(l => l._id);

    // Query all emails and filter by user's leads
    let query = ctx.db.query("emails");

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    const allEmails = await query.collect();
    const userEmails = allEmails.filter(e => leadIds.includes(e.leadId));
    
    // Manual pagination
    const startIndex = cursor ? 0 : 0;
    const emails = userEmails.slice(startIndex, startIndex + limit + 1);
    
    const hasMore = emails.length > limit;
    const emailsToReturn = hasMore ? emails.slice(0, limit) : emails;
    
    const nextCursor = hasMore && emailsToReturn.length > 0 
      ? emailsToReturn[emailsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      emails: emailsToReturn,
      nextCursor,
      hasMore,
    };
  },
});

/**
 * List emails by status
 */
export const listEmailsByStatus = query({
  args: {
    status: v.string(),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    emails: v.array(emailValidator),
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

    // Get all leads for user
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const leadIds = leads.map(l => l._id);

    // Query by status and filter
    let query = ctx.db
      .query("emails")
      .withIndex("by_status", (q) => q.eq("status", args.status));

    if (cursor) {
      query = query.filter((q) => q.gt("_creationTime", parseInt(cursor)));
    }

    const allEmails = await query.collect();
    const userEmails = allEmails.filter(e => leadIds.includes(e.leadId));
    
    // Manual pagination
    const emails = userEmails.slice(0, limit + 1);
    
    const hasMore = emails.length > limit;
    const emailsToReturn = hasMore ? emails.slice(0, limit) : emails;
    
    const nextCursor = hasMore && emailsToReturn.length > 0 
      ? emailsToReturn[emailsToReturn.length - 1]._creationTime.toString() 
      : undefined;

    return {
      emails: emailsToReturn,
      nextCursor,
      hasMore,
    };
  },
});
