'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { MessageService, Conversation } from '@/services/MessageService';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export const MessageList: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 使用无限滚动加载更多会话
  const { loadMore, hasMore, loading: loadingMore } = useInfiniteScroll({
    fetchData: async (page) => {
      try {
        const response = await MessageService.getConversations(page);
        return response.conversations;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: conversations,
    setData: setConversations,
  });

  // 加载会话列表
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const response = await MessageService.getConversations();
        setConversations(response.conversations);
      } catch (error) {
        console.error('Fetch conversations failed:', error);
        showToast('加载会话失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  // 处理会话点击
  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="暂无消息"
        description="开始与其他用户聊天吧"
        icon="message"
      />
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={cn(
            'bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden cursor-pointer transition-colors',
            !conversation.read && 'bg-blue-50 dark:bg-blue-900/20'
          )}
          onClick={() => handleConversationClick(conversation.id)}
        >
          <div className="p-4">
            <div className="flex items-start space-x-4">
              <Avatar
                src={conversation.participant.avatar}
                alt={conversation.participant.username}
                size="md"
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/user/${conversation.participant.id}`);
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/user/${conversation.participant.id}`);
                      }}
                    >
                      {conversation.participant.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conversation.updatedAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </span>
                    {!conversation.read && (
                      <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

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
    </div>
  );
}; 