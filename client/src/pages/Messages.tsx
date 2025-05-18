import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../services/api';
import { Message } from '../types';

function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getConversations();
      setMessages(data);
    } catch (err) {
      setError('加载会话失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="loading-spinner" />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="messages-page max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">私信</h1>
      {messages.length === 0 ? (
        <div className="text-gray-400 text-center py-8">暂无会话</div>
      ) : (
        <div className="space-y-4">
          {messages.map(conv => (
            <div
              key={conv.user?._id || conv.user?.id}
              className="conversation-card flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/messages/${conv.user?._id || conv.user?.id}`)}
            >
              <img
                src={conv.user?.avatar || '/default-avatar.png'}
                alt={conv.user?.username}
                className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-gray-900 dark:text-white truncate">{conv.user?.username}</span>
                <span className="text-sm text-gray-500 truncate">{conv.content}</span>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{conv.createdAt && new Date(conv.createdAt).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages; 