import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendedUsers, getTrendingTopics, followUser, unfollowUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function Discover() {
  const [users, setUsers] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
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
        getTrendingTopics()
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
  const visibleUsers = currentUser && Array.isArray((currentUser as any).blocked)
    ? users.filter(u => !(currentUser as any).blocked.includes(u.id))
    : users;

  if (isLoading) {
    return <div className="loading-spinner" />;
  }

  return (
    <div className="discover-page max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">发现</h1>
      {/* 推荐用户 */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">推荐关注</h2>
        <div className="space-y-4">
          {visibleUsers.map(user => (
            <div
              key={user.id}
              className="user-card flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <div className="flex items-center gap-3">
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
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    if (user.isFollowing) {
                      await unfollowUser(user.id);
                    } else {
                      await followUser(user.id);
                    }
                    setUsers(prev => prev.map(u =>
                      u.id === user.id ? { ...u, isFollowing: !u.isFollowing } : u
                    ));
                  } catch (err) {}
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
        <h2 className="text-lg font-bold mb-4">热门话题</h2>
        <div className="space-y-4">
          {topics.map(topic => (
            <div
              key={topic.id}
              className="topic-card p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => navigate(`/search?q=${encodeURIComponent(topic.name)}`)}
            >
              <div className="flex flex-col">
                <span className="topic-label">#{topic.name}</span>
                <span className="topic-count">{topic.postCount} 条帖子</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Discover; 