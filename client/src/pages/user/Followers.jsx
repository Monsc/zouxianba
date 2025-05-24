import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../services/api';

const Followers = () => {
  const { username } = useParams();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const res = await apiService.getFollowers(username);
        setFollowers(res || []);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowers();
  }, [username]);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">粉丝</h2>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        {loading ? (
          <div>加载中...</div>
        ) : followers.length === 0 ? (
          <div className="text-gray-500">暂无粉丝</div>
        ) : (
          followers.map(user => (
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
  );
};

export default Followers; 