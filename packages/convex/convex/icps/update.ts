import { mutation } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Update ICP (verify ownership)
 */
export const updateICP = mutation({
  args: {
    icpId: v.id("icps"),
    name: v.optional(v.string()),
    nicho: v.optional(v.string()),
    regiao: v.optional(v.string()),
    palavrasChave: v.optional(v.array(v.string())),
  },
  returns: v.object({
    _id: v.id("icps"),
    _creationTime: v.number(),
    userId: v.id("users"),
    name: v.string(),
    nicho: v.string(),
    regiao: v.string(),
    palavrasChave: v.array(v.string()),
    isDefault: v.boolean(),
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

    const icp = await ctx.db.get(args.icpId);

    if (!icp) {
      throw new Error("ICP não encontrado");
    }

    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para editar este ICP");
    }

    const updateData: {
      name?: string;
      nicho?: string;
      regiao?: string;
      palavrasChave?: string[];
    } = {};

    if (args.name !== undefined) {
      const trimmedName = args.name.trim();
      if (trimmedName.length === 0) {
        throw new Error("Nome do ICP não pode estar vazio");
      }
      updateData.name = trimmedName;
    }

    if (args.nicho !== undefined) {
      const trimmedNicho = args.nicho.trim();
      if (trimmedNicho.length === 0) {
        throw new Error("Nicho não pode estar vazio");
      }
      updateData.nicho = trimmedNicho;
    }

    if (args.regiao !== undefined) {
      const trimmedRegiao = args.regiao.trim();
      if (trimmedRegiao.length === 0) {
        throw new Error("Região não pode estar vazia");
      }
      updateData.regiao = trimmedRegiao;
    }

    if (args.palavrasChave !== undefined) {
      const filteredKeywords = args.palavrasChave.map(p => p.trim()).filter(p => p.length > 0);
      if (filteredKeywords.length === 0) {
        throw new Error("Pelo menos uma palavra-chave é obrigatória");
      }
      updateData.palavrasChave = filteredKeywords;
    }

    await ctx.db.patch(args.icpId, updateData);

    const updatedIcp = await ctx.db.get(args.icpId);
    
    if (!updatedIcp) {
      throw new Error("Erro ao atualizar ICP");
    }

    return updatedIcp;
  },
});

/**
 * Set ICP as default
 */
export const setDefaultICP = mutation({
  args: {
    icpId: v.id("icps"),
  },
  returns: v.object({
    _id: v.id("icps"),
    _creationTime: v.number(),
    userId: v.id("users"),
    name: v.string(),
    nicho: v.string(),
    regiao: v.string(),
    palavrasChave: v.array(v.string()),
    isDefault: v.boolean(),
  }),
  handler: async (ctx, { icpId }) => {
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

    const icp = await ctx.db.get(icpId);

    if (!icp) {
      throw new Error("ICP não encontrado");
    }

    if (icp.userId !== user._id) {
      throw new Error("Você não tem permissão para modificar este ICP");
    }

    // Unset other defaults
    const userIcps = await ctx.db
      .query("icps")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const otherIcp of userIcps) {
      if (otherIcp.isDefault && otherIcp._id !== icpId) {
        await ctx.db.patch(otherIcp._id, { isDefault: false });
      }
    }

    // Set this one as default
    await ctx.db.patch(icpId, { isDefault: true });

    const updatedIcp = await ctx.db.get(icpId);
    
    if (!updatedIcp) {
      throw new Error("Erro ao definir ICP como padrão");
    }

    return updatedIcp;
  },
});
