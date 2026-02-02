export const LeadStatus = ['novo', 'qualificado', 'descartado', 'em_contato', 'convertido'] as const;
export type LeadStatusType = typeof LeadStatus[number];

export const EmailStatus = ['draft', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'] as const;
export type EmailStatusType = typeof EmailStatus[number];

export const SearchJobStatus = ['pending', 'running', 'paused', 'completed', 'failed', 'cancelled'] as const;
export type SearchJobStatusType = typeof SearchJobStatus[number];

export const LeadFonte = ['manual', 'api', 'import', 'search'] as const;
export type LeadFonteType = typeof LeadFonte[number];

export const ErrorMessages = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_URL: 'URL inválida',
  INVALID_UUID: 'ID inválido',
  INVALID_DATE: 'Data inválida',
  INVALID_NUMBER: 'Número inválido',
  TOO_SHORT: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  TOO_LONG: (max: number) => `Deve ter no máximo ${max} caracteres`,
  NOT_FOUND: (entity: string) => `${entity} não encontrado(a)`,
  ALREADY_EXISTS: (entity: string) => `${entity} já existe`,
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  INTERNAL_ERROR: 'Erro interno do servidor',
  VALIDATION_ERROR: 'Erro de validação',
  INVALID_CREDENTIALS: 'Credenciais inválidas',
  TOKEN_EXPIRED: 'Token expirado',
  TOKEN_INVALID: 'Token inválido',
  RATE_LIMIT_EXCEEDED: 'Limite de requisições excedido',
  SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível',
  DUPLICATE_ENTRY: 'Registro duplicado',
  INVALID_OPERATION: 'Operação inválida',
  INSUFFICIENT_PERMISSIONS: 'Permissões insuficientes',
} as const;
