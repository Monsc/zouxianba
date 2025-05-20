import request from './request';

// 密码策略
const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxConsecutiveChars: 3,
  maxAge: 90, // 密码有效期（天）
};

// 账号锁定策略
const ACCOUNT_LOCK_POLICY = {
  maxFailedAttempts: 5,
  lockDuration: 30, // 锁定时间（分钟）
  resetAfter: 24, // 失败次数重置时间（小时）
};

// 验证密码强度
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < PASSWORD_POLICY.minLength) {
    return {
      valid: false,
      message: `密码长度不能少于 ${PASSWORD_POLICY.minLength} 个字符`,
    };
  }

  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含大写字母',
    };
  }

  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含小写字母',
    };
  }

  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含数字',
    };
  }

  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含特殊字符',
    };
  }

  // 检查连续字符
  for (let i = 0; i < password.length - PASSWORD_POLICY.maxConsecutiveChars; i++) {
    const consecutive = password.slice(i, i + PASSWORD_POLICY.maxConsecutiveChars);
    if (new Set(consecutive).size === 1) {
      return {
        valid: false,
        message: `密码不能包含 ${PASSWORD_POLICY.maxConsecutiveChars} 个或更多连续相同字符`,
      };
    }
  }

  return { valid: true, message: '密码符合要求' };
};

// 获取 Token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 设置 Token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 移除 Token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// 获取 CSRF Token
export const getCsrfToken = (): string | null => {
  return localStorage.getItem('csrfToken');
};

// 设置 CSRF Token
export const setCsrfToken = (token: string): void => {
  localStorage.setItem('csrfToken', token);
};

// 移除 CSRF Token
export const removeCsrfToken = (): void => {
  localStorage.removeItem('csrfToken');
};

// 登录
export const login = async (username: string, password: string) => {
  try {
    const response = await request.post('/auth/login', { username, password });
    const { token, csrfToken } = response;
    setToken(token);
    setCsrfToken(csrfToken);
    return response;
  } catch (error: any) {
    if (error.response?.status === 423) {
      throw new Error('账号已被锁定，请稍后再试');
    }
    throw error;
  }
};

// 注册
export const register = async (username: string, password: string, email: string) => {
  // 验证密码强度
  const { valid, message } = validatePassword(password);
  if (!valid) {
    throw new Error(message);
  }

  return request.post('/auth/register', { username, password, email });
};

// 修改密码
export const changePassword = async (oldPassword: string, newPassword: string) => {
  // 验证新密码强度
  const { valid, message } = validatePassword(newPassword);
  if (!valid) {
    throw new Error(message);
  }

  return request.post('/auth/change-password', { oldPassword, newPassword });
};

// 重置密码
export const resetPassword = async (email: string) => {
  return request.post('/auth/reset-password', { email });
};

// 验证重置密码 Token
export const verifyResetToken = async (token: string) => {
  return request.get(`/auth/verify-reset-token/${token}`);
};

// 设置新密码
export const setNewPassword = async (token: string, newPassword: string) => {
  // 验证新密码强度
  const { valid, message } = validatePassword(newPassword);
  if (!valid) {
    throw new Error(message);
  }

  return request.post('/auth/set-new-password', { token, newPassword });
};

// 登出
export const logout = async () => {
  try {
    await request.post('/auth/logout');
  } finally {
    removeToken();
    removeCsrfToken();
  }
};

// 检查账号是否被锁定
export const checkAccountLock = async (username: string) => {
  const response = await request.get(`/auth/check-lock/${username}`);
  return response.locked;
};

// 获取账号锁定信息
export const getAccountLockInfo = async (username: string) => {
  const response = await request.get(`/auth/lock-info/${username}`);
  return {
    failedAttempts: response.failedAttempts,
    remainingTime: response.remainingTime,
    lockedUntil: response.lockedUntil,
  };
}; 