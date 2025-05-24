import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import ErrorState from '@/components/common/ErrorState';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useSocket } from '@/hooks/useSocket';

const ConversationPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [conversation, setConversation] = useState(null);
  const messagesEndRef = useRef(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 获取会话信息
  const fetchConversation = async () => {
    try {
      const response = await api.get(`/messages/conversations/${id}`);
      setConversation(response.data.conversation);
    } catch (err) {
      toast.error('获取会话信息失败');
    }
  };

  // 获取历史消息
  const fetchMessages = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/messages/conversations/${id}/messages`, {
        params: {
          page: pageNum,
          limit: 20,
        },
      });
      if (pageNum === 1) {
        setMessages(response.data.messages);
      } else {
        setMessages(prev => [...response.data.messages, ...prev]);
      }
      setHasMore(response.data.messages.length === 20);
    } catch (err) {
      setError(err.message || '获取消息失败');
      toast.error('获取消息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && user) {
      fetchConversation();
      fetchMessages();
    }
  }, [id, user]);

  // 监听新消息
  useEffect(() => {
    if (socket && id) {
      socket.on('new_message', message => {
        if (message.conversationId === id) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });

      // 标记消息为已读
      socket.emit('mark_messages_read', { conversationId: id });
    }

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [socket, id]);

  // 发送消息
  const handleSubmit = async e => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSending(true);
      await api.post(`/messages/conversations/${id}/messages`, {
        content: content.trim(),
      });
      setContent('');
      scrollToBottom();
    } catch (err) {
      toast.error('发送失败，请重试');
    } finally {
      setSending(false);
    }
  };

  // 加载更多历史消息
  const loadMore = () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage);
  };

  // 撤回消息
  const handleRecall = async messageId => {
    try {
      await api.delete(`/messages/${messageId}`);
      setMessages(
        messages.map(message =>
          message._id === messageId ? { ...message, recalled: true } : message
        )
      );
      toast.success('消息已撤回');
    } catch (err) {
      toast.error('撤回失败，请重试');
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">请先登录</h2>
            <p className="text-gray-600 mb-4">登录后可以查看和发送私信</p>
            <Button onClick={() => router.push('/login')}>去登录</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!conversation) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <LoadingOverlay isLoading={true} />
        </div>
      </MainLayout>
    );
  }

  const otherUser = conversation.participants.find(p => p._id !== user._id);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm h-[calc(100vh-12rem)] flex flex-col">
          {/* 会话头部 */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-4">
              <img
                src={otherUser.avatar}
                alt={otherUser.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="text-lg font-medium text-gray-900">{otherUser.username}</h2>
                <p className="text-sm text-gray-500">{otherUser.online ? '在线' : '离线'}</p>
              </div>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4">
            <LoadingOverlay isLoading={loading}>
              {error ? (
                <ErrorState
                  title="获取消息失败"
                  description={error}
                  action={<Button onClick={() => fetchMessages(1)}>重试</Button>}
                />
              ) : (
                <div className="space-y-4">
                  {hasMore && (
                    <div className="text-center">
                      <Button variant="secondary" size="sm" onClick={loadMore} disabled={loading}>
                        {loading ? '加载中...' : '加载更多'}
                      </Button>
                    </div>
                  )}
                  {messages.map(message => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender._id === user._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.sender._id === user._id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.recalled ? (
                          <p className="text-sm italic text-gray-500">此消息已撤回</p>
                        ) : (
                          <>
                            <p className="text-sm">{message.content}</p>
                            <div className="mt-1 flex items-center justify-end space-x-2">
                              <span className="text-xs opacity-75">
                                {formatDistanceToNow(new Date(message.createdAt), {
                                  addSuffix: true,
                                  locale: zhCN,
                                })}
                              </span>
                              {message.sender._id === user._id && !message.recalled && (
                                <button
                                  onClick={() => handleRecall(message._id)}
                                  className="text-xs opacity-75 hover:opacity-100"
                                >
                                  撤回
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </LoadingOverlay>
          </div>

          {/* 消息输入框 */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex space-x-4">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending ? '发送中...' : '发送'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ConversationPage;
