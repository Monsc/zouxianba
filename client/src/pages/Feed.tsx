import React, { useState, useEffect } from 'react';
import { Post } from '@/components/Post';
import { CreatePost } from '@/components/CreatePost';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/hooks/useAuth';
import { PostService } from '@/services/PostService';
import { LazyImage } from '@/components/LazyImage';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { useToast } from '@/hooks/useToast';

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用无限滚动加载更多帖子
  const { loadMore, hasMore, loading: loadingMore } = useInfiniteScroll({
    fetchData: async (page) => {
      try {
        const response = await PostService.getFeed(page);
        return response.posts;
      } catch (error) {
        showToast('加载更多内容失败', 'error');
        return [];
      }
    },
    initialData: posts,
    setData: setPosts,
  });

  // 初始加载
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setLoading(true);
        const response = await PostService.getFeed(1);
        setPosts(response.posts);
        setError(null);
      } catch (error) {
        setError('加载信息流失败，请稍后重试');
        showToast('加载信息流失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  // 处理新帖子发布
  const handlePostCreated = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    showToast('发布成功', 'success');
  };

  // 处理帖子删除
  const handlePostDeleted = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    showToast('删除成功', 'success');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="暂无内容"
        description="关注更多用户或发布新内容来丰富你的信息流"
        action={
          user ? (
            <CreatePost onPostCreated={handlePostCreated} />
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              登录以发布内容
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {user && <CreatePost onPostCreated={handlePostCreated} />}
      
      <div className="space-y-6 mt-6">
        {posts.map((post) => (
          <ErrorBoundary key={post.id}>
            <Post
              post={post}
              onDelete={handlePostDeleted}
            />
          </ErrorBoundary>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loadingMore ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
}; 