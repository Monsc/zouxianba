import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import { Loader2, Bell, Heart, MessageSquare, UserPlus, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const NotificationItem = ({ notification, onRead }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'share':
        return <Share2 className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMessage = () => {
    switch (notification.type) {
      case 'like':
        return `${notification.sender.username} 赞了你的动态`;
      case 'comment':
        return `${notification.sender.username} 评论了你的动态`;
      case 'follow':
        return `${notification.sender.username} 关注了你`;
      case 'share':
        return `${notification.sender.username} 分享了你的动态`;
      default:
        return notification.message;
    }
  };

  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
      onClick={() => onRead(notification._id)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 dark:text-gray-100">{getMessage()}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export const Notifications = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('加载通知失败，请稍后重试');
      showToast('加载通知失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async notificationId => {
    try {
      await apiService.patch(`/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showToast('标记已读失败，请稍后重试', 'error');
    }
  };

  const handleReadAll = async () => {
    try {
      await apiService.patch('/notifications/read-all');
      setNotifications(
        notifications.map(notification => ({
          ...notification,
          read: true,
        }))
      );
      showToast('已全部标记为已读', 'success');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showToast('标记已读失败，请稍后重试', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchNotifications} className="text-blue-500 hover:text-blue-600">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-xl font-bold">通知</h2>
        {notifications.some(n => !n.read) && (
          <button onClick={handleReadAll} className="text-sm text-blue-500 hover:text-blue-600">
            全部标记为已读
          </button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {notifications.map(notification => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onRead={handleRead}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">暂无通知</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
