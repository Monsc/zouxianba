import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSocket } from '@/hooks/useSocket';

const NotificationDropdown = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // 获取最近的通知
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications', {
        params: {
          page: 1,
          limit: 5,
        },
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      toast.error('获取通知失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentNotifications();
    }
  }, [user]);

  // 监听新通知
  useEffect(() => {
    if (socket) {
      socket.on('notification', notification => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 标记通知为已读
  const markAsRead = async notificationId => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(
        notifications.map(notification =>
          notification._id === notificationId ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('操作失败');
    }
  };

  // 处理通知点击
  const handleNotificationClick = notification => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    // 根据通知类型跳转到相应页面
    switch (notification.type) {
      case 'follow':
        router.push(`/user/${notification.sender.username}`);
        break;
      case 'like':
      case 'comment':
        router.push(`/post/${notification.post._id}`);
        break;
      case 'mention':
        router.push(`/post/${notification.post._id}#comment-${notification.comment._id}`);
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  // 渲染通知内容
  const renderNotificationContent = notification => {
    switch (notification.type) {
      case 'follow':
        return (
          <div className="flex items-center space-x-2">
            <img
              src={notification.sender.avatar}
              alt={notification.sender.username}
              className="w-8 h-8 rounded-full"
            />
            <span>
              <span className="font-medium">{notification.sender.username}</span>
              {' 关注了你'}
            </span>
          </div>
        );
      case 'like':
        return (
          <div className="flex items-center space-x-2">
            <img
              src={notification.sender.avatar}
              alt={notification.sender.username}
              className="w-8 h-8 rounded-full"
            />
            <span>
              <span className="font-medium">{notification.sender.username}</span>
              {' 赞了你的帖子'}
            </span>
          </div>
        );
      case 'comment':
        return (
          <div className="flex items-center space-x-2">
            <img
              src={notification.sender.avatar}
              alt={notification.sender.username}
              className="w-8 h-8 rounded-full"
            />
            <span>
              <span className="font-medium">{notification.sender.username}</span>
              {' 评论了你的帖子：'}
              <span className="text-gray-600">{notification.comment.content}</span>
            </span>
          </div>
        );
      case 'mention':
        return (
          <div className="flex items-center space-x-2">
            <img
              src={notification.sender.avatar}
              alt={notification.sender.username}
              className="w-8 h-8 rounded-full"
            />
            <span>
              <span className="font-medium">{notification.sender.username}</span>
              {' 在评论中提到了你：'}
              <span className="text-gray-600">{notification.comment.content}</span>
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 通知图标 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">通知</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    api.put('/notifications/read-all');
                    setNotifications(
                      notifications.map(notification => ({
                        ...notification,
                        read: true,
                      }))
                    );
                    setUnreadCount(0);
                  }}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  全部标记为已读
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">加载中...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">暂无通知</div>
            ) : (
              <div className="divide-y">
                {notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`p-4 cursor-pointer transition-colors ${
                      notification.read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {renderNotificationContent(notification)}
                      </div>
                      <div className="ml-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={() => {
                router.push('/notifications');
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-primary hover:text-primary-dark"
            >
              查看全部通知
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
