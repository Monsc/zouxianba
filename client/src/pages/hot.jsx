import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
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

const HotPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [timeRange, setTimeRange] = useState('day'); // day, week, month

  // 获取热门帖子
  const fetchHotPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/posts/hot', {
        params: {
          page: currentPage,
          limit: 10,
          timeRange,
        },
      });
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message || '获取热门帖子失败');
      toast.error('获取热门帖子失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotPosts();
  }, [currentPage, timeRange]);

  // 处理点赞
  const handleLike = async postId => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/posts/${postId}/like`);
      setPosts(
        posts.map(post =>
          post._id === postId
            ? { ...post, likes: response.data.likes, isLiked: response.data.isLiked }
            : post
        )
      );
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  // 处理关注/取消关注
  const handleFollow = async userId => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    try {
      const response = await api.post(`/users/${userId}/follow`);
      setPosts(
        posts.map(post =>
          post.author._id === userId
            ? { ...post, author: { ...post.author, isFollowing: response.data.isFollowing } }
            : post
        )
      );
      toast.success(response.data.isFollowing ? '关注成功' : '已取消关注');
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <ErrorState
            title="获取热门帖子失败"
            description={error}
            action={<Button onClick={fetchHotPosts}>重试</Button>}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 时间范围选择器 */}
        <div className="mb-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-center space-x-4 p-4">
            <Button
              variant={timeRange === 'day' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange('day')}
            >
              今日热门
            </Button>
            <Button
              variant={timeRange === 'week' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange('week')}
            >
              本周热门
            </Button>
            <Button
              variant={timeRange === 'month' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTimeRange('month')}
            >
              本月热门
            </Button>
          </div>
        </div>

        <LoadingOverlay isLoading={loading}>
          {!Array.isArray(posts) || posts.length === 0 ? (
            <EmptyState
              title="暂无热门帖子"
              description="快来发布第一条动态吧"
              action={<Button onClick={() => navigate('/post/create')}>发布动态</Button>}
            />
          ) : (
            <div className="space-y-6">
              {Array.isArray(posts) &&
                posts.map(post => (
                  <div key={post._id} className="bg-white rounded-lg shadow-sm">
                    {/* 作者信息 */}
                    <div className="p-4 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={post.author.avatar}
                            alt={post.author.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">{post.author.username}</h3>
                            <p className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                                locale: zhCN,
                              })}
                            </p>
                          </div>
                        </div>
                        {user && post.author._id !== user._id && (
                          <Button
                            variant={post.author.isFollowing ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => handleFollow(post.author._id)}
                          >
                            {post.author.isFollowing ? '取消关注' : '关注'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 帖子内容 */}
                    <div className="p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>

                      {/* 图片网格 */}
                      {Array.isArray(post.images) && post.images.length > 0 && (
                        <div
                          className={`mt-4 grid gap-2 ${
                            post.images.length === 1
                              ? 'grid-cols-1'
                              : post.images.length === 2
                                ? 'grid-cols-2'
                                : post.images.length === 3
                                  ? 'grid-cols-3'
                                  : post.images.length === 4
                                    ? 'grid-cols-2'
                                    : 'grid-cols-3'
                          }`}
                        >
                          {post.images.map((image, index) => (
                            <ImagePreview
                              key={index}
                              src={image}
                              alt={`图片 ${index + 1}`}
                              className={`w-full h-48 object-cover rounded-lg ${
                                post.images.length === 4 && index === 0 ? 'col-span-2' : ''
                              }`}
                            />
                          ))}
                        </div>
                      )}

                      {/* 标签 */}
                      {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {post.tags.map(tag => (
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
                      {post.location && (
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
                          {post.location}
                        </div>
                      )}
                    </div>

                    {/* 互动栏 */}
                    <div className="px-4 py-3 border-t bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(post._id)}
                            className={`flex items-center space-x-1 ${
                              post.isLiked ? 'text-red-500' : 'text-gray-500'
                            }`}
                          >
                            <svg
                              className="w-5 h-5"
                              fill={post.isLiked ? 'currentColor' : 'none'}
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
                            <span>{post.likes.length}</span>
                          </button>
                          <button
                            onClick={() => navigate(`/post/${post._id}`)}
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
                            <span>{post.comments.length}</span>
                          </button>
                        </div>
                        <button
                          onClick={() => navigate(`/post/${post._id}`)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          查看详情
                        </button>
                      </div>
                    </div>
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

export default HotPage;
