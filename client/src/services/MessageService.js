import { api } from '@/lib/api';
import { User } from './FollowService';

export class MessageService {
  static async getConversations(page = 1, limit = 20) {
    const response = await api.get('/messages/conversations', {
      params: { page, limit },
    });
    return response.data;
  }

  static async getMessages(userId, page = 1, limit = 20) {
    const response = await api.get(`/messages/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async sendMessage(receiverId, content) {
    const response = await api.post('/messages', {
      receiverId,
      content,
    });
    return response.data;
  }

  static async markAsRead(userId) {
    await api.put(`/messages/${userId}/read`);
  }

  static async deleteMessage(messageId) {
    await api.delete(`/messages/${messageId}`);
  }

  static async deleteConversation(userId) {
    await api.delete(`/messages/conversations/${userId}`);
  }
} 