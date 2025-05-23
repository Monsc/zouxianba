import { apiService } from './api';

export const notificationService = {
  async getUnreadCount() {
    try {
      const response = await apiService.get('/notifications/unread/count');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch unread notifications count:', error);
      return { count: 0 };
    }
  },

  async getNotifications(page = 1) {
    try {
      const response = await apiService.get(`/notifications?page=${page}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return { notifications: [], hasMore: false };
    }
  },

  async markAsRead(notificationId) {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  },

  async markAllAsRead() {
    try {
      await apiService.put('/notifications/read/all');
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      return false;
    }
  },

  async deleteNotification(notificationId) {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      return false;
    }
  },
};
