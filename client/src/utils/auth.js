// Token 存储键名
const TOKEN_KEY = 'auth_token';

// 获取 token
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// 设置 token
export const setToken = token => {
  localStorage.setItem(TOKEN_KEY, token);
};

// 移除 token
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// 检查 token 是否过期
export const isTokenExpired = token => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// 获取 token 过期时间
export const getTokenExpiration = token => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000;
  } catch {
    return null;
  }
};

// 计算 token 剩余有效期（毫秒）
export const getTokenTimeLeft = token => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;
  return Math.max(0, expiration - Date.now());
};
