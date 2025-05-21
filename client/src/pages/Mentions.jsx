import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMentions } from '../services/api';
import { PostCard } from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useTheme } from '../contexts/ThemeContext';

function Mentions() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }
        const data = await getMentions();
        setPosts(data);
      } catch (err) {
        setError('Failed to load mentions');
        console.error('Error fetching mentions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentions();
  }, [user, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div
      className={`container mx-auto px-4 py-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
    >
      <h1 className="text-2xl font-bold mb-6">Mentions</h1>
      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No mentions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Mentions;
