import express from 'express';
import cors from 'cors';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';
import { securityMiddleware } from './middleware/security';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();

// 创建 Redis 客户端
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect().catch(console.error);

// 基础中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

// 会话配置
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24小时
  },
}));

// 安全中间件
app.use(securityMiddleware.securityHeaders);
app.use(securityMiddleware.validateRequest);
app.use(securityMiddleware.sessionSecurity);
app.use(securityMiddleware.securityLogging);

// API 路由速率限制
app.use('/api', securityMiddleware.apiLimiter);

// 认证路由速率限制
app.use('/api/auth', securityMiddleware.authLimiter);

// 文件上传验证
app.use('/api/upload', securityMiddleware.validateFileUpload);

// API 路由
app.use('/api', routes);

// 错误处理
app.use(errorHandler);

export default app; 