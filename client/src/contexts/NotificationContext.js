import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // 连接 WebSocket
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      // 认证
      newSocket.emit('authenticate', token);

      // 监听通知
      newSocket.on('post_liked', handlePostLiked);
      newSocket.on('post_commented', handlePostCommented);
      newSocket.on('user_followed', handleUserFollowed);
      newSocket.on('new_message', handleNewMessage);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  // 处理点赞通知
  const handlePostLiked = data => {
    const newNotification = {
      type: 'like',
      sender: data.userId,
      post: data.postId,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // 处理评论通知
  const handlePostCommented = data => {
    const newNotification = {
      type: 'comment',
      sender: data.userId,
      post: data.postId,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // 处理关注通知
  const handleUserFollowed = data => {
    const newNotification = {
      type: 'follow',
      sender: data.followerId,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // 处理新消息通知
  const handleNewMessage = data => {
    const newNotification = {
      type: 'message',
      sender: data.senderId,
      message: data.message,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // 删除通知
  const deleteNotification = async id => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(prev => prev.filter(notification => notification._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    deleteNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
