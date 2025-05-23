import CryptoJS from 'crypto-js';

// 生成请求签名
export const generateRequestSignature = async config => {
  const timestamp = Date.now().toString();
  const data = {
    method: config.method.toUpperCase(),
    path: config.url,
    query: config.params || {},
    body: config.data || {},
    timestamp,
  };

  // 按字母顺序排序对象键
  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  // 将数据转换为字符串
  const dataString = JSON.stringify(sortedData);

  // 使用 HMAC-SHA256 生成签名
  const signature = CryptoJS.HmacSHA256(
    dataString,
    import.meta.env.VITE_API_SECRET || 'your-api-secret'
  ).toString();

  // 添加时间戳到请求头
  config.headers['X-Request-Timestamp'] = timestamp;

  return signature;
};

// 验证密码强度
export const validatePassword = password => {
  const errors = [];

  // 最小长度
  if (password.length < 8) {
    errors.push('密码长度至少为8个字符');
  }

  // 大写字母
  if (!/[A-Z]/.test(password)) {
    errors.push('密码必须包含大写字母');
  }

  // 小写字母
  if (!/[a-z]/.test(password)) {
    errors.push('密码必须包含小写字母');
  }

  // 数字
  if (!/\d/.test(password)) {
    errors.push('密码必须包含数字');
  }

  // 特殊字符
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码必须包含特殊字符');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 生成随机字符串
export const generateRandomString = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// 加密数据
export const encryptData = (data, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

// 解密数据
export const decryptData = (encryptedData, key) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// 生成 CSRF Token
export const generateCSRFToken = () => {
  return generateRandomString(32);
};

// 验证 CSRF Token
export const validateCSRFToken = token => {
  const storedToken = localStorage.getItem('csrfToken');
  return token === storedToken;
};

// 生成双因素认证备用码
export const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateRandomString(10));
  }
  return codes;
};

// 格式化安全日志
export const formatSecurityLog = log => {
  const actionMap = {
    login: '登录',
    logout: '登出',
    change_password: '修改密码',
    enable_2fa: '启用双因素认证',
    disable_2fa: '禁用双因素认证',
    update_profile: '更新个人资料',
    login_2fa: '双因素认证登录',
    logout_session: '注销会话',
  };

  return {
    ...log,
    action: actionMap[log.action] || log.action,
    timestamp: new Date(log.timestamp).toLocaleString(),
  };
};
