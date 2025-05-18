import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        navigate(`/post/${notification.post}`);
        break;
      case 'follow':
        navigate(`/profile/${notification.sender}`);
        break;
      case 'message':
        navigate(`/messages/${notification.sender}`);
        break;
      default:
        break;
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      case 'message':
        return '✉️';
      default:
        return '🔔';
    }
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'like':
        return '赞了你的帖子';
      case 'comment':
        return '评论了你的帖子';
      case 'follow':
        return '关注了你';
      case 'message':
        return '给你发了一条消息';
      default:
        return '通知';
    }
  };

  return (
    <div className="notifications-container">
      <button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>通知</h3>
            {unreadCount > 0 && (
              <button
                className="mark-read-button"
                onClick={markAllAsRead}
              >
                全部标为已读
              </button>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                暂无通知
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-text">
                      {getNotificationText(notification)}
                    </div>
                    <div className="notification-time">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </div>
                  </div>
                  <button
                    className="delete-notification"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 