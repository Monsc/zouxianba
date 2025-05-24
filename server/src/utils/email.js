const nodemailer = require('nodemailer');
const config = require('../config');

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

// 发送邮件
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${config.email.fromName}" <${config.email.from}>`,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('邮件发送失败');
  }
};

// 发送验证码邮件
const sendVerificationCode = async (email, code) => {
  return sendEmail({
    to: email,
    subject: '验证码',
    text: `您的验证码是：${code}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>验证码</h2>
        <p>您的验证码是：</p>
        <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px;">
          ${code}
        </div>
        <p>验证码有效期为 5 分钟。</p>
      </div>
    `
  });
};

// 发送密码重置邮件
const sendPasswordReset = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: '密码重置',
    text: `请点击以下链接重置密码：${resetUrl}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>密码重置</h2>
        <p>请点击以下链接重置密码：</p>
        <p><a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">重置密码</a></p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationCode,
  sendPasswordReset
}; 