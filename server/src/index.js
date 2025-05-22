const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const { authenticateToken } = require('./middleware/auth');
const config = require('./config');
const { initializeSocket } = require('./socket');

// 路由导入
const routes = require('./routes');

// 中间件导入
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { securityMiddleware } = require('./middleware/security');
const { performanceMiddleware } = require('./middleware/performance');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 创建 Express 应用
const app = express();

// Redis 客户端
const redisClient = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: config.cors.methods,
  allowedHeaders: config.cors.allowedHeaders
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 安全中间件
app.use(securityMiddleware);

// 性能监控
app.use(performanceMiddleware);

// API 路由
app.use('/api', routes);

// 健康检查端点
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 错误处理
app.use(notFound);
app.use(errorHandler);

// 创建 HTTP 服务器
const server = http.createServer(app);

// 连接数据库并启动服务器
async function startServer() {
  try {
    // 连接 MongoDB
    await mongoose.connect(config.database.mongodb.uri, config.database.mongodb.options);
    console.log('Connected to MongoDB');

    // Redis 连接事件监听
    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    // 初始化 Socket.IO
    initializeSocket(server);

    // 启动服务器
    server.listen(config.server.port, () => {
      console.log(`Server is running on port ${config.server.port}`);
      console.log('Environment:', {
        NODE_ENV: config.server.env,
        PORT: config.server.port,
        MONGODB_URI: config.database.mongodb.uri ? 'defined' : 'undefined'
      });
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await mongoose.connection.close();
  await redisClient.quit();
  process.exit(0);
});

// 启动服务器
startServer(); 