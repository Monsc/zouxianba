import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Pagination from '@/components/common/Pagination';
import ImagePreview from '@/components/common/ImagePreview';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';

const SearchPage = () => {
  const navigate = useNavigate();
  const { q, type = 'all' } = navigate.location.search
    .slice(1)
    .split('&')
    .reduce((acc, param) => {
      const [key, value] = param.split('=');
      acc[key] = value;
      return acc;
    }, {});
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [searchType, setSearchType] = useState(type);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // 更新 URL 参数
  useEffect(() => {
    if (debouncedSearchQuery) {
      navigate.push(
        {
          search: `q=${debouncedSearchQuery}&type=${searchType}`,
        },
        { shallow: true }
      );
    }
  }, [debouncedSearchQuery, searchType]);

  // 执行搜索
  const performSearch = async () => {
    if (!debouncedSearchQuery) {
      setResults([]);
      setTotalPages(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/search', {
        params: {
          q: debouncedSearchQuery,
          type: searchType,
          page: currentPage,
          limit: 10,
        },
      });
      setResults(response.data.results);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message || '搜索失败');
      toast.error('搜索失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [debouncedSearchQuery, searchType, currentPage]);

  // 处理关注/取消关注
  const handleFollow = async userId => {
    if (!user) {
      toast.error('请先登录');
      navigate.push('/login');
      return;
    }

    try {
      const response = await api.post(`/users/${userId}/follow`);
      setResults(
        results.map(result =>
          result._id === userId ? { ...result, isFollowing: response.data.isFollowing } : result
        )
      );
      toast.success(response.data.isFollowing ? '关注成功' : '已取消关注');
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  // 处理点赞
  const handleLike = async postId => {
    if (!user) {
      toast.error('请先登录');
      navigate.push('/login');
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/like`);
      setResults(
        results.map(result =>
          result._id === postId
            ? { ...result, likes: response.data.likes, isLiked: response.data.isLiked }
            : result
        )
      );
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 搜索框和类型选择 */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          <div className="p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索用户或帖子..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <select
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">全部</option>
                <option value="users">用户</option>
                <option value="posts">帖子</option>
              </select>
            </div>
          </div>
        </div>

        <LoadingOverlay isLoading={loading}>
          {error ? (
            <ErrorState
              title="搜索失败"
              description={error}
              action={<Button onClick={performSearch}>重试</Button>}
            />
          ) : !debouncedSearchQuery ? (
            <EmptyState title="开始搜索" description="输入关键词搜索用户或帖子" />
          ) : results.length === 0 ? (
            <EmptyState title="未找到相关结果" description="尝试使用其他关键词" />
          ) : (
            <div className="space-y-6">
              {results.map(result => (
                <div key={result._id} className="bg-white rounded-lg shadow-sm">
                  {searchType === 'users' || (searchType === 'all' && 'username' in result) ? (
                    // 用户卡片
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={result.avatar}
                            alt={result.username}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{result.username}</h3>
                            <p className="text-sm text-gray-500">
                              {result.bio || '这个用户很懒，还没有写简介'}
                            </p>
                          </div>
                        </div>
                        {user && result._id !== user._id && (
                          <Button
                            variant={result.isFollowing ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleFollow(result._id)}
                          >
                            {result.isFollowing ? '取消关注' : '关注'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // 帖子卡片
                    <>
                      <div className="p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={result.author.avatar}
                              alt={result.author.username}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {result.author.username}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(result.createdAt), {
                                  addSuffix: true,
                                  locale: zhCN,
                                })}
                              </p>
                            </div>
                          </div>
                          {user && result.author._id !== user._id && (
                            <Button
                              variant={result.author.isFollowing ? 'secondary' : 'primary'}
                              size="sm"
                              onClick={() => handleFollow(result.author._id)}
                            >
                              {result.author.isFollowing ? '取消关注' : '关注'}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{result.content}</p>

                        {/* 图片网格 */}
                        {result.images?.length > 0 && (
                          <div
                            className={`mt-4 grid gap-2 ${
                              result.images.length === 1
                                ? 'grid-cols-1'
                                : result.images.length === 2
                                  ? 'grid-cols-2'
                                  : result.images.length === 3
                                    ? 'grid-cols-3'
                                    : result.images.length === 4
                                      ? 'grid-cols-2'
                                      : 'grid-cols-3'
                            }`}
                          >
                            {result.images.map((image, index) => (
                              <ImagePreview
                                key={index}
                                src={image}
                                alt={`图片 ${index + 1}`}
                                className={`w-full h-48 object-cover rounded-lg ${
                                  result.images.length === 4 && index === 0 ? 'col-span-2' : ''
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* 标签 */}
                        {result.tags?.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {result.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 位置信息 */}
                        {result.location && (
                          <div className="mt-4 text-sm text-gray-500">
                            <svg
                              className="inline-block w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {result.location}
                          </div>
                        )}
                      </div>

                      {/* 互动栏 */}
                      <div className="px-4 py-3 border-t bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() => handleLike(result._id)}
                              className={`flex items-center space-x-1 ${
                                result.isLiked ? 'text-red-500' : 'text-gray-500'
                              }`}
                            >
                              <svg
                                className="w-5 h-5"
                                fill={result.isLiked ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                              <span>{result.likes.length}</span>
                            </button>
                            <button
                              onClick={() => navigate.push(`/post/${result._id}`)}
                              className="flex items-center space-x-1 text-gray-500"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              <span>{result.comments.length}</span>
                            </button>
                          </div>
                          <button
                            onClick={() => navigate.push(`/post/${result._id}`)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          )}
        </LoadingOverlay>
      </div>
    </MainLayout>
  );
};

export default SearchPage;
