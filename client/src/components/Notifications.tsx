import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id ? { ...n, read: true } : n))
        );
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // 根据通知类型导航到相应页面
    if (notification.post) {
      navigate(`/post/${notification.post._id}`);
    } else if (notification.actor) {
      navigate(`/profile/${notification.actor._id}`);
    }
  };

  if (isLoading) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="notifications-page">
      <h1 className="page-title">通知</h1>
      {notifications.length === 0 ? (
        <div className="no-notifications">暂无通知</div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <img
                    src={notification.actor.avatar || '/default-avatar.png'}
                    alt={notification.actor.username}
                    className="actor-avatar"
                  />
                  <div className="notification-text">
                    <span className="actor-name">{notification.actor.username}</span>{' '}
                    {notification.type === 'like' && '赞了你的帖子'}
                    {notification.type === 'comment' && '评论了你的帖子'}
                    {notification.type === 'follow' && '关注了你'}
                    {notification.type === 'mention' && '在帖子中提到了你'}
                  </div>
                </div>
                {notification.post && (
                  <div className="post-preview">{notification.post.content}</div>
                )}
                <div className="notification-time">
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
  );
}

export default Notifications;
