import { api } from '@/lib/api';

export class FollowService {
  static async getFollowers(userId, page = 1, limit = 20) {
    const response = await api.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async getFollowing(userId, page = 1, limit = 20) {
    const response = await api.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async followUser(userId) {
    await api.post(`/users/${userId}/follow`);
  }

  static async unfollowUser(userId) {
    await api.delete(`/users/${userId}/follow`);
  }

  static async checkFollowStatus(userId) {
    const response = await api.get(`/users/${userId}/follow-status`);
    return response.data.isFollowing;
  }
}
