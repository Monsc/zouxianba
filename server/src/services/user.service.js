const User = require('../models/user.model');
const { AppError } = require('../middlewares/errorHandler');
const jwt = require('jsonwebtoken');
const config = require('../config');
const redis = require('../core/redis');
const { sendEmail } = require('../utils/email');
const { generateToken } = require('../utils/token');

class UserService {
  // 用户注册
  async register(userData) {
    const { email, username, password } = userData;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new AppError(400, '邮箱或用户名已被使用');
    }

    // 创建新用户
    const user = await User.create({
      email,
      username,
      password,
    });

    // 生成验证邮件token
    const verificationToken = generateToken(user._id, '1h');
    await redis.setex(
      `verify_${verificationToken}`,
      3600,
      user._id.toString()
    );

    // 发送验证邮件
    await sendEmail({
      to: email,
      subject: '验证您的邮箱',
      template: 'verification',
      data: {
        username,
        verificationUrl: `${config.clientUrl}/verify-email?token=${verificationToken}`,
      },
    });

    return this.getUserProfile(user);
  }

  // 用户登录
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(401, '邮箱或密码错误');
    }

    // 检查账户是否被锁定
    if (user.isLocked()) {
      throw new AppError(403, '账户已被锁定，请稍后再试');
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new AppError(401, '邮箱或密码错误');
    }

    // 重置登录尝试次数
    await user.resetLoginAttempts();

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成token
    const accessToken = jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );

    return {
      user: this.getUserProfile(user),
      accessToken,
      refreshToken,
    };
  }

  // 获取用户资料
  async getUserProfile(user) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      createdAt: user.createdAt,
    };
  }

  // 更新用户资料
  async updateProfile(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    // 更新允许的字段
    const allowedUpdates = ['username', 'bio', 'avatar'];
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        user[key] = updateData[key];
      }
    });

    await user.save();
    return this.getUserProfile(user);
  }

  // 关注用户
  async followUser(userId, targetUserId) {
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);

    if (!user || !targetUser) {
      throw new AppError(404, '用户不存在');
    }

    if (user.following.includes(targetUserId)) {
      throw new AppError(400, '已经关注该用户');
    }

    user.following.push(targetUserId);
    targetUser.followers.push(userId);

    await Promise.all([user.save(), targetUser.save()]);

    return {
      followersCount: targetUser.followers.length,
      followingCount: user.following.length,
    };
  }

  // 取消关注
  async unfollowUser(userId, targetUserId) {
    const [user, targetUser] = await Promise.all([
      User.findById(userId),
      User.findById(targetUserId),
    ]);

    if (!user || !targetUser) {
      throw new AppError(404, '用户不存在');
    }

    user.following = user.following.filter(
      id => id.toString() !== targetUserId.toString()
    );
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== userId.toString()
    );

    await Promise.all([user.save(), targetUser.save()]);

    return {
      followersCount: targetUser.followers.length,
      followingCount: user.following.length,
    };
  }

  // 获取用户关注列表
  async getFollowing(userId, page = 1, limit = 20) {
    const user = await User.findById(userId)
      .populate('following', 'username avatar bio')
      .skip((page - 1) * limit)
      .limit(limit);

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    return user.following;
  }

  // 获取用户粉丝列表
  async getFollowers(userId, page = 1, limit = 20) {
    const user = await User.findById(userId)
      .populate('followers', 'username avatar bio')
      .skip((page - 1) * limit)
      .limit(limit);

    if (!user) {
      throw new AppError(404, '用户不存在');
    }

    return user.followers;
  }

  // 搜索用户
  async searchUsers(query, page = 1, limit = 20) {
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username avatar bio followers following')
      .skip((page - 1) * limit)
      .limit(limit);

    return users.map(user => ({
      ...this.getUserProfile(user),
      followersCount: user.followers.length,
      followingCount: user.following.length,
    }));
  }
}

module.exports = new UserService(); 