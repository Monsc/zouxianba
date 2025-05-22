// 删除 Redis 客户端创建和连接逻辑
// const redis = new Redis({
//   host: config.redis.host,
//   port: config.redis.port,
//   password: config.redis.password,
//   db: config.redis.db,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   }
// });

// 删除 Redis 连接事件监听
// redis.on('connect', () => {
//   console.log('Redis connected successfully');
// });

// redis.on('error', (error) => {
//   console.error('Redis connection error:', error);
//   throw new AppError('Redis 连接失败', 500);
// });

// 删除 Redis 重连事件监听
// redis.on('reconnecting', () => {
//   console.log('Redis reconnecting...');
// });

// 删除 Redis 优雅关闭
// process.on('SIGTERM', () => {
//   redis.quit();
// });

// 删除 Redis 导出
// module.exports = redis; 