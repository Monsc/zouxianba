import { api } from '@/lib/api';

export class CommentService {
  static async getComments(postId, page = 1, limit = 10) {
    const response = await api.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async createComment(data) {
    const response = await api.post('/comments', data);
    return response.data;
  }

  static async deleteComment(commentId) {
    await api.delete(`/comments/${commentId}`);
  }

  static async likeComment(commentId) {
    await api.post(`/comments/${commentId}/like`);
  }

  static async unlikeComment(commentId) {
    await api.delete(`/comments/${commentId}/like`);
  }
}
