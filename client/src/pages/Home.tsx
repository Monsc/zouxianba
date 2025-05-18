import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getFeed, likePost, getNewPostCount } from '../services/api';
import PostCard from '../components/PostCard';
import CreatePostBox from '../components/CreatePostBox';
import PullToRefresh from 'react-pull-to-refresh';

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
  liked: boolean;
}

function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newCount, setNewCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPosts();
  }, [user, navigate]);

  // 记录最新一条帖子的时间
  useEffect(() => {
    if (posts.length > 0) {
      setLastCheck(posts[0].createdAt);
    }
  }, [posts]);

  // 定时轮询新帖数量
  useEffect(() => {
    if (!lastCheck) return;
    const timer = setInterval(async () => {
      try {
        const data = await getNewPostCount(lastCheck);
        setNewCount(data.count);
      } catch {}
    }, 20000); // 20秒轮询
    return () => clearInterval(timer);
  }, [lastCheck]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const data = await getFeed();
      const postsWithId = (data as any[]).map(post => ({ ...post, id: post._id }));
      setPosts(postsWithId as Post[]);
      setError(null);
    } catch (err) {
      setError('加载失败，请稍后重试');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      setPosts(posts.map(p => 
        p._id === postId ? {
          ...p,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
          liked: !p.liked
        } : p
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleRefresh = async () => {
    await loadPosts();
  };

  const handleShowNewPosts = async () => {
    await loadPosts();
    setNewCount(0);
  };

  return (
    <div className="home-page">
      {/* 新帖提示条 */}
      {newCount > 0 && (
        <div className="fixed top-16 left-0 right-0 z-30 flex justify-center">
          <button
            className="bg-primary text-white px-4 py-1 rounded-full shadow-md mt-2 animate-bounce"
            onClick={handleShowNewPosts}
          >
            有 {newCount} 条新帖，点击刷新
          </button>
        </div>
      )}
      {/* 发帖框 */}
      <CreatePostBox />
      
      {/* 信息流 */}
      <PullToRefresh onRefresh={handleRefresh} className="pt-2" resistance={2}>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <div className="text-error text-center py-8">加载失败，请稍后重试</div>
        ) : posts.length === 0 ? (
          <div className="text-gray-400 text-center py-8">暂无帖子</div>
        ) : (
          posts.map(post => (
            <PostCard key={post._id} post={post} onLike={handleLike} />
          ))
        )}
      </PullToRefresh>
    </div>
  );
}

export default Home; 