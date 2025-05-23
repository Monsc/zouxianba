import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LazyImage } from './LazyImage';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Icon } from './Icon';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { PostService } from '@/services/PostService';
import { cn } from '@/lib/utils';
import { ShareDialog } from './ShareDialog';
import { ShareService } from '@/services/ShareService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import LoginForm from './LoginForm';

export const Post = ({ post, onDelete }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shares, setShares] = useState(post.shares);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLike = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      if (isLiked) {
        await PostService.unlikePost(post.id);
        setLikes((prev) => prev - 1);
      } else {
        await PostService.likePost(post.id);
        setLikes((prev) => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      showToast('操作失败，请重试', 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('确定要删除这条内容吗？')) {
      return;
    }

    try {
      setIsDeleting(true);
      await PostService.deletePost(post.id);
      onDelete?.(post.id);
      showToast('删除成功', 'success');
    } catch (error) {
      showToast('删除失败，请重试', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsShareDialogOpen(true);
  };

  const handleShareSuccess = () => {
    setShares((prev) => prev + 1);
  };

  const renderMedia = () => {
    if (post.video) {
      return (
        <video
          className="w-full rounded-lg"
          controls
          poster={post.images?.[0]}
        >
          <source src={post.video} type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
      );
    }

    if (post.images?.length) {
      return (
        <div className={cn(
          'grid gap-2',
          post.images.length === 1 ? 'grid-cols-1' :
          post.images.length === 2 ? 'grid-cols-2' :
          post.images.length === 3 ? 'grid-cols-2' :
          'grid-cols-2'
        )}>
          {post.images.map((image, index) => (
            <LazyImage
              key={index}
              src={image}
              alt={`图片 ${index + 1}`}
              className={cn(
                'rounded-lg object-cover',
                post.images.length === 3 && index === 0 ? 'row-span-2' : ''
              )}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex items-start space-x-3">
          <Avatar
            src={post.author.avatar}
            alt={post.author.username}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {post.author.username}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </p>
              </div>
              {user?.id === post.author.id && (
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

            <div className="mt-2 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {post.content}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {renderMedia()}

            <div className="mt-4 flex items-center space-x-4">
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
                onClick={handleShare}
                className="flex items-center space-x-1 text-gray-500"
              >
                <Icon name="share" className="w-4 h-4" />
                <span>{shares}</span>
              </Button>
              <ShareDialog
                open={isShareDialogOpen}
                onClose={() => setIsShareDialogOpen(false)}
                post={post}
                onShareSuccess={handleShareSuccess}
              />
            </div>
          </div>
        </div>
      </article>
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录</DialogTitle>
          </DialogHeader>
          <LoginForm />
        </DialogContent>
      </Dialog>
    </>
  );
}; 