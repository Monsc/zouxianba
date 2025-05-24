import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, UserPlus, AtSign, Bell, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export const NotificationItem = ({ notification, onDelete, onMarkAsRead }) => {
  const getNotificationIcon = type => {
    switch (type) {
      case 'like':
        return Heart;
      case 'comment':
        return MessageCircle;
      case 'follow':
        return UserPlus;
      case 'mention':
        return AtSign;
      case 'system':
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = type => {
    switch (type) {
      case 'like':
        return 'text-red-500 bg-red-500/10';
      case 'comment':
        return 'text-blue-500 bg-blue-500/10';
      case 'follow':
        return 'text-green-500 bg-green-500/10';
      case 'mention':
        return 'text-purple-500 bg-purple-500/10';
      case 'system':
        return 'text-muted-foreground bg-accent';
      default:
        return 'text-muted-foreground bg-accent';
    }
  };

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
  const Icon = getNotificationIcon(notification.type);

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 transition-colors hover:bg-accent/50',
        !notification.isRead && 'bg-accent/30'
      )}
    >
      <div className="flex-shrink-0">
        {notification.data.avatar ? (
          <Avatar src={notification.data.avatar} alt={notification.data.username || ''} size="md" />
        ) : (
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              getNotificationColor(notification.type)
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="text-[15px]">
            {notification.content}
            {link && (
              <Link
                to={link}
                className="ml-1 text-primary hover:underline"
              >
                查看详情
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMarkAsRead(notification.id)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(notification.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: zhCN,
          })}
        </p>
      </div>
    </div>
  );
};
