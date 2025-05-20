import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { config } from '../config';
import { logger } from '../utils/logger';
import { redisClient } from '../config/redis';
import { EmailTemplate } from '../types/email.types';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: config.mailgun.apiKey,
});

const EMAIL_QUEUE = 'email_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

export class EmailService {
  private static instance: EmailService;
  private isProcessingQueue = false;

  private constructor() {
    this.startQueueProcessor();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private async startQueueProcessor() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    while (true) {
      try {
        const emailData = await redisClient.brPop(EMAIL_QUEUE, 0);
        if (emailData) {
          const { to, subject, template, data } = JSON.parse(emailData[1]);
          await this.sendEmail(to, subject, template, data);
        }
      } catch (error) {
        logger.error('Error processing email queue:', error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  private async queueEmail(to: string, subject: string, template: EmailTemplate, data: any) {
    const emailData = JSON.stringify({ to, subject, template, data });
    await redisClient.lPush(EMAIL_QUEUE, emailData);
  }

  private async sendEmail(to: string, subject: string, template: EmailTemplate, data: any, retryCount = 0): Promise<void> {
    try {
      const html = await this.renderTemplate(template, data);
      
      const messageData = {
        from: `走线吧 <${config.mailgun.fromEmail}>`,
        to,
        subject,
        html,
        'h:Reply-To': config.mailgun.supportEmail,
      };

      await mg.messages.create(config.mailgun.domain, messageData);
      logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      
      if (retryCount < MAX_RETRIES) {
        logger.info(`Retrying email to ${to} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        await this.sendEmail(to, subject, template, data, retryCount + 1);
      } else {
        logger.error(`Failed to send email to ${to} after ${MAX_RETRIES} attempts`);
        throw error;
      }
    }
  }

  private async renderTemplate(template: EmailTemplate, data: any): Promise<string> {
    const templatePath = `src/templates/emails/${template}.hbs`;
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    return handlebars.compile(templateContent)(data);
  }

  public async sendVerificationCode(email: string, code: string): Promise<void> {
    const subject = '验证您的走线吧账号';
    const data = {
      code,
      expiryTime: '10分钟',
      frontendUrl: config.frontendUrl,
    };
    await this.queueEmail(email, subject, 'verification', data);
  }

  public async sendWelcomeEmail(email: string, username: string): Promise<void> {
    const subject = '欢迎加入走线吧！';
    const data = {
      username,
      frontendUrl: config.frontendUrl,
    };
    await this.queueEmail(email, subject, 'welcome', data);
  }

  public async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const subject = '重置您的走线吧密码';
    const data = {
      resetUrl: `${config.frontendUrl}/reset-password?token=${resetToken}`,
      expiryTime: '1小时',
    };
    await this.queueEmail(email, subject, 'password-reset', data);
  }

  public async sendSecurityAlert(email: string, alertType: string, details: any): Promise<void> {
    const subject = '账号安全警告';
    const data = {
      alertType,
      details: JSON.stringify(details, null, 2),
      securityUrl: `${config.frontendUrl}/security`,
      timestamp: new Date().toLocaleString(),
    };
    await this.queueEmail(email, subject, 'security-alert', data);
  }

  public async sendNotification(email: string, title: string, content: string, actionUrl?: string, actionText?: string): Promise<void> {
    const subject = title;
    const data = {
      title,
      content,
      actionUrl,
      actionText,
      timestamp: new Date().toLocaleString(),
    };
    await this.queueEmail(email, subject, 'notification', data);
  }
} 