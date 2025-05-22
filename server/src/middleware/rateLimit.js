const rateLimit = require('express-rate-limit');
const config = require('../config');
// const Redis = require('ioredis');

// // 创建 Redis 客户端
// const redisClient = new Redis({
//   host: config.redis.host,
//   port: config.redis.port,
//   password: config.redis.password,
//   db: config.redis.db
// });

// // 监听 Redis 连接事件
// redisClient.on('connect', () => {
//   console.log('Redis client connected');
// });

// redisClient.on('error', (err) => {
//   console.error('Redis client error:', err);
// });

// // 创建自定义 Redis Store
// class CustomRedisStore {
//   constructor(client) {
//     this.client = client;
//   }

//   async increment(key) {
//     const multi = this.client.multi();
//     multi.incr(key);
//     multi.pexpire(key, config.rateLimit.windowMs);
//     const results = await multi.exec();
//     return results[0][1];
//   }

//   async decrement(key) {
//     await this.client.del(key);
//   }

//   async resetKey(key) {
//     await this.client.del(key);
//   }
// }

// 创建限流中间件
const createLimiter = () => {
  const options = {
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: '请求过于频繁，请稍后再试' }
  };

  return rateLimit(options);
};

// 创建限流器实例
const limiter = createLimiter();

// 导出限流器
module.exports = limiter; 