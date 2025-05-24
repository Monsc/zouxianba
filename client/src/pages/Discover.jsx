import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendedUsers, getTrendingTopics } from '../services/api';
import { FollowService } from '../services/FollowService';
import { useAuth } from '../contexts/AuthContext';

function Discover() {
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const [recommendedUsers, trendingTopics] = await Promise.all([
        getRecommendedUsers(),
        getTrendingTopics(),
      ]);
      setUsers(recommendedUsers);
      setTopics(trendingTopics);
    } catch (error) {
      // 错误处理
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤被屏蔽用户的推荐
  const visibleUsers = currentUser?.blocked
    ? users.filter(u => !currentUser.blocked.includes(u._id))
    : users;

  if (isLoading) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 推荐用户 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">推荐关注</h2>
        <div className="space-y-4">
          {visibleUsers.map(user => (
            <div
              key={user._id}
              className="user-card flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 dark:text-white">{user.username}</span>
                  <span className="text-sm text-gray-500">@{user.handle}</span>
                  {user.bio && (
                    <span className="text-sm text-gray-500 line-clamp-1">{user.bio}</span>
                  )}
                </div>
              </div>
              <button
                className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                  user.isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
                onClick={async e => {
                  e.stopPropagation();
                  if (!user._id) return;
                  try {
                    if (user.isFollowing) {
                      await FollowService.unfollowUser(user._id);
                    } else {
                      await FollowService.followUser(user._id);
                    }
                    setUsers(prev =>
                      prev.map(u =>
                        u._id === user._id ? { ...u, isFollowing: !u.isFollowing } : u
                      )
                    );
                  } catch (err) {
                    // 错误处理
                  }
                }}
              >
                {user.isFollowing ? '已关注' : '关注'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 热门话题 */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">热门话题</h2>
        <div className="space-y-4">
          {topics.map(topic => (
            <div
              key={topic.tag}
              className="topic-card p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/search?q=${encodeURIComponent(topic.tag)}`)}
            >
              <div className="flex flex-col">
                <span className="text-lg font-medium text-primary">#{topic.tag}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {topic.count} 条帖子
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Discover;
