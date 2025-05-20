const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const { compile } = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    // 配置 Mailgun 传输器
    const mailgunConfig = {
      auth: {
        api_key: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN
      }
    };

    this.transporter = nodemailer.createTransport(mailgunTransport(mailgunConfig));
  }

  // 加载邮件模板
  async loadTemplate(templateName) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return compile(template);
  }

  // 发送邮件
  async sendMail({ to, subject, template, context }) {
    try {
      const compiledTemplate = await this.loadTemplate(template);
      const html = compiledTemplate(context);

      const mailOptions = {
        from: `"走线吧" <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to,
        subject,
        html,
        // Mailgun 特定配置
        'h:Reply-To': process.env.SUPPORT_EMAIL,
        'v:email_type': template,
        'v:user_id': context.userId || '',
        'v:timestamp': new Date().toISOString()
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  // 发送验证码
  async sendVerificationCode(email, code) {
    return this.sendMail({
      to: email,
      subject: '验证您的走线吧账号',
      template: 'verification',
      context: {
        code,
        expiryTime: '10分钟',
        userId: email // 用于跟踪
      },
    });
  }

  // 发送欢迎邮件
  async sendWelcomeEmail(email, username) {
    return this.sendMail({
      to: email,
      subject: '欢迎加入走线吧',
      template: 'welcome',
      context: {
        username,
        userId: email
      },
    });
  }

  // 发送密码重置邮件
  async sendPasswordReset(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    return this.sendMail({
      to: email,
      subject: '重置您的走线吧密码',
      template: 'password-reset',
      context: {
        resetUrl,
        expiryTime: '1小时',
        userId: email
      },
    });
  }

  // 发送系统通知
  async sendSystemNotification(email, title, content) {
    return this.sendMail({
      to: email,
      subject: title,
      template: 'notification',
      context: {
        title,
        content,
        userId: email
      },
    });
  }

  // 发送安全警告
  async sendSecurityAlert(email, alertType, details) {
    return this.sendMail({
      to: email,
      subject: '安全警告',
      template: 'security-alert',
      context: {
        alertType,
        details,
        timestamp: new Date().toLocaleString(),
        userId: email
      },
    });
  }

  // 批量发送邮件
  async sendBulkEmails(emails, subject, template, context) {
    const promises = emails.map(email => 
      this.sendMail({
        to: email,
        subject,
        template,
        context: {
          ...context,
          userId: email
        }
      })
    );

    return Promise.all(promises);
  }
}

module.exports = new EmailService(); 