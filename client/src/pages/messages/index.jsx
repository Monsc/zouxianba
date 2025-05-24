import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSocket } from '@/hooks/useSocket';

const MessagesPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取私信会话列表
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations);
    } catch (err) {
      setError(err.message || '获取私信列表失败');
      toast.error('获取私信列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // 监听新消息
  useEffect(() => {
    if (socket) {
      socket.on('new_message', message => {
        // 更新会话列表，将收到新消息的会话移到顶部
        setConversations(prev => {
          const index = prev.findIndex(conv => conv._id === message.conversationId);
          if (index === -1) {
            // 如果是新会话，重新获取会话列表
            fetchConversations();
            return prev;
          }
          const updatedConversations = [...prev];
          const conversation = updatedConversations[index];
          updatedConversations.splice(index, 1);
          updatedConversations.unshift({
            ...conversation,
            lastMessage: message,
            unreadCount: conversation.unreadCount + 1,
          });
          return updatedConversations;
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [socket]);

  // 处理会话点击
  const handleConversationClick = conversation => {
    router.push(`/messages/${conversation._id}`);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <EmptyState
            title="请先登录"
            description="登录后查看你的私信"
            action={<Button onClick={() => router.push('/login')}>去登录</Button>}
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
              <h1 className="text-2xl font-bold text-gray-900">私信</h1>
              <Button variant="primary" onClick={() => router.push('/messages/new')}>
                发起私信
              </Button>
            </div>
          </div>
        </div>

        <LoadingOverlay isLoading={loading}>
          {error ? (
            <ErrorState
              title="获取私信列表失败"
              description={error}
              action={<Button onClick={fetchConversations}>重试</Button>}
            />
          ) : conversations.length === 0 ? (
            <EmptyState
              title="暂无私信"
              description="开始和其他用户交流吧"
              action={<Button onClick={() => router.push('/messages/new')}>发起私信</Button>}
            />
          ) : (
            <div className="space-y-2">
              {conversations.map(conversation => {
                const otherUser = conversation.participants.find(p => p._id !== user._id);
                return (
                  <div
                    key={conversation._id}
                    className="bg-white rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* 用户头像 */}
                        <img
                          src={otherUser.avatar}
                          alt={otherUser.username}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {otherUser.username}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">
                              {conversation.lastMessage.content}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
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

export default MessagesPage;
