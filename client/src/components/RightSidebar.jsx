import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { FollowService } from '../services/FollowService';

const mockUsers = [
  {
    _id: 'u1',
    avatar: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
    username: 'Elon Musk',
    handle: 'elonmusk',
    isFollowing: false,
  },
  {
    _id: 'u2',
    avatar: '',
    username: 'jack',
    handle: 'jack',
    isFollowing: true,
  },
  {
    _id: 'u3',
    avatar: '',
    username: 'Cat Girl',
    handle: 'catgirl',
    isFollowing: false,
  },
];
const mockTopics = [
  { tag: 'SpaceX', count: 1234 },
  { tag: 'AI', count: 888 },
  { tag: 'OpenSource', count: 456 },
  { tag: '可爱', count: 321 },
];

function RightSidebar() {
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setIsLoading(true);
      const [recommendedUsers, trendingTopics] = await Promise.all([
        apiService.getRecommendedUsers(),
        apiService.getTrendingTopics(),
      ]);
      setUsers(Array.isArray(recommendedUsers) && recommendedUsers.length > 0 ? recommendedUsers : mockUsers);
      setTopics(Array.isArray(trendingTopics) && trendingTopics.length > 0 ? trendingTopics : mockTopics);
    } catch (error) {
      // 接口异常时兜底显示 mock 数据
      setUsers(mockUsers);
      setTopics(mockTopics);
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
    <aside className="sidebar-right hidden xl:flex flex-col w-80 p-4 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2233] space-y-6 transition-colors duration-300">
      {/* 搜索框 */}
      <div className="search-box mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索走线吧"
            className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-[#22303c] border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-gray-100"
            onClick={() => navigate('/search')}
          />
          <i className="icon-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        </div>
      </div>

      {/* 推荐用户 */}
      <div className="bg-white dark:bg-[#22303c] rounded-2xl shadow-lg p-4 mb-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">推荐关注</h2>
        <div className="space-y-4">
          {users.map(user => (
            <div
              key={user._id}
              className="user-card flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer gap-3"
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{user.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">@{user.handle}</div>
                </div>
              </div>
              <button
                className={`px-4 py-1 rounded-full text-sm font-bold transition-colors shadow-sm border-none focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  user.isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'bg-primary text-white hover:bg-primary-hover dark:bg-blue-500 dark:hover:bg-blue-600'
                }`}
                onClick={async e => {
                  e.stopPropagation();
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
      <div className="bg-white dark:bg-[#22303c] rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">热门话题</h2>
        <div className="space-y-3">
          {topics.map(topic => (
            <div
              key={topic.tag}
              className="topic-card p-3 rounded-xl bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors cursor-pointer flex flex-col gap-1"
              onClick={() => navigate(`/search?q=${encodeURIComponent(topic.tag)}`)}
            >
              <span className="topic-label text-primary font-bold">#{topic.tag}</span>
              <span className="topic-count text-xs text-gray-500 dark:text-gray-400">{topic.count} 条帖子</span>
            </div>
          ))}
        </div>
      </div>

      {/* 底部链接 */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap gap-2">
          <a href="/about" className="hover:text-gray-700 dark:hover:text-gray-200">
            关于我们
          </a>
          <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-200">
            隐私政策
          </a>
          <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-200">
            使用条款
          </a>
          <a href="/help" className="hover:text-gray-700 dark:hover:text-gray-200">
            帮助中心
          </a>
        </div>
        <p className="mt-2">© 2024 走线吧</p>
      </div>
    </aside>
  );
}

export default RightSidebar;
