import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import Avatar from './ui/Avatar';

const UserActivity = ({ userId, className = '' }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchActivities(1);
  }, [userId]);

  const fetchActivities = async (pageNum) => {
    try {
      const response = await apiService.getUserActivities(userId, pageNum);
      if (pageNum === 1) {
        setActivities(response.activities);
      } else {
        setActivities(prev => [...prev, ...response.activities]);
      }
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchActivities(nextPage);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post':
        return '📝';
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👥';
      default:
        return '🔔';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'post':
        return '发布了新帖子';
      case 'like':
        return '赞了帖子';
      case 'comment':
        return '评论了帖子';
      case 'follow':
        return '关注了用户';
      default:
        return '进行了操作';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-bold">最近活动</h2>

      <div className="space-y-4">
        <AnimatePresence>
          {activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <span className="text-xl">{getActivityIcon(activity.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/profile/${activity.user.username}`}
                      className="font-medium hover:underline"
                    >
                      {activity.user.name}
                    </Link>
                    <span className="text-gray-500">
                      {getActivityText(activity)}
                    </span>
                  </div>

                  {activity.content && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {activity.content}
                    </p>
                  )}

                  {activity.target && (
                    <Link
                      to={activity.target.url}
                      className="mt-2 block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      {activity.target.content}
                    </Link>
                  )}

                  <span className="mt-2 block text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-twitter-blue border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            暂无活动记录
          </div>
        )}

        {hasMore && !loading && (
          <button
            onClick={loadMore}
            className="w-full py-2 text-twitter-blue hover:underline"
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
};

export default UserActivity; 