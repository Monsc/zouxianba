import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PostCard } from './PostCard';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import LoginForm from './LoginForm';
import CreatePostButton from './CreatePostButton';
import { Loader2 } from 'lucide-react';

export const Feed = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Feed] user:', user, 'username:', username, 'page:', page);
        const data = await apiService.getPosts(username, page);
        console.log('[Feed] apiService.getPosts 响应:', data);
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
      } catch (error) {
        console.error('[Feed] 加载 posts 出错:', error, error?.response);
        setError(error?.response?.data?.message || '加载失败，请稍后重试');
        addToast(error?.response?.data?.message || '加载失败，请稍后重试', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [username, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleLike = async (postId) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      await apiService.likePost(postId);
      setPosts(posts.map(post =>
        post._id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post
      ));
    } catch (error) {
      addToast('点赞失败，请稍后重试', 'error');
    }
  };

  const handleComment = async (postId, content) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const comment = await apiService.createComment(postId, content);
      setPosts(posts.map(post =>
        post._id === postId
          ? {
              ...post,
              comments: [...post.comments, comment],
              commentCount: post.commentCount + 1,
            }
          : post
      ));
    } catch (error) {
      addToast('评论失败，请稍后重试', 'error');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await apiService.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      addToast('删除成功', 'success');
    } catch (error) {
      addToast('删除失败，请稍后重试', 'error');
    }
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => setPage(1)}
          className="text-blue-500 hover:text-blue-600"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 发帖按钮 - 访客和已登录用户都显示 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 p-4">
        <CreatePostButton />
      </div>

      {/* 内容列表 */}
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
          {hasMore && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                加载更多
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">暂无内容，快来发布第一条动态吧！</p>
          <CreatePostButton />
        </div>
      )}

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
  );
};

export default Feed; 