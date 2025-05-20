const crypto = require('crypto');
const { API_SECRET } = process.env;

// 生成请求签名
const generateSignature = (data, timestamp) => {
  const stringToSign = `${data}${timestamp}`;
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(stringToSign)
    .digest('hex');
};

// 验证请求签名
const verifySignature = (req, res, next) => {
  const signature = req.headers['x-api-signature'];
  const timestamp = req.headers['x-api-timestamp'];
  const method = req.method;
  const path = req.path;
  const query = req.query;
  const body = req.body;

  // 检查必要参数
  if (!signature || !timestamp) {
    return res.status(401).json({
      error: 'Missing signature or timestamp',
      message: 'API signature and timestamp are required'
    });
  }

  // 检查时间戳是否在有效期内（5分钟）
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
    return res.status(401).json({
      error: 'Invalid timestamp',
      message: 'Request timestamp is too old or in the future'
    });
  }

  // 构建签名字符串
  const data = JSON.stringify({
    method,
    path,
    query,
    body
  });

  // 验证签名
  const expectedSignature = generateSignature(data, timestamp);
  if (signature !== expectedSignature) {
    return res.status(401).json({
      error: 'Invalid signature',
      message: 'API signature verification failed'
    });
  }

  next();
};

// 生成签名中间件（用于开发测试）
const generateSignatureMiddleware = (req, res, next) => {
  const timestamp = Date.now().toString();
  const method = req.method;
  const path = req.path;
  const query = req.query;
  const body = req.body;

  const data = JSON.stringify({
    method,
    path,
    query,
    body
  });

  const signature = generateSignature(data, timestamp);

  req.headers['x-api-signature'] = signature;
  req.headers['x-api-timestamp'] = timestamp;

  next();
};

module.exports = {
  verifySignature,
  generateSignatureMiddleware,
  generateSignature
}; 