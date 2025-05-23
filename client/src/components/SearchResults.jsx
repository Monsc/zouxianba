'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SearchService } from '@/services/SearchService';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from './ui/toaster';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export const SearchResults = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState('all');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 使用无限滚动加载更多结果
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await SearchService.search(query, type, page);
        return response.results;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: results,
    setData: setResults,
  });

  // 处理搜索
  const handleSearch = async e => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const response = await SearchService.search(query, type);
      setResults(response.results);
      router.push(`/search?q=${encodeURIComponent(query)}&type=${type}`);
    } catch (error) {
      console.error('Search failed:', error);
      showToast('搜索失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 当 URL 参数变化时更新搜索
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlType = searchParams.get('type');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      setType(urlType || 'all');
      handleSearch(new Event('submit'));
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* 搜索表单 */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索帖子和用户..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <LoadingSpinner size="sm" /> : '搜索'}
          </Button>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setType('all')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              type === 'all'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => setType('users')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              type === 'users'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            用户
          </button>
          <button
            type="button"
            onClick={() => setType('posts')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg',
              type === 'posts'
                ? 'bg-blue-500 text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
          >
            帖子
          </button>
        </div>
      </form>

      {/* 搜索结果 */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : results.length === 0 ? (
        <Toaster title="暂无结果" description="尝试使用其他关键词搜索" icon="search" />
      ) : (
        <div className="space-y-6">
          {results.map(result => (
            <div
              key={result.id}
              className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden"
            >
              {type === 'users' || (type === 'all' && result.type === 'user') ? (
                // 用户结果
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <Avatar
                      src={result.avatar}
                      alt={result.username}
                      size="md"
                      className="cursor-pointer"
                      onClick={() => router.push(`/user/${result.id}`)}
                    />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                        onClick={() => router.push(`/user/${result.id}`)}
                      >
                        {result.username}
                      </h3>
                      {result.bio && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {result.bio}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Icon name="post" className="w-4 h-4 mr-1" />
                          <span>{result.postCount} 篇帖子</span>
                        </div>
                        <div className="flex items-center">
                          <Icon name="users" className="w-4 h-4 mr-1" />
                          <span>{result.followerCount} 个关注者</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 帖子结果
                <div className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar
                      src={result.author.avatar}
                      alt={result.author.username}
                      size="md"
                      className="cursor-pointer"
                      onClick={() => router.push(`/user/${result.author.id}`)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                            onClick={() => router.push(`/user/${result.author.id}`)}
                          >
                            {result.author.username}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p
                        className="mt-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:underline"
                        onClick={() => router.push(`/post/${result.id}`)}
                      >
                        {result.content}
                      </p>
                      {result.images && result.images.length > 0 && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {result.images.slice(0, 2).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`图片 ${index + 1}`}
                              className="rounded-lg object-cover w-full h-24"
                            />
                          ))}
                        </div>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Icon name="heart" className="w-4 h-4 mr-1" />
                          <span>{result.likeCount}</span>
                        </div>
                        <div className="flex items-center">
                          <Icon name="comment" className="w-4 h-4 mr-1" />
                          <span>{result.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {loadingMore ? <LoadingSpinner size="sm" /> : '加载更多'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
