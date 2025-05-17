import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useNotifications } from '../contexts/NotificationContext';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention';
  actor: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  post?: {
    id: string;
    content: string;
  };
  createdAt: Date;
  isRead: boolean;
}

export const Notifications = () => {
  const { markAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch notifications from API
    // This is mock data for now
    setNotifications([
      {
        id: '1',
        type: 'like',
        actor: {
          id: '1',
          username: 'John Doe',
          handle: 'johndoe',
          avatar: 'https://via.placeholder.com/150',
        },
        post: {
          id: '1',
          content: 'Just launched my new project! 🚀',
        },
        createdAt: new Date(),
        isRead: false,
      },
      {
        id: '2',
        type: 'follow',
        actor: {
          id: '2',
          username: 'Jane Smith',
          handle: 'janesmith',
          avatar: 'https://via.placeholder.com/150',
        },
        createdAt: new Date(Date.now() - 3600000),
        isRead: true,
      },
    ]);
    setIsLoading(false);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'mention':
        return 'mentioned you in a post';
      default:
        return '';
    }
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        <h1 style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
          Notifications
        </h1>

        {isLoading ? (
          <div className="container">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="container" style={{ textAlign: 'center', padding: '32px' }}>
            No notifications yet
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className="notification-item"
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: notification.isRead ? 'inherit' : 'var(--hover-color)',
                  cursor: 'pointer',
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <img
                    src={notification.actor.avatar}
                    alt={notification.actor.username}
                    style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div>
                      <Link
                        to={`/profile/${notification.actor.id}`}
                        style={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        <strong>{notification.actor.username}</strong>
                      </Link>{' '}
                      {getNotificationText(notification)}
                    </div>
                    {notification.post && (
                      <div style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {notification.post.content}
                      </div>
                    )}
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9em', marginTop: '4px' }}>
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}; 