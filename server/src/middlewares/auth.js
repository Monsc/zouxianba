const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError } = require('./errorHandler');
const User = require('../models/user.model');
const redis = require('../core/redis');

const authMiddleware = async (req, res, next) => {
  try {
    // 获取token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError(401, '未提供认证令牌');
    }

    // 验证token
    const decoded = jwt.verify(token, config.jwt.secret);

    // 检查token是否在黑名单中
    const isBlacklisted = await redis.get(`bl_${token}`);
    if (isBlacklisted) {
      throw new AppError(401, '令牌已失效');
    }

    // 获取用户信息
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new AppError(401, '用户不存在');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new AppError(403, '账户已被禁用');
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError(401, '无效的认证令牌'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError(401, '认证令牌已过期'));
    } else {
      next(error);
    }
  }
};

// 角色检查中间件
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, '没有权限执行此操作'));
    }
    next();
  };
};

// 资源所有者检查中间件
const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      if (!resource) {
        return next(new AppError(404, '资源不存在'));
      }

      if (resource.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError(403, '没有权限执行此操作'));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// 刷新token中间件
const refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.headers['x-refresh-token'];
    if (!refreshToken) {
      throw new AppError(401, '未提供刷新令牌');
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new AppError(401, '用户不存在');
    }

    // 生成新的token
    const newToken = jwt.sign(
      { id: user._id },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // 将旧token加入黑名单
    await redis.setex(
      `bl_${req.headers.authorization?.split(' ')[1]}`,
      config.jwt.expiresIn,
      '1'
    );

    res.setHeader('X-New-Token', newToken);
    next();
  } catch (error) {
    next(new AppError(401, '刷新令牌无效或已过期'));
  }
};

module.exports = {
  authMiddleware,
  checkRole,
  checkOwnership,
  refreshToken,
}; 