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
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('[Feed] user:', user, 'username:', username, 'page:', page);
        const data = await apiService.getPosts(username, page);
        console.log('[Feed] apiService.getPosts 响应:', data);
        if (page === 1) {
          setPosts(data.posts);
        } else {
          setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.hasMore);
        setError(false);
      } catch (error) {
        console.error('[Feed] 加载 posts 出错:', error, error?.response);
        if (!error) {
          setError(true);
          addToast('Failed to load posts', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    if (!error) {
      fetchPosts();
    }
  }, [username, page]);

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
  if (error) {
    return <div className="text-red-500 text-center">Failed to load posts</div>;
  }

  return (
    <div className="space-y-6">
      {console.log('[Feed] 渲染 posts:', posts)}
      {user && !username && <CreatePost />}
      {Array.isArray(posts) && posts.map(post => (
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