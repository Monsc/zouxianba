import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Icon } from './Icon';
import { Notification } from '@/services/NotificationService';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return 'heart-filled';
    case 'comment':
      return 'message';
    case 'follow':
      return 'user-plus';
    case 'mention':
      return 'at';
    case 'system':
      return 'bell';
    default:
      return 'bell';
  }
};

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return 'text-red-500';
    case 'comment':
      return 'text-blue-500';
    case 'follow':
      return 'text-green-500';
    case 'mention':
      return 'text-purple-500';
    case 'system':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  onMarkAsRead,
}) => {
  const getNotificationLink = () => {
    if (notification.data.postId) {
      return `/posts/${notification.data.postId}`;
    }
    if (notification.data.userId) {
      return `/users/${notification.data.userId}`;
    }
    return null;
  };

  const link = getNotificationLink();

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 transition-colors',
        !notification.isRead && 'bg-blue-50 dark:bg-blue-900/20'
      )}
    >
      <div className="flex-shrink-0">
        {notification.data.avatar ? (
          <Avatar
            src={notification.data.avatar}
            alt={notification.data.username || ''}
            size="sm"
          />
        ) : (
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              getNotificationColor(notification.type)
            )}
          >
            <Icon name={getNotificationIcon(notification.type)} className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-900 dark:text-gray-100">
            {notification.content}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMarkAsRead(notification.id)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Icon name="check" className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <Icon name="trash" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: zhCN,
          })}
        </p>
      </div>
    </div>
  );
}; 