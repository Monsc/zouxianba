const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../services/redis');
const config = require('../config');

// 通用限流配置
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100, // 限制每个IP在windowMs内最多请求max次
    message = '请求过于频繁，请稍后再试',
    keyGenerator = (req) => req.ip, // 默认使用IP作为key
    skip = (req) => false // 默认不跳过任何请求
  } = options;

  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:'
    }),
    windowMs,
    max,
    message: { error: message },
    keyGenerator,
    skip,
    standardHeaders: true, // 返回标准的RateLimit头
    legacyHeaders: false // 禁用X-RateLimit-*头
  });
};

// 登录限流
const loginLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每小时最多5次
  message: '登录尝试次数过多，请1小时后再试',
  keyGenerator: (req) => `login:${req.body.email || req.ip}`
});

// 注册限流
const registerLimiter = createRateLimiter({
  windowMs: 24 * 60 * 60 * 1000, // 24小时
  max: 3, // 每天最多3次
  message: '注册次数过多，请24小时后再试',
  keyGenerator: (req) => `register:${req.body.email || req.ip}`
});

// 验证码限流
const verificationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 5, // 每小时最多5次
  message: '验证码发送次数过多，请1小时后再试',
  keyGenerator: (req) => `verification:${req.body.email || req.ip}`
});

// API限流
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每15分钟最多100次
  message: 'API请求过于频繁，请稍后再试',
  skip: (req) => req.path.startsWith('/api/v1/auth') // 跳过认证相关的API
});

module.exports = {
  loginLimiter,
  registerLimiter,
  verificationLimiter,
  apiLimiter
}; 