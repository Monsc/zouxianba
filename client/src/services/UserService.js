import { api } from '@/lib/api';
import { User } from './FollowService';

export class UserService {
  static async getProfile(userId) {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  }

  static async updateProfile(data) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  static async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getUserPosts(userId, page = 1, limit = 10) {
    const response = await api.get(`/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async searchUsers(query, page = 1, limit = 20) {
    const response = await api.get('/users/search', {
      params: { query, page, limit },
    });
    return response.data;
  }
}
