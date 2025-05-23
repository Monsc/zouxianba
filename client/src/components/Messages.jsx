import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import apiService from '../services/api';
import { Loader2, Send, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const MessageItem = ({ message, isOwn }) => (
  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
    <div
      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
        isOwn
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      }`}
    >
      {message.content}
      <div
        className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}
      >
        {formatDistanceToNow(new Date(message.createdAt), {
          addSuffix: true,
          locale: zhCN,
        })}
      </div>
    </div>
  </div>
);

const ConversationItem = ({ conversation, isActive, onClick }) => {
  const { user } = useAuth();
  const otherUser = conversation.participants.find(p => p._id !== user._id);

  return (
    <div
      className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        isActive ? 'bg-gray-50 dark:bg-gray-800/50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={otherUser.avatar} />
          <AvatarFallback>{otherUser.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {otherUser.username}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {conversation.lastMessage?.content || '暂无消息'}
          </p>
        </div>
        {conversation.unreadCount > 0 && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
              {conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const Messages = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get('/conversations');
      setConversations(response.data);
      if (response.data.length > 0) {
        setActiveConversation(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setError('加载会话失败，请稍后重试');
      showToast('加载会话失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async conversationId => {
    try {
      const response = await apiService.get(`/conversations/${conversationId}/messages`);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      showToast('加载消息失败，请稍后重试', 'error');
    }
  };

  const handleSendMessage = async e => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await apiService.post(`/conversations/${activeConversation._id}/messages`, {
        content: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('发送消息失败，请稍后重试', 'error');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchConversations} className="text-blue-500 hover:text-blue-600">
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* 会话列表 */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {conversations.map(conversation => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                isActive={activeConversation?._id === conversation._id}
                onClick={() => setActiveConversation(conversation)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无会话</p>
          </div>
        )}
      </div>

      {/* 消息区域 */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map(message => (
                <MessageItem
                  key={message._id}
                  message={message}
                  isOwn={message.sender._id === user._id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入框 */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <ImageIcon className="w-5 h-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="输入消息..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">选择一个会话开始聊天</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
