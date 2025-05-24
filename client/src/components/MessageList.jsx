'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MessageService } from '@/services/MessageService';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from '../components/ui/toaster';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { MessageInput } from './MessageInput';

export const MessageList = ({ conversationId }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMessages(conversationId);
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      showToast('获取消息失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}/messages/${conversationId}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      showToast('消息连接失败', 'error');
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.sender._id === user?._id;

    return (
      <div
        key={message._id}
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
          <img
            src={message.sender.avatar}
            alt={message.sender.username}
            className="w-8 h-8 rounded-full"
          />
          <div className={`max-w-[70%] ${isOwnMessage ? 'text-right' : 'text-left'}`}>
            {message.type === 'image' ? (
              <img
                src={message.content}
                alt="消息图片"
                className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.content, '_blank')}
              />
            ) : (
              <div
                className={`px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                }`}
              >
                {message.content}
              </div>
            )}
            <span className="text-xs text-gray-500 mt-1 block">
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : messages.length > 0 ? (
          messages.map(renderMessage)
        ) : (
          <div className="text-center py-8 text-gray-500">
            暂无消息
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        conversationId={conversationId}
        onMessageSent={fetchMessages}
      />
    </div>
  );
};
