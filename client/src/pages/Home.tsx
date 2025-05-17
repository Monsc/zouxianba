import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFeed, likePost } from '../services/api';
import PostCard from '../components/PostCard';

interface Post {
  id: string;
  content: string;
  media?: string[];
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadPosts();
  }, [user, navigate]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getFeed();
      const postsWithId = (data as any[]).map(post => ({ ...post, id: post._id }));
      setPosts(postsWithId as Post[]);
      setError(null);
    } catch (err) {
      setError('Failed to load posts. Please try again later.');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="posts-container">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            onLike={() => handleLike(post.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Home; 