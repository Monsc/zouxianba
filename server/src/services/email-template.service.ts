import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { logger } from '../utils/logger';
import { EmailTemplate } from '../types/email.types';

interface TemplateInfo {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  updatedAt: string;
}

export class EmailTemplateService {
  private static instance: EmailTemplateService;
  private templatesDir: string;
  private templateCache: Map<string, TemplateInfo>;

  private constructor() {
    this.templatesDir = path.join(process.cwd(), 'src/templates/emails');
    this.templateCache = new Map();
    this.loadTemplates();
  }

  public static getInstance(): EmailTemplateService {
    if (!EmailTemplateService.instance) {
      EmailTemplateService.instance = new EmailTemplateService();
    }
    return EmailTemplateService.instance;
  }

  private async loadTemplates() {
    try {
      const files = await fs.readdir(this.templatesDir);
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateId = path.basename(file, '.hbs');
          const content = await fs.readFile(path.join(this.templatesDir, file), 'utf-8');
          const stats = await fs.stat(path.join(this.templatesDir, file));
          
          // 提取变量
          const variables = this.extractVariables(content);
          
          // 提取主题
          const subject = this.extractSubject(content);
          
          this.templateCache.set(templateId, {
            id: templateId,
            name: this.getTemplateName(templateId),
            subject,
            content,
            variables,
            updatedAt: stats.mtime.toISOString(),
          });
        }
      }
    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  private extractVariables(content: string): string[] {
    const variables = new Set<string>();
    const regex = /{{([^}]+)}}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const variable = match[1].trim();
      if (!variable.startsWith('#') && !variable.startsWith('/')) {
        variables.add(variable);
      }
    }
    
    return Array.from(variables);
  }

  private extractSubject(content: string): string {
    const subjectMatch = content.match(/<title>(.*?)<\/title>/);
    return subjectMatch ? subjectMatch[1] : '';
  }

  private getTemplateName(templateId: string): string {
    const names: Record<string, string> = {
      'verification': '验证码邮件',
      'welcome': '欢迎邮件',
      'password-reset': '密码重置邮件',
      'security-alert': '安全警告邮件',
      'notification': '系统通知邮件',
    };
    return names[templateId] || templateId;
  }

  public async getAllTemplates(): Promise<TemplateInfo[]> {
    return Array.from(this.templateCache.values());
  }

  public async getTemplate(id: string): Promise<TemplateInfo | null> {
    return this.templateCache.get(id) || null;
  }

  public async updateTemplate(id: string, updates: { subject: string; content: string }): Promise<TemplateInfo | null> {
    const template = this.templateCache.get(id);
    if (!template) return null;

    const filePath = path.join(this.templatesDir, `${id}.hbs`);
    const updatedContent = updates.content.replace(
      /<title>.*?<\/title>/,
      `<title>${updates.subject}</title>`
    );

    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    const updatedTemplate = {
      ...template,
      subject: updates.subject,
      content: updatedContent,
      updatedAt: new Date().toISOString(),
    };
    
    this.templateCache.set(id, updatedTemplate);
    return updatedTemplate;
  }

  public async previewTemplate(id: string, data: Record<string, any>): Promise<string> {
    const template = this.templateCache.get(id);
    if (!template) {
      throw new Error('Template not found');
    }

    const compiledTemplate = handlebars.compile(template.content);
    return compiledTemplate(data);
  }
} 