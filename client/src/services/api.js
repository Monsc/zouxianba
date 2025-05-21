import axios from 'axios';
import { withCache, preloadData } from './cache';
import crypto from 'crypto-js';
import { getToken, isTokenExpired, getTokenTimeLeft, setToken, removeToken } from '../utils/auth';
import { generateRequestSignature } from '../utils/security';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
const API_SECRET = import.meta.env.VITE_API_SECRET;

// 生成请求签名
const generateSignature = (data, timestamp) => {
  const stringToSign = `${data}${timestamp}`;
  return crypto.HmacSHA256(stringToSign, API_SECRET).toString();
};

// 配置 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 启用跨域请求携带凭证
});

// 请求拦截器
api.interceptors.request.use(
  async (config) => {
    const token = getToken();
    
    // 如果 token 存在且即将过期（剩余时间小于5分钟），尝试刷新
    if (token && getTokenTimeLeft(token) < 5 * 60 * 1000) {
      try {
        const response = await api.post('/auth/refresh-token');
        const { token: newToken } = response.data;
        setToken(newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
      } catch (error) {
        console.error('Failed to refresh token:', error);
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 生成请求签名
    const signature = await generateRequestSignature(config);
    if (signature) {
      config.headers['X-Request-Signature'] = signature;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 处理 401 错误（未授权）
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 如果是 token 过期，尝试刷新 token
      if (error.response.data.error === 'Token expired') {
        try {
          const response = await api.post('/auth/refresh-token');
          const { token } = response.data;
          setToken(token);

          // 重试原始请求
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          removeToken();
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// 获取 CSRF token
const getCsrfToken = () => {
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return '';
};

// 获取认证 token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// 处理认证错误
const handleAuthError = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

async function fetchApi(endpoint, options = {}) {
  const token = getAuthToken();
  let headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 添加 CSRF token 到所有非 GET 请求
  if (options.method && options.method !== 'GET') {
    headers = {
      ...headers,
      'X-CSRF-Token': getCsrfToken() || '',
    };
  }

  // Only set Content-Type if body is not FormData
  if (!(options.body instanceof FormData)) {
    headers = { 'Content-Type': 'application/json', ...headers };
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Invalid server response');
    }

    if (!response.ok) {
      if (response.status === 401) {
        handleAuthError();
      }
      throw new Error(data.error || data.message || 'Something went wrong');
    }

    return data.data ?? data;
  } catch (error) {
    if (error.message === 'Please authenticate') {
      handleAuthError();
    }
    throw error;
  }
}

class ApiService {
  // 认证相关
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  // 用户相关
  async getUserProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(data) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // 帖子相关
  async getPosts(page = 1, limit = 20) {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getPost(postId) {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data) {
    const response = await api.post('/posts', data);
    return response.data;
  }

  async likePost(postId) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId) {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  }

  // 评论相关
  async getComments(postId, page = 1, limit = 20) {
    const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
    return response.data;
  }

  async createComment(postId, data) {
    const response = await api.post(`/posts/${postId}/comments`, data);
    return response.data;
  }

  // 通知相关
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  }

  async getUnreadNotificationCount() {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  }

  // 消息相关
  async getConversations() {
    const response = await api.get('/messages/conversations');
    return response.data;
  }

  async getMessages(userId) {
    const response = await api.get(`/messages/${userId}`);
    return response.data;
  }

  async sendMessage(userId, content) {
    const response = await api.post(`/messages/${userId}`, { content });
    return response.data;
  }

  // 搜索相关
  async searchUsers(query) {
    const response = await api.get(`/search/users?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async searchPosts(query) {
    const response = await api.get(`/search/posts?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // 预加载初始数据
  async preloadInitialData() {
    await Promise.all([
      preloadData('getPosts:1', this.getPosts(1)),
      preloadData('getNotifications', this.getNotifications()),
    ]);
  }

  // 发送验证码
  async sendVerificationCode(email) {
    const response = await api.post('/auth/send-verification', { email });
    return response.data;
  }

  // 验证邮箱
  async verifyEmail(email, code) {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  }

  // 忘记密码
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  }

  // 重置密码
  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  // 修改密码
  async changePassword(currentPassword, newPassword) {
    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }

  // 添加缺失的 API 方法
  async getUserPosts(userId, page = 1, limit = 20) {
    const response = await api.get(`/users/${userId}/posts?page=${page}&limit=${limit}`);
    return response.data;
  }

  async followUser(userId) {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId) {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  }

  async blockUser(userId) {
    const response = await api.post(`/users/${userId}/block`);
    return response.data;
  }

  async unblockUser(userId) {
    const response = await api.delete(`/users/${userId}/block`);
    return response.data;
  }

  async getMentions(page = 1, limit = 20) {
    const response = await api.get(`/mentions?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getRecommendedUsers() {
    const response = await api.get('/users/recommended');
    return response.data;
  }

  async getTrendingTopics() {
    const response = await api.get('/topics/trending');
    return response.data;
  }

  async sendImageMessage(userId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/messages/${userId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

// 创建 API 服务实例
const apiService = new ApiService();

// 导出 API 实例和服务
export { api, apiService, ApiService };

// 默认导出 API 实例
export default api;

// 导出 fetchApi 函数
export { fetchApi };

// 导出 API 方法
export const getMessages = apiService.getMessages.bind(apiService);
export const sendImageMessage = apiService.sendImageMessage.bind(apiService);
export const sendMessage = apiService.sendMessage.bind(apiService);
export const getRecommendedUsers = apiService.getRecommendedUsers.bind(apiService);
export const getTrendingTopics = apiService.getTrendingTopics.bind(apiService);
export const unfollowUser = apiService.unfollowUser.bind(apiService);
export const followUser = apiService.followUser.bind(apiService);
export const getMentions = apiService.getMentions.bind(apiService);
export const getConversations = apiService.getConversations.bind(apiService);
export const getPost = apiService.getPost.bind(apiService);
export const getComments = apiService.getComments.bind(apiService);
export const likePost = apiService.likePost.bind(apiService);
export const createComment = apiService.createComment.bind(apiService);
export const searchUsers = apiService.searchUsers.bind(apiService);
export const searchPosts = apiService.searchPosts.bind(apiService);
