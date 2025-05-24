import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PostCard } from './PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import LoginForm from './LoginForm';
import CreatePostButton from './CreatePostButton';
import { Loader2 } from 'lucide-react';
import MainLayout from './layout/MainLayout';
import { useInView } from 'react-intersection-observer';

export const Feed = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { error: toastError, success } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const feedRef = useRef(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
  });

  const fetchPosts = async (isRefreshing = false) => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (user) {
        data = await apiService.getPosts(isRefreshing ? 1 : page);
      } else {
        data = await apiService.getPublicFeed(isRefreshing ? 1 : page);
      }
      let postsArr = [];
      if (Array.isArray(data)) {
        postsArr = data;
      } else if (data && Array.isArray(data.posts)) {
        postsArr = data.posts;
      }
      if (isRefreshing || page === 1) {
        setPosts(postsArr);
      } else {
        setPosts(prev => [...prev, ...postsArr]);
      }
      setHasMore(data && typeof data.hasMore === 'boolean' ? data.hasMore : postsArr.length > 0);
    } catch (error) {
      setError(error?.response?.data?.message || '加载失败，请稍后重试');
      toastError(error?.response?.data?.message || '加载失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [username, page, user]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  }, [inView, hasMore, loading]);

  const handleRefresh = async () => {
    await fetchPosts(true);
  };

  const handleLike = async postId => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await apiService.likePost(postId);
      setPosts(
        posts.map(post =>
          post._id === postId
            ? {
                ...post,
                likes: post.liked ? post.likes - 1 : post.likes + 1,
                liked: !post.liked,
              }
            : post
        )
      );
    } catch (error) {
      toastError('点赞失败，请稍后重试');
    }
  };

  const handleComment = async (postId, content) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const comment = await apiService.createComment(postId, content);
      setPosts(
        posts.map(post =>
          post._id === postId
            ? {
                ...post,
                comments: [...post.comments, comment],
                commentCount: post.commentCount + 1,
              }
            : post
        )
      );
    } catch (error) {
      toastError('评论失败，请稍后重试');
    }
  };

  const handleDelete = async postId => {
    try {
      await apiService.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      success('删除成功');
    } catch (error) {
      toastError('删除失败，请稍后重试');
    }
  };

  if (loading && page === 1) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4">
            <CreatePostButton />
          </div>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => setPage(1)} className="text-blue-500 hover:text-blue-600">
            重试
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6" ref={feedRef}>
        {/* 发帖按钮 */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4">
          <CreatePostButton />
        </div>

        {/* 内容列表 */}
        <div className="space-y-4">
          {Array.isArray(posts) && posts.length > 0 ? (
            <>
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onLike={() => handleLike(post._id)}
                  onComment={handleComment}
                  onDelete={() => handleDelete(post._id)}
                />
              ))}
              <div ref={loadMoreRef} className="h-4" />
              {loading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">暂无内容</p>
            </div>
          )}
        </div>

        {/* 登录弹窗 */}
        <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>登录</DialogTitle>
            </DialogHeader>
            <LoginForm />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Feed;
