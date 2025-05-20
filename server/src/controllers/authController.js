const User = require('../models/User');
const { generateToken, verifyToken } = require('../utils/jwt');
const { hash, compare } = require('../utils/password');
const emailService = require('../services/emailService');
const { generateVerificationCode } = require('../utils/verification');
const { rateLimit } = require('../middleware/rateLimit');

// 发送验证码
exports.sendVerificationCode = async (req, res) => {
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
};

// 注册
exports.register = async (req, res) => {
  try {
    const { email, password, username, code } = req.body;

    // 验证验证码
    const isValid = await verifyCode(email, code);
    if (!isValid) {
      return res.status(400).json({ error: '验证码无效或已过期' });
    }

    // 检查用户是否已存在
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已被注册' });
    }

    // 创建新用户
    const hashedPassword = await hash(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      username,
      emailVerified: true
    });

    // 发送欢迎邮件
    await emailService.sendWelcomeEmail(email, username);

    // 生成 token
    const token = generateToken(user);

    res.status(201).json({
      message: '注册成功',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '注册失败' });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 token
    const token = generateToken(user);

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
};

// 忘记密码
exports.forgotPassword = async (req, res) => {
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
};

// 重置密码
exports.resetPassword = async (req, res) => {
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
};

// 修改密码
exports.changePassword = async (req, res) => {
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
};

// 登出
exports.logout = async (req, res) => {
  try {
    // 可以在这里添加 token 黑名单逻辑
    res.json({ message: '登出成功' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: '登出失败' });
  }
}; 