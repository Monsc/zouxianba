import { api } from '@/lib/api';
import { User } from './FollowService';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  readAt?: string;
  sender: User;
  receiver: User;
}

export interface Conversation {
  id: string;
  lastMessage: Message;
  unreadCount: number;
  user: User;
}

export interface GetMessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export class MessageService {
  static async getConversations(
    page: number = 1,
    limit: number = 20
  ): Promise<{ conversations: Conversation[]; hasMore: boolean }> {
    const response = await api.get('/messages/conversations', {
      params: { page, limit },
    });
    return response.data;
  }

  static async getMessages(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<GetMessagesResponse> {
    const response = await api.get(`/messages/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  static async sendMessage(
    receiverId: string,
    content: string
  ): Promise<Message> {
    const response = await api.post('/messages', {
      receiverId,
      content,
    });
    return response.data;
  }

  static async markAsRead(userId: string): Promise<void> {
    await api.put(`/messages/${userId}/read`);
  }

  static async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`);
  }

  static async deleteConversation(userId: string): Promise<void> {
    await api.delete(`/messages/conversations/${userId}`);
  }
} 