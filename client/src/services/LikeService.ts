import { api } from './api';

export const LikeService = {
  async like(postId: string) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  async unlike(postId: string) {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },

  async isLiked(postId: string) {
    const response = await api.get(`/posts/${postId}/like`);
    return response.data;
  },
}; 