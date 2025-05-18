import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTrendingHashtags } from '../services/api';
import { Hashtag } from '../types';

const HashtagList: React.FC = () => {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHashtags = async () => {
      try {
        const data = await getTrendingHashtags();
        setHashtags(data);
      } catch (error) {
        console.error('获取热门话题失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHashtags();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">热门话题</h2>
      <div className="space-y-3">
        {hashtags.map((tag) => (
          <Link
            key={tag.tag}
            to={`/hashtag/${tag.tag}`}
            className="block p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <div className="flex justify-between items-center">
              <span className="text-primary font-medium">#{tag.tag}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tag.count} 条帖子
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HashtagList; 