import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { Plus, Mail, User, MoreHorizontal } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await api.get('/messages/conversations');
        setConversations(res || []);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        const res = await api.get(`/messages/conversations/${selectedConversation._id}/messages`);
        setMessages(res || []);
        scrollToBottom();
      };
      fetchMessages();
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await api.post(`/messages/conversations/${selectedConversation._id}/messages`, { content: newMessage });
      setMessages([...messages, res]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('发送消息失败:', error);
    }
  };

  if (!user) return <div className="loading-spinner" />;
  if (loading) return <div className="loading-spinner" />;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">消息</h2>
        <div className="flex h-[600px] bg-white dark:bg-gray-900 rounded-lg shadow">
          {/* 会话列表 */}
          <div className="w-1/3 border-r">
            {loading ? (
              <div className="p-4 text-center">加载中...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">暂无会话</div>
            ) : (
              conversations.map(conversation => (
                <div
                  key={conversation._id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedConversation?._id === conversation._id ? 'bg-gray-50 dark:bg-gray-800' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={conversation.participant.avatar || '/default-avatar.png'}
                      alt="avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{conversation.participant.name || conversation.participant.username}</div>
                      <div className="text-sm text-gray-500 truncate">{conversation.lastMessage?.content || '暂无消息'}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 聊天区域 */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* 聊天头部 */}
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <img
                      src={selectedConversation.participant.avatar || '/default-avatar.png'}
                      alt="avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="font-semibold">{selectedConversation.participant.name || selectedConversation.participant.username}</div>
                      <div className="text-sm text-gray-500">在线</div>
                    </div>
                  </div>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map(message => (
                    <div
                      key={message._id}
                      className={`flex ${message.isSender ? 'justify-end' : 'justify-start'} mb-4`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isSender
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* 发送消息 */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="输入消息..."
                      className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      发送
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                选择一个会话开始聊天
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Messages;
