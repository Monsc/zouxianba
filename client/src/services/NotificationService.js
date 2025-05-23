import { api } from '@/lib/api';
import { User } from './FollowService';
import { Post } from './PostService';

export class NotificationService {
  static async getNotifications(page = 1, limit = 20) {
    const response = await api.get('/notifications', {
      params: { page, limit },
    });
    return response.data;
  }

  static async markAsRead(notificationId) {
    await api.put(`/notifications/${notificationId}/read`);
  }

  static async markAllAsRead() {
    await api.put('/notifications/read-all');
  }

  static async deleteNotification(notificationId) {
    await api.delete(`/notifications/${notificationId}`);
  }

  static async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.count;
  }

  // WebSocket 连接
  static connectWebSocket(userId, onNotification) {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/notifications?userId=${userId}`);

    ws.onmessage = event => {
      const notification = JSON.parse(event.data);
      onNotification(notification);
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }
}
