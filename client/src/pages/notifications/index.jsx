import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Pagination from '@/components/common/Pagination';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);

  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications', {
        params: {
          page: currentPage,
          limit: 20,
        },
      });
      setNotifications(response.data.notifications);
      setTotalPages(response.data.totalPages);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      setError(err.message || '获取通知失败');
      toast.error('获取通知失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, currentPage]);

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
      toast.error('操作失败，请重试');
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(
        notifications.map(notification => ({
          ...notification,
          read: true,
        }))
      );
      setUnreadCount(0);
      toast.success('已全部标记为已读');
    } catch (err) {
      toast.error('操作失败，请重试');
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
        navigate(`/user/${notification.sender.username}`);
        break;
      case 'like':
      case 'comment':
        navigate(`/post/${notification.post._id}`);
        break;
      case 'mention':
        navigate(`/post/${notification.post._id}#comment-${notification.comment._id}`);
        break;
      default:
        break;
    }
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

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="请先登录"
            description="登录后查看你的通知"
            action={<Button onClick={() => navigate('/login')}>去登录</Button>}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 标题和操作栏 */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                通知中心
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-sm bg-red-100 text-red-600 rounded-full">
                    {unreadCount} 条未读
                  </span>
                )}
              </h1>
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  全部标记为已读
                </Button>
              )}
            </div>
          </div>
        </div>

        <LoadingOverlay isLoading={loading}>
          {error ? (
            <ErrorState
              title="获取通知失败"
              description={error}
              action={<Button onClick={fetchNotifications}>重试</Button>}
            />
          ) : notifications.length === 0 ? (
            <EmptyState
              title="暂无通知"
              description="当有人关注你、点赞或评论你的帖子时，你会收到通知"
            />
          ) : (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow-sm cursor-pointer transition-colors ${
                    notification.read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">{renderNotificationContent(notification)}</div>
                      <div className="ml-4 text-sm text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </LoadingOverlay>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
