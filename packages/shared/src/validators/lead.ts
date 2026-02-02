import { z } from 'zod';
import { LeadStatus, LeadFonte } from '../constants';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'O nome do lead é obrigatório').max(100, 'O nome deve ter no máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'O email deve ter no máximo 255 caracteres'),
  phone: z.string().max(50, 'O telefone deve ter no máximo 50 caracteres').optional(),
  company: z.string().min(1, 'A empresa é obrigatória').max(200, 'O nome da empresa deve ter no máximo 200 caracteres'),
  title: z.string().max(200, 'O cargo deve ter no máximo 200 caracteres').optional(),
  linkedinUrl: z.string().url('URL do LinkedIn inválida').max(500, 'A URL deve ter no máximo 500 caracteres').optional(),
  website: z.string().url('Website inválido').max(500, 'A URL deve ter no máximo 500 caracteres').optional(),
  location: z.string().max(200, 'A localização deve ter no máximo 200 caracteres').optional(),
  industry: z.string().max(100, 'A indústria deve ter no máximo 100 caracteres').optional(),
  companySize: z.string().max(50, 'O tamanho da empresa deve ter no máximo 50 caracteres').optional(),
  fonte: z.enum(LeadFonte, {
    errorMap: () => ({ message: 'Fonte inválida' }),
  }),
  status: z.enum(LeadStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }).optional().default('novo'),
  score: z.number().int().min(0).max(100).optional(),
  painPoints: z.array(z.string().max(200)).optional(),
  notes: z.string().max(5000, 'As notas devem ter no máximo 5000 caracteres').optional(),
  tags: z.array(z.string().max(50)).optional(),
  icpId: z.string().uuid('ID do ICP inválido').optional(),
});

export const updateLeadSchema = createLeadSchema.partial().omit({ fonte: true });

export const updateLeadStatusSchema = z.object({
  status: z.enum(LeadStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>;
