'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { UserService } from '@/services/UserService';
import { FollowService } from '@/services/FollowService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { Toaster } from '../components/ui/toaster';
import { Icon } from './Icon';

export const UserList = ({ userId, type }) => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  // 使用无限滚动加载更多用户
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await UserService.getUserList(userId, type, page);
        return response.users;
      } catch (error) {
        console.error('Load more failed:', error);
        return [];
      }
    },
    initialData: users,
    setData: setUsers,
  });

  // 加载用户列表和关注状态
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersData, followingData] = await Promise.all([
          UserService.getUserList(userId, type),
          currentUser
            ? Promise.all(users.map(user => FollowService.isFollowing(user.id))).then(results =>
                results.reduce(
                  (acc, isFollowing, index) => ({
                    ...acc,
                    [users[index].id]: isFollowing,
                  }),
                  {}
                )
              )
            : Promise.resolve({}),
        ]);
        setUsers(usersData.users);
        setFollowingMap(followingData);
      } catch (error) {
        console.error('Fetch data failed:', error);
        showToast('加载数据失败', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, type, currentUser]);

  // 关注/取消关注
  const handleFollow = async targetUserId => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      if (followingMap[targetUserId]) {
        await FollowService.unfollow(targetUserId);
        setFollowingMap(prev => ({ ...prev, [targetUserId]: false }));
        showToast('已取消关注', 'success');
      } else {
        await FollowService.follow(targetUserId);
        setFollowingMap(prev => ({ ...prev, [targetUserId]: true }));
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

  if (users.length === 0) {
    return (
      <Toaster
        title={`暂无${type === 'followers' ? '关注者' : '关注'}`}
        description={`该用户还没有${type === 'followers' ? '关注者' : '关注任何用户'}`}
        icon="users"
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {users.map(user => (
          <div key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={user.avatar}
                  alt={user.username}
                  size="md"
                  className="cursor-pointer"
                  onClick={() => router.push(`/user/${user.id}`)}
                />
                <div>
                  <h3
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                    onClick={() => router.push(`/user/${user.id}`)}
                  >
                    {user.username}
                  </h3>
                  {user.bio && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Icon name="post" className="w-3 h-3 mr-1" />
                      <span>{user.postCount} 篇帖子</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="users" className="w-3 h-3 mr-1" />
                      <span>{user.followerCount} 个关注者</span>
                    </div>
                    <div>
                      加入于{' '}
                      {formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {currentUser && currentUser.id !== user.id && (
                <Button
                  variant={followingMap[user.id] ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleFollow(user.id)}
                >
                  {followingMap[user.id] ? '取消关注' : '关注'}
                </Button>
              )}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center py-4">
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
  );
};
