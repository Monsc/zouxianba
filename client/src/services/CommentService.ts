import { api } from '@/lib/api';

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  replies: number;
  isLiked: boolean;
  parentId?: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

export interface GetCommentsResponse {
  comments: Comment[];
  hasMore: boolean;
}

export class CommentService {
  static async getComments(
    postId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<GetCommentsResponse> {
    const response = await api.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async createComment(data: CreateCommentDto): Promise<Comment> {
    const response = await api.post('/comments', data);
    return response.data;
  }

  static async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  }

  static async likeComment(commentId: string): Promise<void> {
    await api.post(`/comments/${commentId}/like`);
  }

  static async unlikeComment(commentId: string): Promise<void> {
    await api.delete(`/comments/${commentId}/like`);
  }
} 