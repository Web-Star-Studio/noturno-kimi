import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    betterAuthId: v.string(),
    companyName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_better_auth_id", ["betterAuthId"])
    .index("by_email", ["email"]),

  icps: defineTable({
    userId: v.id("users"),
    name: v.string(),
    nicho: v.string(),
    regiao: v.string(),
    palavrasChave: v.array(v.string()),
    keywords: v.optional(v.array(v.string())),
    isDefault: v.boolean(),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    companySize: v.optional(v.string()),
    location: v.optional(v.string()),
    painPoints: v.optional(v.array(v.string())),
    goals: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_default", ["userId", "isDefault"]),

  leads: defineTable({
    userId: v.id("users"),
    icpId: v.optional(v.id("icps")),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    company: v.string(),
    title: v.optional(v.string()),
    linkedinUrl: v.optional(v.string()),
    website: v.optional(v.string()),
    location: v.optional(v.string()),
    industry: v.optional(v.string()),
    companySize: v.optional(v.string()),
    fonte: v.string(),
    status: v.string(),
    score: v.optional(v.number()),
    painPoints: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_icp", ["icpId"])
    .index("by_user_icp", ["userId", "icpId"])
    .index("by_status", ["status"]),

  preCallReports: defineTable({
    leadId: v.id("leads"),
    executiveSummary: v.string(),
    companyAnalysis: v.string(),
    industryTrends: v.string(),
    painPoints: v.array(v.string()),
    opportunities: v.array(v.string()),
    talkingPoints: v.array(v.string()),
    objections: v.array(v.string()),
    competitorAnalysis: v.optional(v.string()),
    financialHealth: v.optional(v.string()),
    recentNews: v.optional(v.array(v.string())),
    generatedAt: v.number(),
    expiresAt: v.number(),
  }).index("by_lead", ["leadId"]),

  emails: defineTable({
    leadId: v.id("leads"),
    subject: v.string(),
    body: v.string(),
    status: v.string(),
    sentAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    clickedAt: v.optional(v.number()),
    bounceReason: v.optional(v.string()),
    errorMessage: v.optional(v.string()),
    templateId: v.optional(v.string()),
    personalizationData: v.optional(v.record(v.unknown())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_status", ["status"]),

  searchJobs: defineTable({
    userId: v.id("users"),
    icpId: v.id("icps"),
    name: v.string(),
    query: v.string(),
    filters: v.optional(v.record(v.unknown())),
    status: v.string(),
    totalResults: v.number(),
    processedResults: v.optional(v.number()),
    leadsFound: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_icp", ["icpId"]),
});
