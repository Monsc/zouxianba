import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: 'like' | 'comment' | 'follow' | 'mention';
    sender: {
      _id: string;
      nickname: string;
      avatar: string;
    };
    post?: {
      _id: string;
      content: string;
    };
    comment?: {
      _id: string;
      content: string;
    };
    read: boolean;
    createdAt: string;
  };
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead
}) => {
  const getNotificationText = () => {
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

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      case 'mention':
        return '📢';
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
  };

  return (
    <div
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={handleClick}
    >
      <div className="notification-type-icon">
        {getNotificationIcon()}
      </div>
      <Link to={`/profile/${notification.sender._id}`} className="avatar-link">
        <img
          src={notification.sender.avatar || '/default-avatar.png'}
          alt={notification.sender.nickname}
          className="avatar"
        />
      </Link>
      <div className="notification-content">
        <div className="notification-header">
          <Link to={`/profile/${notification.sender._id}`} className="nickname">
            {notification.sender.nickname}
          </Link>
          <span className="action">{getNotificationText()}</span>
        </div>
        {(notification.post || notification.comment) && (
          <div className="notification-preview">
            {notification.post && (
              <Link to={`/post/${notification.post._id}`}>
                {notification.post.content}
              </Link>
            )}
            {notification.comment && (
              <Link to={`/post/${notification.post?._id}#comment-${notification.comment._id}`}>
                {notification.comment.content}
              </Link>
            )}
          </div>
        )}
        <div className="notification-time">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: zhCN
          })}
        </div>
        <div className="notification-actions">
          {notification.type === 'follow' && (
            <button className="notification-action-button">
              关注
            </button>
          )}
          {notification.type === 'comment' && (
            <button className="notification-action-button">
              回复
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 