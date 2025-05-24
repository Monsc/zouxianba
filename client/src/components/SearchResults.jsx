'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { SearchService } from '@/services/SearchService';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SearchResults = () => {
  const navigate = useNavigate();
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
      navigate(`/search?q=${encodeURIComponent(query)}&type=${type}`);
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="搜索帖子和用户..."
            className="pl-9 bg-accent/50 border-none focus-visible:ring-1"
          />
        </div>

        <Tabs value={type} onValueChange={setType} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>全部</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>用户</span>
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>帖子</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </form>

      {/* 搜索结果 */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">暂无结果</h3>
          <p className="text-muted-foreground">尝试使用其他关键词搜索</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map(result => (
            <div
              key={result.id}
              className="p-4 hover:bg-accent/50 transition-colors rounded-xl cursor-pointer"
              onClick={() => {
                if (type === 'users' || (type === 'all' && result.type === 'user')) {
                  navigate(`/user/${result.id}`);
                } else {
                  navigate(`/post/${result.id}`);
                }
              }}
            >
              {type === 'users' || (type === 'all' && result.type === 'user') ? (
                // 用户结果
                <div className="flex items-center space-x-4">
                  <Avatar
                    src={result.avatar}
                    alt={result.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold hover:underline">
                      {result.username}
                    </h3>
                    {result.bio && (
                      <p className="mt-1 text-muted-foreground line-clamp-2">
                        {result.bio}
                      </p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>{result.postCount} 篇帖子</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{result.followerCount} 个关注者</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 帖子结果
                <div className="flex items-start space-x-4">
                  <Avatar
                    src={result.author.avatar}
                    alt={result.author.username}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold hover:underline">
                        {result.author.username}
                      </h3>
                      <span className="text-muted-foreground">@{result.author.handle}</span>
                    </div>
                    <p className="mt-1 text-[15px] line-clamp-3">
                      {result.content}
                    </p>
                    {result.images?.[0] && (
                      <div className="mt-2 rounded-xl overflow-hidden">
                        <img
                          src={result.images[0]}
                          alt="帖子图片"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              加载更多
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
