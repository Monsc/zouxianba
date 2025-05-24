import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AtSign, Info, UserPlus, Heart, MessageCircle, Trash2, Check } from 'lucide-react';

const tabTypes = [
  { value: 'all', label: '全部', icon: Bell },
  { value: 'mention', label: '提及', icon: AtSign },
  { value: 'system', label: '系统', icon: Info },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // 获取通知列表
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications', {
        params: {
          type: activeTab === 'all' ? undefined : activeTab,
        },
      });
      setNotifications(response.data.notifications);
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
    // eslint-disable-next-line
  }, [user, activeTab]);

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

  // 删除通知
  const deleteNotification = async notificationId => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      toast.success('通知已删除');
    } catch (err) {
      toast.error('删除失败，请重试');
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
    // 跳转逻辑
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

  // 渲染通知内容和图标
  const renderNotification = notification => {
    let icon = <Bell className="w-5 h-5 text-primary" />;
    let content = null;
    if (notification.type === 'follow') {
      icon = <UserPlus className="w-5 h-5 text-primary" />;
      content = <><span className="font-bold">{notification.sender.username}</span> 关注了你</>;
    } else if (notification.type === 'like') {
      icon = <Heart className="w-5 h-5 text-rose-500" />;
      content = <><span className="font-bold">{notification.sender.username}</span> 赞了你的帖子</>;
    } else if (notification.type === 'comment') {
      icon = <MessageCircle className="w-5 h-5 text-blue-500" />;
      content = <><span className="font-bold">{notification.sender.username}</span> 评论了你的帖子：<span className="text-muted-foreground">{notification.comment.content}</span></>;
    } else if (notification.type === 'mention') {
      icon = <AtSign className="w-5 h-5 text-violet-500" />;
      content = <><span className="font-bold">{notification.sender.username}</span> 在评论中提到了你：<span className="text-muted-foreground">{notification.comment.content}</span></>;
    } else if (notification.type === 'system') {
      icon = <Info className="w-5 h-5 text-gray-500" />;
      content = <span>{notification.content}</span>;
    }
    return { icon, content };
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16">
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
      <div className="max-w-2xl mx-auto py-8">
        {/* 顶部 Tabs 和操作栏 */}
        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full">
              {tabTypes.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.value === 'all' && unreadCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="ml-4">
            <Check className="w-4 h-4 mr-1" /> 全部已读
          </Button>
        </div>
        <LoadingOverlay isLoading={loading}>
          {notifications.length === 0 ? (
            <EmptyState title="暂无通知" description="你还没有收到任何通知" />
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => {
                const { icon, content } = renderNotification(notification);
                return (
                  <div
                    key={notification._id}
                    className={`flex items-start gap-3 p-4 rounded-xl shadow-sm bg-white dark:bg-accent/30 transition-colors cursor-pointer hover:bg-accent/50 relative ${!notification.read ? 'border-l-4 border-primary' : 'opacity-70'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex-shrink-0 mt-1">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base">{content}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: zhCN })}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end ml-2">
                      {!notification.read && (
                        <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); markAsRead(notification._id); }} title="标记为已读">
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); deleteNotification(notification._id); }} title="删除">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </LoadingOverlay>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
