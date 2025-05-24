import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../../services/api';

const TopicPage = () => {
  const { tag } = useParams();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const topicPosts = await apiService.getTopicPosts(tag);
        setTopic({ name: tag });
        setPosts(topicPosts.posts || []);
      } catch (err) {
        setError('话题不存在或加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  if (loading) return <div className="text-center py-10">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!topic) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold">#{topic.name}</h2>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">相关动态</h3>
        {posts.length === 0 ? (
          <div className="text-gray-500">暂无相关动态</div>
        ) : (
          posts.map(post => (
            <div key={post._id} className="border-b py-4">
              <div className="font-semibold">{post.content}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopicPage;
