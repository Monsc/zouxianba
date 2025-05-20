import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { securityConfig } from '../../config/security';

// 创建速率限制器
const apiLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.api.windowMs,
  max: securityConfig.rateLimit.api.max,
  message: '请求过于频繁，请稍后再试',
});

const authLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.auth.windowMs,
  max: securityConfig.rateLimit.auth.max,
  message: '登录尝试次数过多，请稍后再试',
});

// 安全头部中间件
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: securityConfig.csp,
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: 'same-site' },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
});

// 请求验证中间件
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  // 验证 Content-Type
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: '不支持的 Content-Type' });
    }
  }

  // 验证请求大小
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 1024 * 1024) { // 1MB
    return res.status(413).json({ error: '请求体过大' });
  }

  next();
};

// 文件上传验证中间件
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  // 验证文件类型
  if (!securityConfig.upload.allowedTypes.includes(req.file.mimetype)) {
    return res.status(415).json({ error: '不支持的文件类型' });
  }

  // 验证文件大小
  if (req.file.size > securityConfig.upload.maxSize) {
    return res.status(413).json({ error: '文件过大' });
  }

  // 验证图片尺寸
  if (req.file.mimetype.startsWith('image/')) {
    const dimensions = req.file.dimensions;
    if (
      dimensions.width > securityConfig.upload.imageSize.maxWidth ||
      dimensions.height > securityConfig.upload.imageSize.maxHeight
    ) {
      return res.status(413).json({ error: '图片尺寸过大' });
    }
  }

  next();
};

// 会话安全中间件
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next();
  }

  // 检查会话是否过期
  if (req.session.lastActivity) {
    const inactiveTime = Date.now() - req.session.lastActivity;
    if (inactiveTime > securityConfig.session.timeout * 60 * 1000) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
        }
        return res.status(401).json({ error: '会话已过期，请重新登录' });
      });
      return;
    }
  }

  // 更新最后活动时间
  req.session.lastActivity = Date.now();
  next();
};

// 安全日志中间件
export const securityLogging = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // 记录请求开始
  const logRequest = () => {
    const duration = Date.now() - startTime;
    const event = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    // 检查是否需要记录此事件
    if (securityConfig.logging.events.includes(req.path.split('/')[1])) {
      console.log('Security event:', event);
      // 这里可以添加日志存储逻辑
    }
  };

  // 在响应结束时记录日志
  res.on('finish', logRequest);
  next();
};

// 导出所有中间件
export const securityMiddleware = {
  apiLimiter,
  authLimiter,
  securityHeaders,
  validateRequest,
  validateFileUpload,
  sessionSecurity,
  securityLogging,
}; 