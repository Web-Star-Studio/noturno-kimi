import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    betterAuthId: v.string(),
  })
    .index("by_better_auth_id", ["betterAuthId"])
    .index("by_email", ["email"]),

  icps: defineTable({
    userId: v.id("users"),
    name: v.string(),
    nicho: v.string(),
    regiao: v.string(),
    palavrasChave: v.array(v.string()),
    isDefault: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_default", ["userId", "isDefault"]),

  leads: defineTable({
    userId: v.id("users"),
    icpId: v.id("icps"),
    nomeEmpresa: v.string(),
    nomeContato: v.optional(v.string()),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    website: v.optional(v.string()),
    fonte: v.string(),
    status: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_icp", ["icpId"])
    .index("by_user_icp", ["userId", "icpId"])
    .index("by_status", ["status"]),

  preCallReports: defineTable({
    leadId: v.id("leads"),
    conteudo: v.string(),
    resumo: v.string(),
  }).index("by_lead", ["leadId"]),

  emails: defineTable({
    leadId: v.id("leads"),
    assunto: v.string(),
    corpo: v.string(),
    status: v.string(),
    enviadoEm: v.optional(v.number()),
  })
    .index("by_lead", ["leadId"])
    .index("by_status", ["status"]),

  searchJobs: defineTable({
    userId: v.id("users"),
    icpId: v.id("icps"),
    status: v.string(),
    totalLeads: v.optional(v.number()),
    progresso: v.number(),
    erro: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_icp", ["icpId"]),
});
