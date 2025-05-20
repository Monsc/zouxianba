import { api } from '@/lib/api';

export interface User {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface GetUsersResponse {
  users: User[];
  hasMore: boolean;
}

export class FollowService {
  static async getFollowers(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetUsersResponse> {
    const response = await api.get(`/users/${userId}/followers`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async getFollowing(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetUsersResponse> {
    const response = await api.get(`/users/${userId}/following`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async followUser(userId: string): Promise<void> {
    await api.post(`/users/${userId}/follow`);
  }

  static async unfollowUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}/follow`);
  }

  static async checkFollowStatus(userId: string): Promise<boolean> {
    const response = await api.get(`/users/${userId}/follow-status`);
    return response.data.isFollowing;
  }
} 