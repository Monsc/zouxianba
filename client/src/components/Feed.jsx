import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Post from './Post';
import CreatePost from './CreatePost';
import { fetchApi } from '../services/api';

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = useRef();
  const lastPostRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore, isLoadingMore]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchMorePosts();
    }
  }, [page]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await fetchApi('/api/posts?page=1&limit=10');
      setPosts(response.data);
      setHasMore(response.data.length === 10);
      setError(null);
    } catch (err) {
      setError('获取帖子失败，请稍后重试');
      console.error('Failed to fetch posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMorePosts = async () => {
    try {
      setIsLoadingMore(true);
      const response = await fetchApi(`/api/posts?page=${page}&limit=10`);
      setPosts(prev => [...prev, ...response.data]);
      setHasMore(response.data.length === 10);
    } catch (err) {
      console.error('Failed to fetch more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const formData = new FormData();
      formData.append('content', postData.content);
      postData.media.forEach(item => {
        formData.append('media', item.file);
      });

      const response = await fetchApi('/api/posts', {
        method: 'POST',
        body: formData,
      });

      setPosts(prev => [response.data, ...prev]);
      setShowCreatePost(false);
    } catch (err) {
      console.error('Failed to create post:', err);
      throw err;
    }
  };

  const handleLike = async (postId) => {
    try {
      await fetchApi(`/api/posts/${postId}/like`, { method: 'POST' });
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, isLiked: !post.isLiked, likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1 }
          : post
      ));
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleRepost = async (postId) => {
    try {
      await fetchApi(`/api/posts/${postId}/repost`, { method: 'POST' });
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, isReposted: !post.isReposted, repostCount: post.isReposted ? post.repostCount - 1 : post.repostCount + 1 }
          : post
      ));
    } catch (err) {
      console.error('Failed to repost:', err);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      await fetchApi(`/api/posts/${postId}/bookmark`, { method: 'POST' });
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      ));
    } catch (err) {
      console.error('Failed to bookmark post:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-twitter-blue border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchPosts}
          className="mt-4 px-4 py-2 bg-twitter-blue text-white rounded-full hover:bg-twitter-blue/90"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 发帖按钮 */}
      {user && (
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-twitter-gray-900/80 backdrop-blur-sm border-b border-twitter-gray-200 dark:border-twitter-gray-800">
          <div className="p-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full p-4 text-left bg-twitter-gray-100 dark:bg-twitter-gray-800 rounded-full hover:bg-twitter-gray-200 dark:hover:bg-twitter-gray-700 transition-colors"
            >
              <span className="text-twitter-gray-500">有什么新鲜事？</span>
            </button>
          </div>
        </div>
      )}

      {/* 帖子列表 */}
      <div className="divide-y divide-twitter-gray-200 dark:divide-twitter-gray-800">
        {posts.map((post, index) => (
          <div
            key={post._id}
            ref={index === posts.length - 1 ? lastPostRef : null}
          >
            <Post
              post={post}
              onLike={handleLike}
              onRepost={handleRepost}
              onBookmark={handleBookmark}
            />
          </div>
        ))}
      </div>

      {/* 加载更多指示器 */}
      {isLoadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-twitter-blue border-t-transparent"></div>
        </div>
      )}

      {/* 创建帖子模态框 */}
      {showCreatePost && (
        <CreatePost
          onSubmit={handleCreatePost}
          onClose={() => setShowCreatePost(false)}
        />
      )}

      {/* 无内容提示 */}
      {posts.length === 0 && (
        <div className="text-center p-8">
          <h3 className="text-xl font-bold text-twitter-gray-900 dark:text-white">
            还没有帖子
          </h3>
          <p className="mt-2 text-twitter-gray-500">
            关注一些用户或发布你的第一条帖子
          </p>
          {user && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="mt-4 px-6 py-2 bg-twitter-blue text-white rounded-full hover:bg-twitter-blue/90"
            >
              发布帖子
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Feed; 