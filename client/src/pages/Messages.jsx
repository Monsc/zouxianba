import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { Plus, Mail, User, MoreHorizontal } from 'lucide-react';

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (err) {
      setError('加载会话列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div className="loading-spinner" />;
  if (isLoading) return <div className="loading-spinner" />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row h-[80vh] bg-white dark:bg-background rounded-xl shadow overflow-hidden relative">
        {/* 左侧会话列表 */}
        <aside className="w-full md:w-80 border-r border-border bg-accent/30 flex flex-col relative">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h1 className="text-xl font-bold">私信</h1>
            <button
              className="p-2 rounded-full hover:bg-accent transition"
              title="新建会话"
              onClick={() => navigate('/messages/new')}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">暂无消息</div>
            ) : (
              conversations.map(conv => (
                <Link
                  key={conv._id}
                  to={`/chat/${conv.user._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition group relative"
                >
                  <img
                    src={conv.user.avatar || '/default-avatar.png'}
                    alt={conv.user.username}
                    className="w-12 h-12 rounded-full object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate group-hover:underline">{conv.user.username}</h3>
                      {conv.lastMessage?.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-muted-foreground truncate text-sm">
                        {conv.lastMessage?.contentType === 'image'
                          ? '图片消息'
                          : conv.lastMessage?.content}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </aside>
        {/* 右侧聊天窗口占位（后续可自动跳转/嵌入） */}
        <section className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-4">
            <Mail className="w-12 h-12" />
            <div className="text-lg font-semibold">选择一个会话开始聊天</div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default Messages;
