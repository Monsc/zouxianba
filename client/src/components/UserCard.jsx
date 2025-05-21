import React, { useState } from 'react';
import { Avatar } from './Avatar';
import { Button } from '@/components/ui/button';
import { FollowService } from '@/services/FollowService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const UserCard = ({ user, onFollowChange, showBio = true, showStats = true }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUser) {
      showToast('请先登录', 'warning');
      return;
    }

    if (currentUser.id === user.id) {
      return;
    }

    try {
      setIsLoading(true);
      if (isFollowing) {
        await FollowService.unfollowUser(user.id);
        setIsFollowing(false);
        onFollowChange?.(user.id, false);
      } else {
        await FollowService.followUser(user.id);
        setIsFollowing(true);
        onFollowChange?.(user.id, true);
      }
    } catch (error) {
      showToast('操作失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Link href={`/users/${user.id}`}>
        <Avatar
          src={user.avatar}
          alt={user.username}
          size="md"
          className="flex-shrink-0"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/users/${user.id}`}
              className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:underline"
            >
              {user.username}
            </Link>
            {showBio && user.bio && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>

          {currentUser && currentUser.id !== user.id && (
            <Button
              variant={isFollowing ? 'outline' : 'primary'}
              size="sm"
              onClick={handleFollow}
              disabled={isLoading}
              className={cn(
                'ml-4',
                isFollowing && 'text-gray-500 hover:text-red-500'
              )}
            >
              {isFollowing ? '取消关注' : '关注'}
            </Button>
          )}
        </div>

        {showStats && (
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <Link
              href={`/users/${user.id}/followers`}
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user.followersCount}
              </span>{' '}
              粉丝
            </Link>
            <Link
              href={`/users/${user.id}/following`}
              className="hover:text-gray-700 dark:hover:text-gray-200"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {user.followingCount}
              </span>{' '}
              关注
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}; 