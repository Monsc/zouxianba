import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Icon } from './Icon';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { CommentService } from '@/services/CommentService';
import { cn } from '@/lib/utils';

interface CommentProps {
  comment: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      avatar?: string;
    };
    createdAt: string;
    likes: number;
    replies: number;
    isLiked: boolean;
    parentId?: string;
  };
  onDelete?: (commentId: string) => void;
  onReply?: (commentId: string, username: string) => void;
}

export const Comment: React.FC<CommentProps> = ({
  comment,
  onDelete,
  onReply,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likes, setLikes] = useState(comment.likes);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async () => {
    if (!user) {
      showToast('请先登录', 'warning');
      return;
    }

    try {
      if (isLiked) {
        await CommentService.unlikeComment(comment.id);
        setLikes((prev) => prev - 1);
      } else {
        await CommentService.likeComment(comment.id);
        setLikes((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      showToast('操作失败，请重试', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      setIsDeleting(true);
      await CommentService.deleteComment(comment.id);
      onDelete?.(comment.id);
      showToast('删除成功', 'success');
    } catch (error) {
      showToast('删除失败，请重试', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = () => {
    if (!user) {
      showToast('请先登录', 'warning');
      return;
    }
    onReply?.(comment.id, comment.author.username);
  };

  return (
    <div className="flex space-x-3">
      <Avatar
        src={comment.author.avatar}
        alt={comment.author.username}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {comment.author.username}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </p>
          </div>
          {user?.id === comment.author.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-gray-500 hover:text-red-500"
            >
              <Icon name="trash" className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">
          {comment.content}
        </div>

        <div className="mt-2 flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              'flex items-center space-x-1',
              isLiked ? 'text-red-500' : 'text-gray-500'
            )}
          >
            <Icon
              name={isLiked ? 'heart-filled' : 'heart'}
              className="w-4 h-4"
            />
            <span>{likes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReply}
            className="flex items-center space-x-1 text-gray-500"
          >
            <Icon name="reply" className="w-4 h-4" />
            <span>回复</span>
          </Button>

          {comment.replies > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-gray-500"
            >
              <Icon name="message" className="w-4 h-4" />
              <span>{comment.replies} 条回复</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}; 