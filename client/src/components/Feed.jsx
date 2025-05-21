import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PostCard } from './PostCard';
import { CreatePost } from './CreatePost';
import { useAuth } from '../contexts/AuthContext';

export const Feed = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await apiService.getPosts(username, page);
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
      } catch (error) {
        addToast('Failed to load posts', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [username, page, addToast]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleLike = async (postId) => {
    try {
      await apiService.likePost(postId);
      setPosts(posts.map(post =>
        post._id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post
      ));
    } catch (error) {
      addToast('Failed to like post', 'error');
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const comment = await apiService.createComment(postId, content);
      setPosts(posts.map(post =>
        post._id === postId
          ? {
              ...post,
              comments: [...post.comments, comment],
              commentCount: post.commentCount + 1,
            }
          : post
      ));
    } catch (error) {
      addToast('Failed to add comment', 'error');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await apiService.deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      addToast('Post deleted successfully', 'success');
    } catch (error) {
      addToast('Failed to delete post', 'error');
    }
  };

  if (loading && page === 1) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {user && !username && <CreatePost />}
      {posts.map(post => (
        <PostCard
          key={post._id}
          post={post}
          onLike={() => handleLike(post._id)}
          onComment={handleComment}
          onDelete={() => handleDelete(post._id)}
        />
      ))}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed; 