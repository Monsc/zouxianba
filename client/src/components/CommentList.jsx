import React, { useState } from 'react';
import { Comment } from './Comment';
import { CreateComment } from './CreateComment';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '@/hooks/useAuth';
import { CommentService } from '@/services/CommentService';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from './ui/toaster';
import { useToast } from '@/hooks/useToast';

export const CommentList = ({ postId, initialComments = [], onCommentCountChange }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState(initialComments);
  const [replyingTo, setReplyingTo] = useState(null);

  // 使用无限滚动加载更多评论
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await CommentService.getComments(postId, page);
        return response.comments;
      } catch (error) {
        showToast('加载更多评论失败', 'error');
        return [];
      }
    },
    initialData: comments,
    setData: setComments,
  });

  const handleCommentCreated = newComment => {
    setComments(prev => [newComment, ...prev]);
    onCommentCountChange?.(comments.length + 1);
    setReplyingTo(null);
  };

  const handleCommentDeleted = commentId => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    onCommentCountChange?.(comments.length - 1);
  };

  const handleReply = (commentId, username) => {
    setReplyingTo({ commentId, username });
  };

  return (
    <div className="space-y-4">
      {user && (
        <CreateComment
          postId={postId}
          parentId={replyingTo?.commentId}
          replyingTo={replyingTo?.username}
          onCommentCreated={handleCommentCreated}
          onCancel={() => setReplyingTo(null)}
        />
      )}

      {comments.length === 0 ? (
        <Toaster title="暂无评论" description="来发表第一条评论吧" icon="message" />
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              onDelete={handleCommentDeleted}
              onReply={handleReply}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {loadingMore ? <LoadingSpinner size="sm" /> : '加载更多评论'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
