import React, { useState, useEffect } from 'react';
import { Post } from '@/components/Post';
import { CreatePost } from '@/components/CreatePost';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useAuth } from '../contexts/AuthContext';
import { PostService } from '@/services/PostService';
import { LazyImage } from '@/components/LazyImage';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Toaster } from '../components/ui/toaster';
import { useToast } from '@/hooks/useToast';

export const Feed = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 新增响应式判断
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [showPostModal, setShowPostModal] = useState(false);

  // 使用无限滚动加载更多帖子
  const {
    loadMore,
    hasMore,
    loading: loadingMore,
  } = useInfiniteScroll({
    fetchData: async page => {
      try {
        const response = await PostService.getPosts(page);
        return response.posts;
      } catch (error) {
        showToast('加载更多内容失败', 'error');
        return [];
      }
    },
    initialData: posts,
    setData: setPosts,
  });

  // 初始加载
  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setLoading(true);
        const response = await PostService.getPosts(1);
        setPosts(response.posts);
        setError(null);
      } catch (error) {
        setError('加载信息流失败，请稍后重试');
        showToast('加载信息流失败', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  // 处理新帖子发布
  const handlePostCreated = newPost => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    showToast('发布成功', 'success');
  };

  // 处理帖子删除
  const handlePostDeleted = postId => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    showToast('删除成功', 'success');
  };

  // 自动调试日志
  console.log('[Feed] posts结构', posts);
  if (Array.isArray(posts) && posts.length > 0) {
    console.log('[Feed] posts[0]结构', posts[0]);
  }

  // mockPosts 假数据
  const mockPosts = [
    {
      id: '1',
      author: {
        username: 'elonmusk',
        displayName: 'Elon Musk',
        avatar: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png',
        isVerified: true,
      },
      content: 'Just launched Starship! 🚀\n#SpaceX',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      likes: 12345,
      comments: 420,
      retweets: 888,
      isLiked: false,
      isRetweeted: false,
      commentsList: [
        {
          id: 'c1',
          author: { username: 'nasa', displayName: 'NASA', avatar: '', isVerified: true },
          content: 'Congrats! Looking forward to Mars! 🔴',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
        },
      ],
    },
    {
      id: '2',
      author: {
        username: 'jack',
        displayName: 'jack',
        avatar: '',
        isVerified: true,
      },
      content: 'Love seeing the community build cool stuff. #opensource',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      likes: 2345,
      comments: 12,
      retweets: 77,
      isLiked: true,
      isRetweeted: true,
      commentsList: [
        {
          id: 'c2',
          author: { username: 'devguy', displayName: 'Dev Guy', avatar: '', isVerified: false },
          content: 'Open source FTW! 💻',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5).toISOString(),
        },
      ],
    },
    {
      id: '3',
      author: {
        username: 'catgirl',
        displayName: 'Cat Girl',
        avatar: '',
        isVerified: false,
      },
      content: '喵喵喵~ #可爱',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      likes: 666,
      comments: 3,
      retweets: 12,
      isLiked: false,
      isRetweeted: false,
      commentsList: [
        {
          id: 'c3',
          author: { username: 'doge', displayName: 'Doge', avatar: '', isVerified: false },
          content: '汪汪汪！',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7.5).toISOString(),
        },
      ],
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 桌面端始终显示发帖框，移动端不显示 */}
        {!isMobile && <CreatePost onPostCreated={handlePostCreated} forceLogin={!user} />}
        {/* 移动端发帖按钮由 MobileNav 负责，点击后 setShowPostModal(true) */}
        {/* 发帖 modal */}
        {isMobile && showPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-auto p-4">
              <CreatePost onPostCreated={post => { handlePostCreated(post); setShowPostModal(false); }} forceLogin={!user} />
              <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900" onClick={() => setShowPostModal(false)}>关闭</button>
            </div>
          </div>
        )}
        <div className="space-y-6 mt-6">
          {mockPosts.map(post => (
            <ErrorBoundary key={post.id}>
              <Post post={post} onDelete={handlePostDeleted} />
              {/* 评论区 */}
              {post.commentsList && post.commentsList.length > 0 && (
                <div className="ml-12 mt-2 space-y-2 border-l-2 border-blue-200 pl-4">
                  {post.commentsList.map(comment => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <img src={comment.author.avatar || '/default-avatar.png'} alt={comment.author.username} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-sm">{comment.author.displayName || comment.author.username}</div>
                        <div className="text-xs text-gray-400">{comment.content}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ErrorBoundary>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* 桌面端始终显示发帖框，移动端不显示 */}
      {!isMobile && <CreatePost onPostCreated={handlePostCreated} forceLogin={!user} />}
      {/* 移动端发帖按钮由 MobileNav 负责，点击后 setShowPostModal(true) */}
      {/* 发帖 modal */}
      {isMobile && showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg mx-auto p-4">
            <CreatePost onPostCreated={post => { handlePostCreated(post); setShowPostModal(false); }} forceLogin={!user} />
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-900" onClick={() => setShowPostModal(false)}>关闭</button>
          </div>
        </div>
      )}
      <div className="space-y-6 mt-6">
        {Array.isArray(posts) &&
          posts.map(post => (
            <ErrorBoundary key={post.id}>
              <Post post={post} onDelete={handlePostDeleted} />
            </ErrorBoundary>
          ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            {loadingMore ? '加载中...' : '加载更多'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Feed;
