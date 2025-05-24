import axios from 'axios';
import { withCache, preloadData } from './cache';
import crypto from 'crypto-js';
import { getToken, isTokenExpired, getTokenTimeLeft, setToken, removeToken } from '../utils/auth';
import { generateRequestSignature } from '../utils/security';
import { CancelToken } from 'axios';
import { useUserStore } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
console.log('API_BASE_URL from services:', API_BASE_URL);
const API_SECRET = import.meta.env.VITE_API_SECRET;

// 生成请求签名
const generateSignature = (data, timestamp) => {
  const stringToSign = `${data}${timestamp}`;
  return crypto.HmacSHA256(stringToSign, API_SECRET).toString();
};

// 创建请求队列
const requestQueue = new Map();

// API 服务类
class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // 请求拦截器
    this.api.interceptors.request.use(
      config => {
        const token = useUserStore.getState().user?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // 为每个请求创建取消令牌
        const source = CancelToken.source();
        config.cancelToken = source.token;

        // 将请求添加到队列
        const requestKey = `${config.method}-${config.url}`;
        if (requestQueue.has(requestKey)) {
          requestQueue.get(requestKey).cancel('Request cancelled due to duplicate');
        }
        requestQueue.set(requestKey, source);

        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.api.interceptors.response.use(
      response => {
        // 请求完成后从队列中移除
        const requestKey = `${response.config.method}-${response.config.url}`;
        requestQueue.delete(requestKey);
        return response;
      },
      async error => {
        // 新增详细日志
        console.error('API Error:', error, error?.response, error?.message, error?.stack);
        if (axios.isCancel(error)) {
          return Promise.reject(error);
        }

        // 只对需要登录的接口做跳转
        const url = error.config?.url || '';
        const needAuth = [
          '/auth/me',
          '/posts/feed',
          '/notifications',
          '/messages',
          '/users/me',
          '/bookmarks',
          '/settings',
          // 可根据实际情况补充
        ].some(path => url.includes(path));

        if (error.response?.status === 401 && needAuth) {
          useUserStore.getState().clearUser();
          // 只在非登录页跳转，且加hash防抖
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login#redirected';
          }
          return Promise.reject(error);
        }

        // 其他401（如公开API）不跳转
        return Promise.reject(error);
      }
    );
  }

  // 重试机制
  async retryRequest(config, retries = 3, delay = 1000) {
    try {
      return await this.api(config);
    } catch (error) {
      if (retries === 0) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(config, retries - 1, delay * 2);
    }
  }

  // 基础请求方法
  async get(url, config = {}) {
    return this.retryRequest({ ...config, method: 'get', url });
  }

  async post(url, data = {}, config = {}) {
    return this.retryRequest({ ...config, method: 'post', url, data });
  }

  async put(url, data = {}, config = {}) {
    return this.retryRequest({ ...config, method: 'put', url, data });
  }

  async patch(url, data = {}, config = {}) {
    return this.retryRequest({ ...config, method: 'patch', url, data });
  }

  async delete(url, config = {}) {
    return this.retryRequest({ ...config, method: 'delete', url });
  }

  // 取消请求方法
  cancelAll() {
    requestQueue.forEach(source => source.cancel('Request cancelled'));
    requestQueue.clear();
  }

  cancel(method, url) {
    const requestKey = `${method}-${url}`;
    if (requestQueue.has(requestKey)) {
      requestQueue.get(requestKey).cancel('Request cancelled');
      requestQueue.delete(requestKey);
    }
  }

  // 认证相关
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await this.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.get('/auth/me');
    return response.data;
  }

  // 用户相关
  async getUserProfile(userId) {
    const response = await this.get(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(data) {
    const response = await this.put('/users/profile', data);
    return response.data;
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await this.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 帖子相关
  async getPosts(page = 1, limit = 20) {
    const response = await this.get('/posts', { params: { page, limit } });
    return response.data;
  }

  async getPost(postId) {
    const response = await this.get(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data) {
    // 提取话题标签
    const hashtags = data.content.match(/#[\w\u4e00-\u9fa5]+/g) || [];
    const processedHashtags = hashtags.map(tag => tag.slice(1)); // 移除#符号
    
    const response = await this.post('/posts', {
      ...data,
      hashtags: processedHashtags
    });
    return response.data;
  }

  async likePost(postId) {
    const response = await this.post(`/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId) {
    const response = await this.delete(`/posts/${postId}/like`);
    return response.data;
  }

  // 评论相关
  async getComments(postId, page = 1, limit = 20) {
    const response = await this.get(`/posts/${postId}/comments`, { params: { page, limit } });
    return response.data;
  }

  async createComment(postId, data) {
    const response = await this.post(`/posts/${postId}/comments`, data);
    return response.data;
  }

  // 通知相关
  async getNotifications() {
    const response = await this.get('/notifications');
    return response.data;
  }

  async getUnreadNotificationCount() {
    const response = await this.get('/notifications/unread/count');
    return response.data;
  }

  // 消息相关
  async getConversations() {
    const response = await this.get('/messages/conversations');
    return response.data;
  }

  async getMessages(userId) {
    const response = await this.get(`/messages/${userId}`);
    return response.data;
  }

  async sendMessage(userId, content) {
    const response = await this.post(`/messages/${userId}`, { content });
    return response.data;
  }

  // 搜索相关
  async searchUsers(query) {
    const response = await this.get('/search/users', { params: { q: query } });
    return response.data;
  }

  async searchPosts(query) {
    const response = await this.get('/search/posts', { params: { q: query } });
    return response.data;
  }

  // 其他功能
  async preloadInitialData() {
    const [user, notifications] = await Promise.all([
      this.getCurrentUser(),
      this.getUnreadNotificationCount(),
    ]);
    return { user, notifications };
  }

  async sendVerificationCode(email) {
    const response = await this.post('/auth/verification-code', { email });
    return response.data;
  }

  async verifyEmail(email, code) {
    const response = await this.post('/auth/verify-email', { email, code });
    return response.data;
  }

  async forgotPassword(email) {
    const response = await this.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token, newPassword) {
    const response = await this.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  async changePassword(currentPassword, newPassword) {
    const response = await this.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }

  async getUserPosts(userId, page = 1, limit = 20) {
    const response = await this.get(`/users/${userId}/posts`, { params: { page, limit } });
    return response.data;
  }

  async followUser(userId) {
    const response = await this.post(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId) {
    const response = await this.delete(`/users/${userId}/follow`);
    return response.data;
  }

  async blockUser(userId) {
    const response = await this.post(`/users/${userId}/block`);
    return response.data;
  }

  async unblockUser(userId) {
    const response = await this.delete(`/users/${userId}/block`);
    return response.data;
  }

  async getMentions(page = 1, limit = 20) {
    const response = await this.get('/mentions', { params: { page, limit } });
    return response.data;
  }

  async getRecommendedUsers() {
    const response = await this.get('/users/recommended');
    return response.data;
  }

  async getTrendingTopics() {
    const response = await this.get('/topics/trending');
    return response.data;
  }

  async getTopicPosts(topic, page = 1, limit = 20) {
    const response = await this.get(`/topics/${encodeURIComponent(topic)}/posts`, {
      params: { page, limit }
    });
    return response.data;
  }

  async followTopic(topic) {
    const response = await this.post(`/topics/${encodeURIComponent(topic)}/follow`);
    return response.data;
  }

  async unfollowTopic(topic) {
    const response = await this.delete(`/topics/${encodeURIComponent(topic)}/follow`);
    return response.data;
  }

  async sendImageMessage(userId, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await this.post(`/messages/${userId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 获取公开信息流
  async getPublicFeed(page = 1, limit = 20) {
    const response = await this.get('/posts/public-feed', { params: { page, limit } });
    return response.data;
  }

  // 转发功能
  async repost(postId, comment = '') {
    const response = await this.post(`/posts/${postId}/repost`, { comment });
    return response.data;
  }

  async getReposts(postId, page = 1, limit = 20) {
    const response = await this.get(`/posts/${postId}/reposts`, {
      params: { page, limit }
    });
    return response.data;
  }

  // 搜索相关
  async search(query, type = 'top') {
    const response = await this.get('/search', { params: { q: query, type } });
    return response.data;
  }

  // 用户相关
  async followUser(userId) {
    const response = await this.post(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId) {
    const response = await this.delete(`/users/${userId}/follow`);
    return response.data;
  }

  // 话题相关
  async followTopic(topicId) {
    const response = await this.post(`/topics/${topicId}/follow`);
    return response.data;
  }

  async unfollowTopic(topicId) {
    const response = await this.delete(`/topics/${topicId}/follow`);
    return response.data;
  }

  // 帖子相关
  async createPost(formData) {
    const response = await this.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getPosts(page = 1) {
    const response = await this.get('/posts', { params: { page } });
    return response.data;
  }

  async getPublicFeed(page = 1) {
    const response = await this.get('/posts/public', { params: { page } });
    return response.data;
  }

  async likePost(postId) {
    const response = await this.post(`/posts/${postId}/like`);
    return response.data;
  }

  async createComment(postId, content) {
    const response = await this.post(`/posts/${postId}/comments`, { content });
    return response.data;
  }

  async deletePost(postId) {
    const response = await this.delete(`/posts/${postId}`);
    return response.data;
  }

  // 认证相关
  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData) {
    const response = await this.post('/auth/register', userData);
    return response.data;
  }

  // 文件上传
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await this.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 消息相关接口
  async getConversations() {
    const response = await this.get('/messages/conversations');
    return response.data;
  }

  async getMessages(conversationId) {
    const response = await this.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  }

  async sendMessage(conversationId, content) {
    const response = await this.post(`/messages/conversations/${conversationId}/messages`, {
      content,
    });
    return response.data;
  }

  async createConversation(userId) {
    const response = await this.post('/messages/conversations', {
      participantId: userId,
    });
    return response.data;
  }
}

// 创建并导出单例实例
const apiService = new ApiService();

// 导出 API 实例和服务
export { apiService };
export default apiService;
