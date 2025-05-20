import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { securityMiddleware } from './middleware/security';
import { performanceMiddleware } from './middleware/performance';
import routes from './routes';

const app = express();
const prisma = new PrismaClient();

// Redis 客户端
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// 中间件
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 会话配置
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
  },
}));

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
});
app.use(limiter);

// 安全中间件
app.use(securityMiddleware);

// 性能监控
app.use(performanceMiddleware);

// 路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server...');
  await prisma.$disconnect();
  await redisClient.quit();
  process.exit(0);
});

export default app; 