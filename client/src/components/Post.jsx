import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { LazyImage } from './LazyImage';
import { Avatar } from './Avatar';
import { Button } from './ui/button';
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { PostService } from '@/services/PostService';
import { cn } from '@/lib/utils';
import { ShareDialog } from './ShareDialog';
import { ShareService } from '@/services/ShareService';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import LoginForm from './LoginForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

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
        setLikes(prev => prev - 1);
      } else {
        await PostService.likePost(post.id);
        setLikes(prev => prev + 1);
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
    setShares(prev => prev + 1);
  };

  const renderMedia = () => {
    if (post.video) {
      return (
        <div className="mt-3 rounded-2xl overflow-hidden">
          <video className="w-full" controls poster={post.images?.[0]}>
            <source src={post.video} type="video/mp4" />
            您的浏览器不支持视频播放
          </video>
        </div>
      );
    }

    if (Array.isArray(post.images) && post.images.length > 0) {
      return (
        <div
          className={cn(
            'mt-3 grid gap-2 rounded-2xl overflow-hidden',
            post.images.length === 1
              ? 'grid-cols-1'
              : post.images.length === 2
                ? 'grid-cols-2'
                : post.images.length === 3
                  ? 'grid-cols-2'
                  : 'grid-cols-2'
          )}
        >
          {post.images.map((image, index) => (
            <LazyImage
              key={index}
              src={image}
              alt={`图片 ${index + 1}`}
              className={cn(
                'w-full h-full object-cover',
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
      <article className="p-4 hover:bg-accent/50 transition-colors border-b border-border">
        <div className="flex items-start space-x-3">
          <Avatar
            src={post.author.avatar}
            alt={post.author.username}
            size="md"
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold hover:underline cursor-pointer">
                  {post.author.username}
                </h3>
                <span className="text-muted-foreground">@{post.author.handle}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground hover:underline cursor-pointer">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </div>
              {user?.id === post.author.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="mt-2 text-[15px] whitespace-pre-wrap">
              {post.content}
            </div>

            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-primary hover:underline cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {renderMedia()}

            <div className="mt-3 flex items-center justify-between max-w-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  'flex items-center space-x-1 rounded-full',
                  isLiked ? 'text-red-500 hover:text-red-500 hover:bg-red-500/10' : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                )}
              >
                <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                <span>{likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments?.length || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
              >
                <Share2 className="h-4 w-4" />
                <span>{shares}</span>
              </Button>
            </div>
          </div>
        </div>
      </article>

      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        post={post}
        onShareSuccess={handleShareSuccess}
      />

      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>登录以继续</DialogTitle>
          </DialogHeader>
          <LoginForm onSuccess={() => setIsLoginModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
