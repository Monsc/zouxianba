import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';

function NotificationSystem() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // 设置 WebSocket 连接
      const ws = new WebSocket(import.meta.env.VITE_WS_URL);

      ws.onmessage = event => {
        const notification = JSON.parse(event.data);
        handleNewNotification(notification);
      };

      return () => {
        ws.close();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/notifications');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (error) {
      showToast('获取通知失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = notification => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleMarkAsRead = async notificationId => {
    try {
      await apiService.post(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      showToast('通知已标记为已读', 'success');
    } catch (error) {
      showToast('标记通知已读失败', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.post('/notifications/read-all');
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
      showToast('所有通知已标记为已读', 'success');
    } catch (error) {
      showToast('标记所有通知已读失败', 'error');
    }
  };

  const getNotificationIcon = type => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      case 'mention':
        return '📢';
      default:
        return '📌';
    }
  };

  return (
    <div className="relative">
      {/* 通知按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-twitter-gray-100 dark:hover:bg-twitter-gray-800"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-twitter-red text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-twitter-gray-900 rounded-xl shadow-lg border border-twitter-gray-200 dark:border-twitter-gray-800 overflow-hidden"
          >
            {/* 头部 */}
            <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">通知</h2>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-twitter-blue text-sm hover:underline"
                  >
                    全部标为已读
                  </button>
                )}
              </div>
            </div>

            {/* 通知列表 */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-twitter-gray-500">暂无通知</div>
              ) : (
                notifications.map(notification => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800 hover:bg-twitter-gray-50 dark:hover:bg-twitter-gray-800/50 ${
                      !notification.read ? 'bg-twitter-blue/5' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-bold">{notification.sender.username}</span>{' '}
                          {notification.message}
                        </p>
                        <p className="text-xs text-twitter-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* 底部 */}
            <div className="p-4 border-t border-twitter-gray-200 dark:border-twitter-gray-800">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-twitter-blue hover:underline text-sm"
              >
                查看全部
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationSystem;
