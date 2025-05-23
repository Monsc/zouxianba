'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { UserService } from '@/services/UserService';
import { PostService } from '@/services/PostService';
import { FollowService } from '@/services/FollowService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from '../components/ui/toaster';
import { Icon } from './Icon';
import { cn } from '@/lib/utils';

export const UserProfile = ({ userId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  // 使用无限滚动加载更多帖子
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await PostService.getUserPosts(userId, page);
        return response.posts;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: posts,
    setData: setPosts,
  });

  // 加载用户信息和帖子
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [userData, postsData, followingData] = await Promise.all([
          UserService.getUser(userId),
          PostService.getUserPosts(userId),
          currentUser ? FollowService.isFollowing(userId) : Promise.resolve(false),
        ]);
        setUser(userData);
        setPosts(postsData.posts);
        setIsFollowing(followingData);
      } catch (error) {
        console.error('Fetch data failed:', error);
        showToast('加载数据失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, currentUser]);

  // 关注/取消关注
  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await FollowService.unfollow(userId);
        setIsFollowing(false);
        showToast('已取消关注', 'success');
      } else {
        await FollowService.follow(userId);
        setIsFollowing(true);
        showToast('已关注', 'success');
      }
    } catch (error) {
      console.error('Follow action failed:', error);
      showToast('操作失败', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Toaster title="用户不存在" description="该用户可能已被删除或不存在" icon="user" />;
  }

  return (
    <div className="space-y-6">
      {/* 用户信息 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {/* 封面图 */}
        <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
          {user.cover && <img src={user.cover} alt="封面" className="w-full h-full object-cover" />}
        </div>

        {/* 个人信息 */}
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-16 mb-4">
            <Avatar
              src={user.avatar}
              alt={user.username}
              size="xl"
              className="border-4 border-white dark:border-gray-900"
            />
            {currentUser && currentUser.id !== user.id && (
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                size="sm"
                className="ml-auto"
                onClick={handleFollow}
              >
                {isFollowing ? '取消关注' : '关注'}
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.username}
              </h1>
              {user.bio && <p className="mt-1 text-gray-500 dark:text-gray-400">{user.bio}</p>}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Icon name="calendar" className="w-4 h-4 mr-1" />
                <span>
                  加入于{' '}
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </div>
              <div className="flex items-center">
                <Icon name="post" className="w-4 h-4 mr-1" />
                <span>{user.postCount} 篇帖子</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/user/${user.id}/followers`)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {user.followerCount}
                </span>{' '}
                关注者
              </button>
              <button
                onClick={() => router.push(`/user/${user.id}/following`)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {user.followingCount}
                </span>{' '}
                关注中
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页 */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
        {/* 这里可以添加标签页内容，如帖子、评论等 */}
      </div>
    </div>
  );
};
