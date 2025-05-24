import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { Search as SearchIcon, Users, Hash, Image } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { UserCard } from '../components/UserCard';
import { TopicCard } from '../components/TopicCard';
import { cn } from '../lib/utils';

const SearchTabs = {
  TOP: 'top',
  POSTS: 'posts',
  PEOPLE: 'people',
  TOPICS: 'topics',
  MEDIA: 'media',
};

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(SearchTabs.TOP);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    posts: [],
    users: [],
    topics: [],
    media: [],
  });

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query, activeTab]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const data = await apiService.search(query, activeTab);
      setResults(data);
    } catch (error) {
      showToast('搜索失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      );
    }

    switch (activeTab) {
      case SearchTabs.TOP:
        return (
          <div className="space-y-4">
            {results.posts.slice(0, 3).map(post => (
              <PostCard key={post._id} post={post} />
            ))}
            {results.users.slice(0, 3).map(user => (
              <UserCard key={user._id} user={user} />
            ))}
            {results.topics.slice(0, 3).map(topic => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        );
      case SearchTabs.POSTS:
        return (
          <div className="space-y-4">
            {results.posts.map(post => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        );
      case SearchTabs.PEOPLE:
        return (
          <div className="space-y-4">
            {results.users.map(user => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        );
      case SearchTabs.TOPICS:
        return (
          <div className="space-y-4">
            {results.topics.map(topic => (
              <TopicCard key={topic._id} topic={topic} />
            ))}
          </div>
        );
      case SearchTabs.MEDIA:
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {results.media.map(post => (
              <div key={post._id} className="aspect-square">
                <img
                  src={post.media[0].url}
                  alt=""
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 搜索框 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* 搜索分类 */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            className={cn(
              'flex-1 py-3',
              activeTab === SearchTabs.TOP && 'border-b-2 border-blue-500 font-bold'
            )}
            onClick={() => setActiveTab(SearchTabs.TOP)}
          >
            热门
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'flex-1 py-3',
              activeTab === SearchTabs.POSTS && 'border-b-2 border-blue-500 font-bold'
            )}
            onClick={() => setActiveTab(SearchTabs.POSTS)}
          >
            帖子
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'flex-1 py-3',
              activeTab === SearchTabs.PEOPLE && 'border-b-2 border-blue-500 font-bold'
            )}
            onClick={() => setActiveTab(SearchTabs.PEOPLE)}
          >
            用户
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'flex-1 py-3',
              activeTab === SearchTabs.TOPICS && 'border-b-2 border-blue-500 font-bold'
            )}
            onClick={() => setActiveTab(SearchTabs.TOPICS)}
          >
            话题
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'flex-1 py-3',
              activeTab === SearchTabs.MEDIA && 'border-b-2 border-blue-500 font-bold'
            )}
            onClick={() => setActiveTab(SearchTabs.MEDIA)}
          >
            媒体
          </Button>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="p-4">
        {query ? (
          renderResults()
        ) : (
          <div className="text-center py-8 text-gray-500">
            输入关键词开始搜索
          </div>
        )}
      </div>
    </div>
  );
}
