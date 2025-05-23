import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Avatar from './Avatar';
import { useToast } from '../hooks/useToast';
import { apiService } from '../services/api';

function MessageModal({ targetUser, onClose }) {
  const { user: currentUser } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchMessages();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [targetUser._id]);

  const setupSocketListeners = () => {
    if (socket) {
      socket.on('new_message', message => {
        if (
          (message.sender === currentUser._id && message.receiver === targetUser._id) ||
          (message.sender === targetUser._id && message.receiver === currentUser._id)
        ) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
      });
    }
  };

  const fetchMessages = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.get(`/messages/${targetUser._id}`, {
        params: { page, limit: 20 },
      });

      if (loadMore) {
        setMessages(prev => [...response.data.messages, ...prev]);
      } else {
        setMessages(response.data.messages);
      }

      setHasMore(response.data.hasMore);
      setPage(prev => prev + 1);

      if (!loadMore) {
        scrollToBottom();
      }
    } catch (error) {
      showToast('获取消息失败', 'error');
    } finally {
      if (loadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleSend = async e => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await apiService.post('/messages', {
        recipientId: targetUser._id,
        content: newMessage.trim(),
      });
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      scrollToBottom();
      showToast('消息发送成功', 'success');

      if (socket) {
        socket.emit('send_message', response.data);
      }
    } catch (error) {
      showToast('消息发送失败', 'error');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0 && hasMore && !loadingMore) {
        fetchMessages(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-twitter-blue border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-twitter-gray-900 rounded-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="p-4 border-b border-twitter-gray-200 dark:border-twitter-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar user={targetUser} size="sm" />
                <div>
                  <h2 className="font-bold">{targetUser.username}</h2>
                  <p className="text-sm text-twitter-gray-500">@{targetUser.handle}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-twitter-blue hover:underline">
                关闭
              </button>
            </div>
          </div>

          {/* 消息列表 */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="h-[60vh] overflow-y-auto p-4 space-y-4"
          >
            {loadingMore && (
              <div className="text-center py-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-twitter-blue border-t-transparent mx-auto"></div>
              </div>
            )}

            {messages.map(message => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender === currentUser._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    message.sender === currentUser._id
                      ? 'bg-twitter-blue text-white'
                      : 'bg-twitter-gray-100 dark:bg-twitter-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {format(new Date(message.createdAt), 'HH:mm', { locale: zhCN })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-twitter-gray-200 dark:border-twitter-gray-800"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="输入消息..."
                className="flex-1 px-4 py-2 bg-twitter-gray-100 dark:bg-twitter-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-twitter-blue"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 text-twitter-blue hover:bg-twitter-blue/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MessageModal;
