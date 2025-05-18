import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRecommendedUsers, getTrendingTopics, followUser, unfollowUser } from '../services/api';
import { User, Topic } from '../types';

function RightSidebar() {
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const [recommendedUsers, trendingTopics] = await Promise.all([
        getRecommendedUsers(),
        getTrendingTopics()
      ]);
      setUsers(recommendedUsers);
      setTopics(trendingTopics);
    } catch (error) {
      console.error('Error loading sidebar content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <aside className="sidebar-right hidden xl:flex flex-col w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192734]">
        <div className="loading-spinner" />
      </aside>
    );
  }

  return (
    <aside className="sidebar-right hidden xl:flex flex-col w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#192734]">
      {/* 搜索框 */}
      <div className="search-box mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索走线吧"
            className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={() => navigate('/search')}
          />
          <i className="icon-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* 推荐用户 */}
      <div className="recommended-users mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">推荐关注</h2>
        <div className="space-y-4">
          {users.map(user => (
            <div
              key={user._id}
              className="user-card flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{user.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</div>
                </div>
              </div>
              <button
                className={`px-4 py-1 rounded-full text-sm font-bold transition-colors ${
                  user.isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (user.isFollowing) {
                      await unfollowUser(user._id);
                    } else {
                      await followUser(user._id);
                    }
                    setUsers(prev => prev.map(u =>
                      u._id === user._id ? { ...u, isFollowing: !u.isFollowing } : u
                    ));
                  } catch (err) {
                    // 可选：弹出错误提示
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
      <div className="trending-topics">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">热门话题</h2>
        <div className="space-y-4">
          {topics.map(topic => (
            <div
              key={topic.tag}
              className="topic-card p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/search?q=${encodeURIComponent(topic.tag)}`)}
            >
              <div className="flex flex-col">
                <span className="topic-label">#{topic.tag}</span>
                <span className="topic-count">{topic.count} 条帖子</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default RightSidebar; 