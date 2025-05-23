import { api } from '@/lib/api';

export const LikeService = {
  async like(postId) {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  async unlike(postId) {
    const response = await api.delete(`/posts/${postId}/like`);
    return response.data;
  },

  async isLiked(postId) {
    const response = await api.get(`/posts/${postId}/like`);
    return response.data;
  },
};
