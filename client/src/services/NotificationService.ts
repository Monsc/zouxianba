import { api } from '@/lib/api';
import { User } from './FollowService';
import { Post } from './PostService';

export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'mention';
  actor: User;
  target: User | Post;
  createdAt: string;
  readAt?: string;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  hasMore: boolean;
}

export class NotificationService {
  static async getNotifications(
    page: number = 1,
    limit: number = 20
  ): Promise<GetNotificationsResponse> {
    const response = await api.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  }

  static async markAllAsRead(): Promise<void> {
    await api.put('/notifications/read-all');
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`);
  }

  static async getUnreadCount(): Promise<number> {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }

  // WebSocket 连接
  static connectWebSocket(userId: string, onNotification: (notification: Notification) => void) {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?userId=${userId}`);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      onNotification(notification);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
} 