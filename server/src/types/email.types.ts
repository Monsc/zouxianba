export type EmailTemplate = 
  | 'verification'
  | 'welcome'
  | 'password-reset'
  | 'security-alert'
  | 'notification';

export interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

export interface EmailQueueItem {
  id: string;
  data: EmailData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
} 