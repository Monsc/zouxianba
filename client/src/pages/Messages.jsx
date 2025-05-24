import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { MessageList } from '../components/MessageList';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Search, ArrowLeft, Menu } from 'lucide-react';

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationList, setShowConversationList] = useState(!conversationId);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    // 在移动端，当选择对话时隐藏对话列表
    if (conversationId) {
      setShowConversationList(false);
    }
  }, [conversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await apiService.getConversations();
      setConversations(data);
    } catch (error) {
      showToast('获取对话列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async (userId) => {
    try {
      const conversation = await apiService.createConversation(userId);
      navigate(`/messages/${conversation._id}`);
    } catch (error) {
      showToast('创建对话失败', 'error');
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.participants.find(p => p._id !== user?._id);
    return otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherUser.handle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const renderConversationList = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">消息</h1>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索用户..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-[15px]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => {
            const otherUser = conversation.participants.find((p) => p._id !== user?._id);
            return (
              <button
                key={conversation._id}
                onClick={() => navigate(`/messages/${conversation._id}`)}
                className={`w-full mb-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-3 flex items-center space-x-3 transition-shadow hover:shadow-md hover:bg-blue-50/60 dark:hover:bg-blue-900/20 ${conversationId === conversation._id ? 'ring-2 ring-blue-400/40' : ''}`}
              >
                <img
                  src={otherUser.avatar}
                  alt={otherUser.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{otherUser.username}</h3>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true, locale: zhCN })}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className="text-[15px] text-gray-500 dark:text-gray-400 truncate mt-1">{conversation.lastMessage.content}</p>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">暂无对话</div>
        )}
      </div>
    </div>
  );

  const renderMessageContent = () => {
    const conversation = conversations.find(c => c._id === conversationId);
    const otherUser = conversation?.participants.find(p => p._id !== user?._id);

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
          <button
            onClick={() => setShowConversationList(true)}
            className="md:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {otherUser && (
            <div className="flex items-center space-x-3">
              <img
                src={otherUser.avatar}
                alt={otherUser.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-medium text-gray-900 dark:text-white">
                  {otherUser.username}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {otherUser.handle}
                </p>
              </div>
            </div>
          )}
        </div>

        <MessageList conversationId={conversationId} />
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="h-full md:max-w-4xl md:mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          {/* 对话列表 */}
          <div
            className={`${
              showConversationList ? 'block' : 'hidden'
            } md:block md:col-span-4 border-r border-gray-200 dark:border-gray-800`}
          >
            {renderConversationList()}
          </div>

          {/* 消息内容 */}
          <div
            className={`${
              showConversationList ? 'hidden' : 'block'
            } md:block md:col-span-8`}
          >
            {conversationId ? (
              renderMessageContent()
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                选择一个对话开始聊天
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
