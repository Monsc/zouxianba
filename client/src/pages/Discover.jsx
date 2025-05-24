import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Link } from 'react-router-dom';

const Discover = () => {
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const trendingTopics = await apiService.getTrendingTopics();
        const recommendedUsers = await apiService.getRecommendedUsers();
        setTopics(trendingTopics || []);
        setUsers(recommendedUsers || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">热门话题</h2>
        <div className="flex flex-wrap gap-2">
          {topics.length === 0 ? (
            <span className="text-gray-500">暂无热门话题</span>
          ) : (
            topics.map(topic => (
              <Link key={topic._id || topic.name} to={`/topic/${topic.name || topic}`} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">#{topic.name || topic}</Link>
            ))
          )}
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">推荐用户</h2>
        <div className="space-y-4">
          {users.length === 0 ? (
            <span className="text-gray-500">暂无推荐用户</span>
          ) : (
            users.map(user => (
              <div key={user._id} className="flex items-center space-x-4 border-b pb-2">
                <img src={user.avatar || '/default-avatar.png'} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-semibold">{user.name || user.username}</div>
                  <div className="text-gray-500">@{user.username}</div>
                </div>
                <Link to={`/user/${user.username}`} className="text-blue-500 hover:underline">查看</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
