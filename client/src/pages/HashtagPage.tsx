import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getHashtagPosts } from '../services/api';
import PostList from '../components/PostList';
import { Post } from '../types';

const HashtagPage: React.FC = () => {
  const { tag } = useParams<{ tag: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await getHashtagPosts(tag!);
        setPosts(data);
        setError(null);
      } catch (err) {
        setError('获取话题帖子失败');
      } finally {
        setLoading(false);
      }
    };

    if (tag) {
      fetchPosts();
    }
  }, [tag]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          #{tag}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {posts.length} 条相关帖子
        </p>
      </div>
      <PostList posts={posts} />
    </div>
  );
};

export default HashtagPage; 