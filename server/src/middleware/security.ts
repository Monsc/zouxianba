import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler';

// 认证请求的速率限制
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '3600000'),
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'),
  message: 'Too many login attempts, please try again later',
});

// 安全中间件
export const securityMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 设置安全相关的响应头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");

  // 检查请求来源
  const origin = req.headers.origin;
  if (origin && origin !== process.env.CLIENT_URL) {
    throw new AppError('Invalid origin', 403);
  }

  next();
};

// 检查认证状态
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.userId) {
    throw new AppError('Authentication required', 401);
  }
  next();
};

// 检查管理员权限
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.isAdmin) {
    throw new AppError('Admin privileges required', 403);
  }
  next();
}; 