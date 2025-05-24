'use client';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { cn } from '../lib/utils';
import { Bell, Heart, MessageSquare, UserPlus, Hash } from 'lucide-react';

const NotificationTypes = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  MENTION: 'mention',
  TOPIC: 'topic',
};

const NotificationIcon = ({ type }) => {
  switch (type) {
    case NotificationTypes.LIKE:
      return <Heart className="w-5 h-5 text-red-500" />;
    case NotificationTypes.COMMENT:
      return <MessageSquare className="w-5 h-5 text-blue-500" />;
    case NotificationTypes.FOLLOW:
      return <UserPlus className="w-5 h-5 text-green-500" />;
    case NotificationTypes.MENTION:
      return <MessageSquare className="w-5 h-5 text-purple-500" />;
    case NotificationTypes.TOPIC:
      return <Hash className="w-5 h-5 text-orange-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

export const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
    } catch (error) {
      showToast('获取通知失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationContent = (notification) => {
    switch (notification.type) {
      case NotificationTypes.LIKE:
        return `${notification.sender.username} 赞了你的帖子`;
      case NotificationTypes.COMMENT:
        return `${notification.sender.username} 评论了你的帖子`;
      case NotificationTypes.FOLLOW:
        return `${notification.sender.username} 关注了你`;
      case NotificationTypes.MENTION:
        return `${notification.sender.username} 在帖子中提到了你`;
      case NotificationTypes.TOPIC:
        return `你关注的话题 #${notification.topic} 有新帖子`;
      default:
        return notification.content;
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.type) {
      case NotificationTypes.LIKE:
      case NotificationTypes.COMMENT:
      case NotificationTypes.MENTION:
        return `/post/${notification.postId}`;
      case NotificationTypes.FOLLOW:
        return `/profile/${notification.sender.username}`;
      case NotificationTypes.TOPIC:
        return `/topic/${notification.topic}`;
      default:
        return '#';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无通知
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-800">
      {notifications.map((notification) => (
        <Link
          key={notification._id}
          to={getNotificationLink(notification)}
          className={cn(
            'block mb-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-4 transition-shadow hover:shadow-md hover:bg-blue-50/60 dark:hover:bg-blue-900/20',
            !notification.read && 'ring-2 ring-blue-400/40'
          )}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <NotificationIcon type={notification.type} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] text-gray-900 dark:text-white font-medium">
                {getNotificationContent(notification)}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
