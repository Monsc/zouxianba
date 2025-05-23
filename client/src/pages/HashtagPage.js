import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PostCard from '../components/PostCard';

const HashtagPage = () => {
  const { tag } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/tags/${tag}/posts`);
        if (!res.ok) throw new Error('获取话题内容失败');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [tag]);

  return (
    <div className="main-content">
      <h2 style={{ color: 'var(--primary-color)', marginBottom: 24 }}># {tag}</h2>
      {loading && <div className="loading-spinner" />}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && posts.length === 0 && <div className="no-notifications">暂无内容</div>}
      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default HashtagPage;
