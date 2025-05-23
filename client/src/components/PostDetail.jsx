'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { PostService } from '@/services/PostService';
import { LikeService } from '@/services/LikeService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Textarea } from './Textarea';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from '../components/ui/toaster';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';
import { PostCard } from './PostCard';

export const PostDetail = ({ postId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用无限滚动加载更多评论
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await PostService.getComments(postId, page);
        return response.comments;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: comments,
    setData: setComments,
  });

  // 加载帖子信息和评论
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [postData, commentsData, likedData] = await Promise.all([
          PostService.getPost(postId),
          PostService.getComments(postId),
          currentUser ? LikeService.isLiked(postId) : Promise.resolve(false),
        ]);
        setPost(postData);
        setComments(commentsData.comments);
        setIsLiked(likedData);
      } catch (error) {
        console.error('Fetch data failed:', error);
        showToast('加载数据失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId, currentUser]);

  // 点赞/取消点赞
  const handleLike = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (isLiked) {
        await LikeService.unlike(postId);
        setIsLiked(false);
        setPost(prev => (prev ? { ...prev, likeCount: prev.likeCount - 1 } : null));
        showToast('已取消点赞', 'success');
      } else {
        await LikeService.like(postId);
        setIsLiked(true);
        setPost(prev => (prev ? { ...prev, likeCount: prev.likeCount + 1 } : null));
        showToast('已点赞', 'success');
      }
    } catch (error) {
      console.error('Like action failed:', error);
      showToast('操作失败', 'error');
    }
  };

  // 发表评论
  const handleComment = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    if (!commentContent.trim()) {
      showToast('评论内容不能为空', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const newComment = await PostService.createComment(postId, commentContent);
      setComments(prev => [newComment, ...prev]);
      setCommentContent('');
      setPost(prev => (prev ? { ...prev, commentCount: prev.commentCount + 1 } : null));
      showToast('评论已发布', 'success');
    } catch (error) {
      console.error('Comment failed:', error);
      showToast('评论失败', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return <Toaster title="帖子不存在" description="该帖子可能已被删除或不存在" icon="post" />;
  }

  return (
    <div className="space-y-6">
      {/* 帖子内容 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar
              src={post.author.avatar}
              alt={post.author.username}
              size="md"
              className="cursor-pointer"
              onClick={() => router.push(`/user/${post.author.id}`)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-lg font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                    onClick={() => router.push(`/user/${post.author.id}`)}
                  >
                    {post.author.username}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </p>
                </div>
                {currentUser && currentUser.id === post.author.id && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      // 处理删除帖子
                    }}
                  >
                    删除
                  </Button>
                )}
              </div>

              <div className="mt-4 prose dark:prose-invert max-w-none">{post.content}</div>

              {post.images && post.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {post.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`图片 ${index + 1}`}
                      className="rounded-lg object-cover w-full h-48"
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={cn(
                    'flex items-center space-x-2 text-sm',
                    isLiked
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  )}
                >
                  <Icon name={isLiked ? 'heart-filled' : 'heart'} className="w-5 h-5" />
                  <span>{post.likeCount}</span>
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Icon name="comment" className="w-5 h-5" />
                  <span>{post.commentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 评论区域 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">评论</h3>

          {/* 评论输入框 */}
          <div className="mt-4">
            <Textarea
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={handleComment} disabled={isSubmitting || !commentContent.trim()}>
                {isSubmitting ? <LoadingSpinner size="sm" /> : '发表评论'}
              </Button>
            </div>
          </div>

          {/* 评论列表 */}
          <div className="mt-6 space-y-6">
            {comments.length === 0 ? (
              <Toaster title="暂无评论" description="来发表第一条评论吧" icon="comment" />
            ) : (
              Array.isArray(comments) &&
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-4">
                  <Avatar
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => router.push(`/user/${comment.author.id}`)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                          onClick={() => router.push(`/user/${comment.author.id}`)}
                        >
                          {comment.author.username}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: zhCN,
                          })}
                        </p>
                      </div>
                      {currentUser && currentUser.id === comment.author.id && (
                        <Button
                          variant="danger"
                          size="xs"
                          onClick={() => {
                            // 处理删除评论
                          }}
                        >
                          删除
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}

            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {loadingMore ? <LoadingSpinner size="sm" /> : '加载更多'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
