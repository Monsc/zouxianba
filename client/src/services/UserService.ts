import { api } from '@/lib/api';
import { User } from './FollowService';

export interface UserProfile extends User {
  postsCount: number;
  createdAt: string;
  location?: string;
  website?: string;
  socialLinks?: {
    weibo?: string;
    twitter?: string;
    github?: string;
  };
}

export interface UpdateProfileDto {
  username?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    weibo?: string;
    twitter?: string;
    github?: string;
  };
}

export interface GetUserPostsResponse {
  posts: any[];
  hasMore: boolean;
}

export class UserService {
  static async getProfile(userId: string): Promise<UserProfile> {
    const response = await api.get(`/users/${userId}/profile`);
    return response.data;
  }

  static async updateProfile(data: UpdateProfileDto): Promise<UserProfile> {
    const response = await api.put('/users/profile', data);
    return response.data;
  }

  static async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<GetUserPostsResponse> {
    const response = await api.get(`/users/${userId}/posts`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; hasMore: boolean }> {
    const response = await api.get('/users/search', {
      params: { query, page, limit },
    });
    return response.data;
  }
} 