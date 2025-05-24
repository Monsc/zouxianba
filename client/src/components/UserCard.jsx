import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';

export const UserCard = ({ user }) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const handleFollow = async () => {
    if (!currentUser) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      await apiService.followUser(user._id);
      showToast(user.isFollowing ? '已取消关注' : '关注成功');
    } catch (error) {
      showToast('操作失败，请稍后重试', 'error');
    }
  };

  return (
    <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center justify-between">
        <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
          <img
            src={user.avatar}
            alt={user.username}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {user.username}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              @{user.handle}
            </p>
            {user.bio && (
              <p className="mt-1 text-gray-600 dark:text-gray-300">
                {user.bio}
              </p>
            )}
          </div>
        </Link>
        {currentUser && currentUser._id !== user._id && (
          <Button
            variant={user.isFollowing ? 'outline' : 'default'}
            size="sm"
            onClick={handleFollow}
          >
            {user.isFollowing ? '取消关注' : '关注'}
          </Button>
        )}
      </div>
    </div>
  );
};
