import { z } from 'zod';

export const createICPSchema = z.object({
  name: z.string().min(1, 'O nome do ICP é obrigatório').max(100, 'O nome deve ter no máximo 100 caracteres'),
  description: z.string().max(500, 'A descrição deve ter no máximo 500 caracteres').optional(),
  industry: z.string().max(100, 'A indústria deve ter no máximo 100 caracteres').optional(),
  companySize: z.string().max(50, 'O tamanho da empresa deve ter no máximo 50 caracteres').optional(),
  location: z.string().max(200, 'A localização deve ter no máximo 200 caracteres').optional(),
  painPoints: z.array(z.string().max(200)).optional(),
  goals: z.array(z.string().max(200)).optional(),
  keywords: z.array(z.string().max(50)).optional(),
});

export const updateICPSchema = createICPSchema.partial();

export type CreateICPInput = z.infer<typeof createICPSchema>;
export type UpdateICPInput = z.infer<typeof updateICPSchema>;
