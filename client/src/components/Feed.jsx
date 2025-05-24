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
import MainLayout from './layout/MainLayout';

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[Feed] user:', user, 'username:', username, 'page:', page);
        const data = await apiService.getPosts(page);
        console.log(
          '[Feed] apiService.getPosts 响应:',
          data,
          'typeof:',
          typeof data,
          'isArray:',
          Array.isArray(data)
        );
        let postsArr = [];
        if (Array.isArray(data)) {
          postsArr = data;
        } else if (data && Array.isArray(data.posts)) {
          postsArr = data.posts;
        }
        console.log(
          '[Feed] postsArr:',
          postsArr,
          'typeof:',
          typeof postsArr,
          'isArray:',
          Array.isArray(postsArr)
        );
        if (page === 1) {
          setPosts(postsArr);
          console.log('[Feed] setPosts(postsArr) 赋值:', postsArr);
        } else {
          setPosts(prev => {
            const merged = [...prev, ...postsArr];
            console.log('[Feed] setPosts 合并后:', merged);
            return merged;
          });
        }
        setHasMore(data && typeof data.hasMore === 'boolean' ? data.hasMore : false);
        console.log('[Feed] setPosts后 posts:', postsArr);
      } catch (error) {
        console.error('[Feed] 加载 posts 出错:', error, error?.response);
        setError(error?.response?.data?.message || '加载失败，请稍后重试');
        toastError(error?.response?.data?.message || '加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [username, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
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
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => setPage(1)} className="text-blue-500 hover:text-blue-600">
          重试
        </button>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 发帖按钮 - 仅顶部显示 */}
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
            <p className="text-gray-500 mb-4">暂无内容</p>
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
    </MainLayout>
  );
};

export default Feed;
