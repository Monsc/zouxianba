export const securityConfig = {
  // 内容安全策略 (CSP)
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      'https://www.google-analytics.com',
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https:',
      'blob:',
    ],
    fontSrc: [
      "'self'",
      'https://fonts.gstatic.com',
    ],
    connectSrc: [
      "'self'",
      'https://api.zouxianba.com',
      'wss://api.zouxianba.com',
    ],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    workerSrc: ["'self'"],
  },

  // 安全头部配置
  headers: {
    // 防止点击劫持
    'X-Frame-Options': 'DENY',
    // 防止 MIME 类型嗅探
    'X-Content-Type-Options': 'nosniff',
    // 启用 XSS 过滤
    'X-XSS-Protection': '1; mode=block',
    // 引用策略
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // 权限策略
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
    ].join(', '),
  },

  // 密码策略
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90, // 密码有效期（天）
  },

  // 会话安全
  session: {
    // 会话超时时间（分钟）
    timeout: 30,
    // 记住我选项超时时间（天）
    rememberMeTimeout: 30,
    // 并发会话限制
    maxConcurrentSessions: 1,
  },

  // 请求限制
  rateLimit: {
    // API 请求限制
    api: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100, // 每个IP最大请求数
    },
    // 登录请求限制
    auth: {
      windowMs: 60 * 60 * 1000, // 1小时
      max: 5, // 每个IP最大尝试次数
    },
  },

  // 文件上传安全
  upload: {
    // 允许的文件类型
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ],
    // 最大文件大小（字节）
    maxSize: 5 * 1024 * 1024, // 5MB
    // 图片尺寸限制
    imageSize: {
      maxWidth: 4096,
      maxHeight: 4096,
    },
  },

  // 安全日志配置
  logging: {
    // 记录的安全事件
    events: [
      'login',
      'logout',
      'password_change',
      'profile_update',
      'file_upload',
    ],
    // 日志保留时间（天）
    retention: 90,
  },
}; 