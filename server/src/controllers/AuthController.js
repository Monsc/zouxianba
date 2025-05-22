const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hash, compare } = require('../utils/password');
const emailService = require('../services/emailService');
const { generateVerificationCode } = require('../utils/verification');
const { rateLimit } = require('../middleware/rateLimit');
const jwt = require('jsonwebtoken');
const config = require('../config');

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
  async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists'
        });
      }

      // 创建新用户
      const user = new User({
        username,
        email,
        password
      });

      await user.save();

      // 生成认证令牌
      const token = await user.generateAuthToken();

      res.status(201).json({
        user,
        token
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  }

  // 登录
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // 查找用户并验证密码
      const user = await User.findByCredentials(email, password);

      // 生成认证令牌
      const token = await user.generateAuthToken();

      // 更新最后登录时间
      user.lastLogin = new Date();
      await user.save();

      res.json({
        user,
        token
      });
    } catch (error) {
      res.status(401).json({
        message: 'Invalid login credentials'
      });
    }
  }

  // 忘记密码
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 生成重置 token
      const resetToken = generateToken(user, '1h');

      // 发送重置密码邮件
      await emailService.sendPasswordReset(email, resetToken);

      res.json({ message: '重置密码邮件已发送' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: '发送重置密码邮件失败' });
    }
  }

  // 重置密码
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // 验证 token
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(400).json({ error: '无效或过期的重置链接' });
      }

      // 查找用户
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: '用户不存在' });
      }

      // 更新密码
      const hashedPassword = await hash(newPassword);
      user.password = hashedPassword;
      await user.save();

      // 发送密码已重置通知
      await emailService.sendSystemNotification(
        user.email,
        '密码已重置',
        '您的密码已成功重置。如果这不是您本人操作，请立即联系客服。'
      );

      res.json({ message: '密码重置成功' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: '重置密码失败' });
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
    try {
      // 从用户的令牌列表中移除当前令牌
      req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
      await req.user.save();

      res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
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
    try {
      res.json(req.user);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
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
}

module.exports = new AuthController(); 