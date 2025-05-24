import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import MainLayout from '../components/layout/MainLayout';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await apiService.getNotifications();
        setNotifications(res || []);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'mention':
        return (
          <div className="flex items-start space-x-3">
            <img src={notification.sender.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <p>
                <Link to={`/user/${notification.sender.username}`} className="font-semibold hover:underline">
                  {notification.sender.name || notification.sender.username}
                </Link>
                在动态中提到了你
              </p>
              <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
            </div>
          </div>
        );
      case 'like':
        return (
          <div className="flex items-start space-x-3">
            <img src={notification.sender.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <p>
                <Link to={`/user/${notification.sender.username}`} className="font-semibold hover:underline">
                  {notification.sender.name || notification.sender.username}
                </Link>
                赞了你的动态
              </p>
              <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
            </div>
          </div>
        );
      case 'comment':
        return (
          <div className="flex items-start space-x-3">
            <img src={notification.sender.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <p>
                <Link to={`/user/${notification.sender.username}`} className="font-semibold hover:underline">
                  {notification.sender.name || notification.sender.username}
                </Link>
                评论了你的动态
              </p>
              <p className="text-sm text-gray-500 mt-1">{notification.content}</p>
            </div>
          </div>
        );
      case 'follow':
        return (
          <div className="flex items-start space-x-3">
            <img src={notification.sender.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full" />
            <div>
              <p>
                <Link to={`/user/${notification.sender.username}`} className="font-semibold hover:underline">
                  {notification.sender.name || notification.sender.username}
                </Link>
                关注了你
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">通知</h2>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
          {loading ? (
            <div className="p-4 text-center">加载中...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">暂无通知</div>
          ) : (
            notifications.map(notification => (
              <div key={notification._id} className="p-4 border-b last:border-b-0">
                {renderNotificationContent(notification)}
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications; 