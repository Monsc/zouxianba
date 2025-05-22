const nodemailer = require('nodemailer');
const config = require('../config');
const { AppError } = require('../utils/AppError');

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password
  }
});

/**
 * 发送验证码邮件
 * @param {string} to - 收件人邮箱
 * @param {string} code - 验证码
 */
const sendVerificationCode = async (to, code) => {
  try {
    const mailOptions = {
      from: config.email.from,
      to,
      subject: '走线吧 - 验证码',
      html: `
        <h1>您的验证码</h1>
        <p>您的验证码是：<strong>${code}</strong></p>
        <p>验证码有效期为5分钟，请尽快使用。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError('邮件发送失败', 500);
  }
};

/**
 * 发送密码重置邮件
 * @param {string} to - 收件人邮箱
 * @param {string} resetToken - 重置令牌
 */
const sendPasswordResetEmail = async (to, resetToken) => {
  try {
    const resetUrl = `${config.clientUrl}/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: config.email.from,
      to,
      subject: '走线吧 - 密码重置',
      html: `
        <h1>密码重置</h1>
        <p>您收到此邮件是因为您（或其他人）请求重置密码。</p>
        <p>请点击下面的链接重置密码：</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError('邮件发送失败', 500);
  }
};

module.exports = {
  sendVerificationCode,
  sendPasswordResetEmail
}; 