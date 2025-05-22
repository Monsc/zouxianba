const Redis = require('ioredis');
const config = require('../config');
const { AppError } = require('../utils/AppError');

// 创建 Redis 客户端
const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// 监听连接事件
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
  throw new AppError('Redis 连接失败', 500);
});

// 监听重连事件
redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

// 优雅关闭
process.on('SIGTERM', () => {
  redis.quit();
});

module.exports = redis; 