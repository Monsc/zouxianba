import { api } from '@/lib/api';

export class SearchService {
  static async searchUsers(query, page = 1, limit = 20) {
    const response = await api.get('/users/search', {
      params: { query, page, limit },
    });
    return response.data;
  }

  static async searchPosts(query, page = 1, limit = 20) {
    const response = await api.get('/posts/search', {
      params: { query, page, limit },
    });
    return response.data;
  }
}
