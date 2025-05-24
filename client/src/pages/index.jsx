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

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取帖子列表
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/posts/timeline', {
        params: {
          page: currentPage,
          limit: 10,
        },
      });
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message || '获取帖子失败');
      toast.error('获取帖子失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPosts();
    }
  }, [user, currentPage]);

  // 处理点赞
  const handleLike = async postId => {
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

  // 处理删除帖子
  const handleDelete = async postId => {
    if (!window.confirm('确定要删除这条动态吗？')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('删除成功');
    } catch (err) {
      toast.error('删除失败，请重试');
    }
  };

  // 处理关注/取消关注
  const handleFollow = async userId => {
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

  if (!user) {
    return (
      <MainLayout>
        <>
          <EmptyState
            title="欢迎来到走线吧"
            description="请登录以查看关注用户的动态"
            action={<Button onClick={() => navigate('/login')}>登录</Button>}
          />
        </>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <>
          <ErrorState
            title="获取帖子失败"
            description={error}
            action={<Button onClick={fetchPosts}>重试</Button>}
          />
        </>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <>
        <LoadingOverlay isLoading={loading}>
          {!Array.isArray(posts) || posts.length === 0 ? (
            <EmptyState
              title="暂无动态"
              description="关注更多用户以查看他们的动态"
              action={<Button onClick={() => navigate('/explore')}>发现用户</Button>}
            />
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onFollow={handleFollow}
                />
              ))}
            </div>
          )}
        </LoadingOverlay>
      </>
    </MainLayout>
  );
};

export default HomePage;
