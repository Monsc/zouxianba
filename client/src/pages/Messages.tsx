import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConversations } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { User, Message } from '../types';

interface Conversation {
  _id: string;
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
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
    <div className="messages-page max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">消息</h1>
      {conversations.length === 0 ? (
        <div className="text-gray-400 text-center py-8">暂无消息</div>
      ) : (
        <div className="space-y-2">
          {conversations.map(conv => (
            <Link
              key={conv._id}
              to={`/chat/${conv.user._id}`}
              className="block p-4 bg-white dark:bg-[#192734] rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <img
                  src={conv.user.avatar || '/default-avatar.png'}
                  alt={conv.user.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{conv.user.username}</h3>
                    {conv.lastMessage?.createdAt && (
                      <span className="text-sm text-gray-500">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-gray-600 dark:text-gray-300 truncate">
                      {conv.lastMessage?.contentType === 'image'
                        ? '图片消息'
                        : conv.lastMessage?.content}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages;
