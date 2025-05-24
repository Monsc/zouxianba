import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';

function HashtagList() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await apiService.getTrendingTopics();
        setTopics(data);
      } catch (error) {
        console.error('获取热门话题失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">热门话题</h2>
      <div className="space-y-3">
        {topics.map(topic => (
          <Link
            key={topic.tag}
            to={`/topic/${topic.tag}`}
            className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-primary font-medium">#{topic.tag}</span>
                {topic?.name && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    {topic.name}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {topic.followers.length} 人关注
              </span>
            </div>
            {topic.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{topic.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HashtagList;
