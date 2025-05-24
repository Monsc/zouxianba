import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import PostList from '../components/PostList';
import { PostCard } from '../components/PostCard';

const TopicPage = () => {
  const { tag } = useParams();
  const [topic, setTopic] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        setLoading(true);
        const topics = await apiService.getTrendingTopics();
        const currentTopic = topics.find(t => t.tag === tag);
        if (currentTopic) {
          setTopic(currentTopic);
          // TODO: 实现获取话题相关帖子的 API
          setPosts([]);
        } else {
          setError('话题不存在');
        }
        setError(null);
      } catch (err) {
        setError('获取话题数据失败');
      } finally {
        setLoading(false);
      }
    };

    if (tag) {
      fetchTopicData();
    }
  }, [tag]);

  const fetchHashtagPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/posts/hashtag/${tag}?page=${page}`);
      const { posts, hasMore } = response.data;
      
      if (page === 1) {
        setPosts(posts);
      } else {
        setPosts(prev => [...prev, ...posts]);
      }
      
      setHasMore(hasMore);
      setLoading(false);
    } catch (error) {
      console.error('获取话题帖子失败:', error);
      setError('获取话题帖子失败，请稍后重试');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  if (!topic) {
    return <div className="text-gray-500 text-center py-8">话题不存在</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">#{topic.tag}</h1>
        {topic?.name && (
          <h2 className="text-xl text-gray-700 dark:text-gray-300 mt-1">{topic.name}</h2>
        )}
        {topic.description && (
          <p className="text-gray-500 dark:text-gray-400 mt-2">{topic.description}</p>
        )}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-gray-500 dark:text-gray-400">{topic.followers.length} 人关注</span>
          <button
            className={`px-4 py-2 rounded-full ${
              topic.followed
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'bg-primary text-white'
            }`}
          >
            {topic.followed ? '已关注' : '关注'}
          </button>
        </div>
      </div>
      {posts.length > 0 ? (
        <PostList posts={posts} />
      ) : (
        <div className="text-gray-500 text-center py-8">暂无相关帖子</div>
      )}
    </div>
  );
};

export default TopicPage;
