import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import Avatar from './ui/Avatar';
import Card from './ui/Card';

const NotificationItem = ({ notification, onRead }) => {
  const getIcon = type => {
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
        return '🔔';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={() => onRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <Avatar
          src={notification.sender.avatar}
          username={notification.sender.username}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold">{notification.sender.username}</span>
            <span className="text-gray-500">{getIcon(notification.type)}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{notification.message}</p>
          <span className="text-sm text-gray-500">
            {new Date(notification.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async id => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // 设置 WebSocket 连接
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.onmessage = event => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <Card className="max-w-lg mx-auto">
      <Card.Header>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">通知</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-sm bg-twitter-blue text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </Card.Header>
      <Card.Body>
        <AnimatePresence>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-twitter-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">暂无通知</div>
          )}
        </AnimatePresence>
      </Card.Body>
    </Card>
  );
};

export default NotificationCenter;
