import axios from 'axios';
import { getToken, getCsrfToken } from './auth';

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 生成请求签名
const generateSignature = (data: any, timestamp: number) => {
  const secret = import.meta.env.VITE_API_SECRET;
  const message = `${JSON.stringify(data)}${timestamp}${secret}`;
  // 使用 SHA-256 生成签名
  return window.crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(message))
    .then((hash) => {
      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    });
};

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 添加 CSRF Token
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // 添加认证 Token
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 添加时间戳
    const timestamp = Date.now();
    config.headers['X-Timestamp'] = timestamp;

    // 生成请求签名
    if (config.data) {
      const signature = await generateSignature(config.data, timestamp);
      config.headers['X-Signature'] = signature;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 更新 CSRF Token
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      localStorage.setItem('csrfToken', csrfToken);
    }

    return response.data;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          // CSRF Token 无效，刷新页面获取新的 Token
          window.location.reload();
          break;
        case 429:
          // 请求过于频繁，显示提示
          console.error('请求过于频繁，请稍后再试');
          break;
        default:
          console.error('请求失败:', error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default request; 