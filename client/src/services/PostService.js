import { api } from '@/lib/api';

export class PostService {
  static async getPosts(page = 1, limit = 10) {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  }

  static async getPost(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  }

  static async createPost(data) {
    const response = await api.post('/posts', data);
    return response.data;
  }

  static async updatePost(id, data) {
    const response = await api.put(`/posts/${id}`, data);
    return response.data;
  }

  static async deletePost(id) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  }

  static async likePost(id) {
    const response = await api.post(`/posts/${id}/like`);
    return response.data;
  }

  static async unlikePost(id) {
    const response = await api.delete(`/posts/${id}/like`);
    return response.data;
  }

  static async comment(id, content) {
    const response = await api.post(`/posts/${id}/comments`, { content });
    return response.data;
  }

  static async getComments(id, page = 1, limit = 10) {
    const response = await api.get(`/posts/${id}/comments?page=${page}&limit=${limit}`);
    return response.data;
  }
}
