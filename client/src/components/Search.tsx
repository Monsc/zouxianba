import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchService } from '@/services/SearchService';
import { UserCard } from './UserCard';
import { Post } from './Post';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from './ui/toaster';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const Search = ({ className }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef(null);

  // 处理点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理搜索
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults(null);
        return;
      }

      try {
        setIsLoading(true);
        const data = await SearchService.search(debouncedQuery, activeTab);
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, activeTab]);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)} ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder="搜索用户或帖子..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Icon
          name="search"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        />
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && query.trim() && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {/* 标签页 */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4 px-4">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  'py-3 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                全部
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  'py-3 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                用户
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={cn(
                  'py-3 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                )}
              >
                帖子
              </button>
            </nav>
          </div>

          {/* 搜索结果 */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : results ? (
              <>
                {/* 用户结果 */}
                {activeTab !== 'posts' && results.users.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      用户
                    </h3>
                    <div className="space-y-3">
                      {results.users.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          showBio={false}
                          showStats={false}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* 帖子结果 */}
                {activeTab !== 'users' && results.posts.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                      帖子
                    </h3>
                    <div className="space-y-4">
                      {results.posts.map((post) => (
                        <Post key={post.id} post={post} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 无结果 */}
                {((activeTab === 'all' &&
                  results.users.length === 0 &&
                  results.posts.length === 0) ||
                  (activeTab === 'users' && results.users.length === 0) ||
                  (activeTab === 'posts' && results.posts.length === 0)) && (
                  <Toaster
                    title="未找到结果"
                    description="尝试使用其他关键词搜索"
                    icon="search"
                  />
                )}

                {/* 查看更多 */}
                {((activeTab === 'all' &&
                  (results.users.length > 0 || results.posts.length > 0)) ||
                  (activeTab === 'users' && results.users.length > 0) ||
                  (activeTab === 'posts' && results.posts.length > 0)) && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(query)}&type=${activeTab}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      查看更多结果
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <Toaster
                title="开始搜索"
                description="输入关键词搜索用户或帖子"
                icon="search"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 