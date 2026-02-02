import { z } from 'zod';
import { EmailStatus } from '../constants';

export const createEmailSchema = z.object({
  leadId: z.string().uuid('ID do lead inválido'),
  subject: z.string().min(1, 'O assunto é obrigatório').max(255, 'O assunto deve ter no máximo 255 caracteres'),
  body: z.string().min(1, 'O corpo do email é obrigatório').max(50000, 'O corpo do email deve ter no máximo 50000 caracteres'),
  templateId: z.string().uuid('ID do template inválido').optional(),
  personalizationData: z.record(z.unknown()).optional(),
});

export const updateEmailStatusSchema = z.object({
  status: z.enum(EmailStatus, {
    errorMap: () => ({ message: 'Status inválido' }),
  }),
  sentAt: z.coerce.date().optional(),
  openedAt: z.coerce.date().optional(),
  clickedAt: z.coerce.date().optional(),
  bounceReason: z.string().max(500).optional(),
  errorMessage: z.string().max(2000).optional(),
});

export const sendEmailSchema = z.object({
  leadIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos um lead'),
  templateId: z.string().uuid('ID do template inválido'),
  personalizationData: z.record(z.unknown()).optional(),
  scheduledAt: z.coerce.date().optional(),
});

export type CreateEmailInput = z.infer<typeof createEmailSchema>;
export type UpdateEmailStatusInput = z.infer<typeof updateEmailStatusSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
