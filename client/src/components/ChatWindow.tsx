import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MessageService, Message } from '@/services/MessageService';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  conversationId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId }) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 使用无限滚动加载更多消息
  const { loadMore, hasMore, loading: loadingMore } = useInfiniteScroll({
    fetchData: async (page) => {
      try {
        const response = await MessageService.getMessages(conversationId, page);
        return response.messages;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: messages,
    setData: setMessages,
  });

  // 加载消息
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await MessageService.getMessages(conversationId);
        setMessages(response.messages);
      } catch (error) {
        console.error('Fetch messages failed:', error);
        showToast('加载消息失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送消息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    try {
      setIsSending(true);
      const newMessage = await MessageService.sendMessage(
        conversationId,
        messageContent
      );
      setMessages((prev) => [newMessage, ...prev]);
      setMessageContent('');
    } catch (error) {
      console.error('Send message failed:', error);
      showToast('发送消息失败', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {loadingMore ? (
                <LoadingSpinner size="sm" />
              ) : (
                '加载更多'
              )}
            </button>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex items-start space-x-4',
              message.isMine ? 'flex-row-reverse space-x-reverse' : ''
            )}
          >
            <Avatar
              src={message.sender.avatar}
              alt={message.sender.username}
              size="sm"
              className="cursor-pointer"
              onClick={() => router.push(`/user/${message.sender.id}`)}
            />
            <div
              className={cn(
                'flex flex-col max-w-[70%]',
                message.isMine ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  'rounded-lg px-4 py-2',
                  message.isMine
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: zhCN,
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 消息输入框 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="space-y-4">
          <Textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="输入消息..."
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSending || !messageContent.trim()}>
              {isSending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Icon name="send" className="w-4 h-4 mr-2" />
                  发送
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 