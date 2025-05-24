import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Hash } from 'lucide-react';

export function TopicCard({ topic }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleFollow = async () => {
    if (!user) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      if (topic.isFollowing) {
        await apiService.unfollowTopic(topic._id);
        showToast('已取消关注话题');
      } else {
        await apiService.followTopic(topic._id);
        showToast('已关注话题');
      }
    } catch (error) {
      showToast('操作失败，请稍后重试', 'error');
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link
            to={`/topic/${topic.name}`}
            className="flex items-center space-x-2 text-blue-500 hover:text-blue-600"
          >
            <Hash className="w-4 h-4" />
            <span className="font-medium">{topic.name}</span>
          </Link>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {topic.description}
          </p>
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{topic.postsCount} 个帖子</span>
            <span>{topic.followersCount} 个关注者</span>
          </div>
        </div>
        {user && (
          <Button
            variant={topic.isFollowing ? 'outline' : 'default'}
            size="sm"
            onClick={handleFollow}
          >
            {topic.isFollowing ? '取消关注' : '关注'}
          </Button>
        )}
      </div>
    </div>
  );
} 