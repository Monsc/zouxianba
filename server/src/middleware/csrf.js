const csrf = require('csurf');
const { CSRF_SECRET } = process.env;

// CSRF 保护配置
const csrfProtection = csrf({
  cookie: {
    key: '_csrf',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1小时
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  value: (req) => {
    // 从请求头或查询参数中获取 token
    return req.headers['x-csrf-token'] || req.query._csrf;
  }
});

// 错误处理中间件
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'CSRF token validation failed',
      message: 'Invalid or missing CSRF token'
    });
  }
  next(err);
};

// 生成新的 CSRF token
const generateCSRFToken = (req, res, next) => {
  if (!req.csrfToken) {
    return next();
  }
  
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // 允许前端 JavaScript 访问
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  next();
};

module.exports = {
  csrfProtection,
  csrfErrorHandler,
  generateCSRFToken
}; 