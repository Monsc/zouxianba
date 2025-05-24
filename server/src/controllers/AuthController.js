const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hash, compare } = require('../utils/password');
const emailService = require('../services/emailService');
const { generateVerificationCode } = require('../utils/verification');
const { rateLimit } = require('../middleware/rateLimit');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const { uploadToCloudflare } = require('../utils/cloudflare');
const crypto = require('crypto');
const { sendEmail } = require('../utils/email');

class AuthController {
  // 发送验证码
  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      // 检查邮箱是否已注册
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: '该邮箱已被注册' });
      }

      // 生成验证码
      const code = generateVerificationCode();
      
      // 存储验证码（使用 Redis 或数据库）
      await storeVerificationCode(email, code);

      // 发送验证码邮件
      await emailService.sendVerificationCode(email, code);

      res.json({ message: '验证码已发送' });
    } catch (error) {
      console.error('Send verification code error:', error);
      res.status(500).json({ error: '发送验证码失败' });
    }
  }

  // 注册
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      console.log('注册请求数据:', { username, email, password });

      // 检查用户是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('该邮箱已被注册', 400);
      }

      // 创建新用户
      const user = new User({
        username,
        email,
        password,
        name: username,
        handle: username
      });

      await user.save();
      console.log('用户创建成功:', user);

      // 生成 JWT token
      const token = jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar
          },
          token
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      next(error);
    }
  }

  // 登录
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new AppError('该邮箱未注册', 401);
      }

      // 验证密码
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AppError('密码错误', 401);
      }

      // 生成 JWT token
      const token = jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            avatar: user.avatar
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // 忘记密码
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError('该邮箱未注册', 404);
      }

      // 生成重置令牌
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 3600000; // 1小时后过期
      
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();
      
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: '密码重置',
        text: `请点击以下链接重置密码：${resetUrl}\n\n如果您没有请求重置密码，请忽略此邮件。`,
        html: `
          <p>请点击以下链接重置密码：</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>如果您没有请求重置密码，请忽略此邮件。</p>
        `
      });

      res.json({
        status: 'success',
        message: '重置密码链接已发送到您的邮箱'
      });
    } catch (error) {
      next(error);
    }
  }

  // 重置密码
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      // 查找用户
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!user) {
        throw new AppError('重置令牌无效或已过期', 400);
      }

      // 更新密码
      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.json({
        status: 'success',
        message: '密码重置成功'
      });
    } catch (error) {
      next(error);
    }
  }

  // 修改密码
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // 查找用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 验证当前密码
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: '当前密码错误' });
      }

      // 更新密码
      const hashedPassword = await hash(newPassword);
      user.password = hashedPassword;
      await user.save();

      // 发送密码已修改通知
      await emailService.sendSystemNotification(
        user.email,
        '密码已修改',
        '您的密码已成功修改。如果这不是您本人操作，请立即联系客服。'
      );

      res.json({ message: '密码修改成功' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: '修改密码失败' });
    }
  }

  // 登出
  async logout(req, res) {
    res.json({
      status: 'success',
      message: '登出成功'
    });
  }

  // 登出所有设备
  async logoutAll(req, res) {
    try {
      // 清空用户的令牌列表
      req.user.tokens = [];
      await req.user.save();

      res.json({
        message: 'Logged out from all devices'
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    res.json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  }

  // 更新用户信息
  async updateUser(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password', 'avatar', 'bio'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({
        message: 'Invalid updates'
      });
    }

    try {
      updates.forEach(update => req.user[update] = req.body[update]);
      await req.user.save();

      res.json(req.user);
    } catch (error) {
      res.status(400).json({
        message: error.message
      });
    }
  }

  // 删除用户
  async deleteUser(req, res) {
    try {
      await req.user.remove();
      res.json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }

  // 更新密码
  async updatePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // 验证当前密码
      const isPasswordValid = await req.user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new AppError('当前密码错误', 401);
      }

      // 更新密码
      req.user.password = newPassword;
      await req.user.save();

      res.json({
        status: 'success',
        message: '密码更新成功'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController(); 