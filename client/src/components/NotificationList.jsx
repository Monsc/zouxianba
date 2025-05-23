'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { NotificationService } from '@/services/NotificationService';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from './ui/toaster';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export const NotificationList = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 使用无限滚动加载更多通知
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await NotificationService.getNotifications(page);
        return response.notifications;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: notifications,
    setData: setNotifications,
  });

  // 加载通知
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await NotificationService.getNotifications();
        setNotifications(response.notifications);
      } catch (error) {
        console.error('Fetch notifications failed:', error);
        showToast('加载通知失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // 标记通知为已读
  const handleMarkAsRead = async notificationId => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Mark as read failed:', error);
      showToast('操作失败', 'error');
    }
  };

  // 处理通知点击
  const handleNotificationClick = async notification => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }

    // 根据通知类型跳转到相应页面
    switch (notification.type) {
      case 'like':
      case 'comment':
        router.push(`/post/${notification.postId}`);
        break;
      case 'follow':
        router.push(`/user/${notification.fromUser.id}`);
        break;
      case 'mention':
        router.push(`/post/${notification.postId}`);
        break;
      default:
        break;
    }
  };

  // 获取通知图标
  const getNotificationIcon = type => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'comment';
      case 'follow':
        return 'users';
      case 'mention':
        return 'at';
      default:
        return 'bell';
    }
  };

  // 获取通知文本
  const getNotificationText = notification => {
    switch (notification.type) {
      case 'like':
        return '赞了你的帖子';
      case 'comment':
        return '评论了你的帖子';
      case 'follow':
        return '关注了你';
      case 'mention':
        return '在评论中提到了你';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Toaster title="暂无通知" description="当有人与你互动时，你会在这里收到通知" icon="bell" />
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={cn(
            'bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden cursor-pointer transition-colors',
            !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
          )}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar
                src={notification.fromUser.avatar}
                alt={notification.fromUser.username}
                size="md"
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  router.push(`/user/${notification.fromUser.id}`);
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/user/${notification.fromUser.id}`);
                      }}
                    >
                      {notification.fromUser.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getNotificationText(notification)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon
                      name={getNotificationIcon(notification.type)}
                      className={cn(
                        'w-5 h-5',
                        notification.type === 'like' ? 'text-red-500' : 'text-gray-400'
                      )}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                </div>

                {notification.type === 'comment' && notification.comment && (
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {notification.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {loadingMore ? <LoadingSpinner size="sm" /> : '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
};
