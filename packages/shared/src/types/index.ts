export interface User {
  id: string;
  email: string;
  name: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICP {
  id: string;
  userId: string;
  name: string;
  description?: string;
  industry?: string;
  companySize?: string;
  location?: string;
  painPoints?: string[];
  goals?: string[];
  keywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  userId: string;
  icpId?: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  title?: string;
  linkedinUrl?: string;
  website?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  fonte: 'manual' | 'api' | 'import' | 'search';
  status: 'novo' | 'qualificado' | 'descartado' | 'em_contato' | 'convertido';
  score?: number;
  painPoints?: string[];
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PreCallReport {
  id: string;
  leadId: string;
  executiveSummary: string;
  companyAnalysis: string;
  industryTrends: string;
  painPoints: string[];
  opportunities: string[];
  talkingPoints: string[];
  objections: string[];
  competitorAnalysis?: string;
  financialHealth?: string;
  recentNews?: string[];
  generatedAt: Date;
  expiresAt: Date;
}

export interface Email {
  id: string;
  leadId: string;
  subject: string;
  body: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bounceReason?: string;
  errorMessage?: string;
  templateId?: string;
  personalizationData?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchJob {
  id: string;
  userId: string;
  icpId: string;
  name: string;
  query: string;
  filters?: Record<string, unknown>;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalResults: number;
  processedResults: number;
  leadsFound: number;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
