import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Pagination from '@/components/common/Pagination';

const UserProfile = () => {
  const navigate = useNavigate();
  const { username } = navigate.location.pathname.split('/').pop();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // 获取用户信息和帖子列表
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userData, postsData] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/posts?page=${currentPage}&limit=10`),
      ]);

      setUser(userData.data);
      setPosts(postsData.data.posts);
      setTotalPages(postsData.data.totalPages);
      setIsFollowing(userData.data.isFollowing);
      setFollowersCount(userData.data.followersCount);
      setFollowingCount(userData.data.followingCount);
    } catch (err) {
      setError(err.message || '加载用户信息失败');
      toast.error('加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 关注/取消关注用户
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${user._id}/follow`);
        setFollowersCount(prev => prev - 1);
      } else {
        await api.post(`/users/${user._id}/follow`);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? '已取消关注' : '关注成功');
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  // 页面加载时获取数据
  React.useEffect(() => {
    if (username) {
      fetchUserData();
    }
  }, [username, currentPage]);

  if (loading) {
    return (
      <MainLayout>
        <LoadingOverlay isLoading={true} />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <ErrorState
          title="加载失败"
          description={error}
          action={<Button onClick={() => navigate(-1)}>重试</Button>}
        />
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <EmptyState
          title="用户不存在"
          description="该用户可能已被删除或不存在"
          action={<Button onClick={() => navigate('/')}>返回首页</Button>}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        {/* 用户信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* 头像 */}
            <div className="relative">
              <img
                src={user.avatar || '/default-avatar.png'}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              {user.isVerified && (
                <span className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
                {currentUser && currentUser._id !== user._id && (
                  <Button variant={isFollowing ? 'secondary' : 'primary'} onClick={handleFollow}>
                    {isFollowing ? '取消关注' : '关注'}
                  </Button>
                )}
              </div>

              {/* 用户统计 */}
              <div className="flex space-x-6 mt-4">
                <div className="text-center">
                  <div className="text-xl font-semibold">{posts.length}</div>
                  <div className="text-sm text-gray-500">动态</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{followersCount}</div>
                  <div className="text-sm text-gray-500">粉丝</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold">{followingCount}</div>
                  <div className="text-sm text-gray-500">关注</div>
                </div>
              </div>

              {/* 用户简介 */}
              {user.bio && <p className="mt-4 text-gray-600">{user.bio}</p>}

              {/* 用户标签 */}
              {user.tags && user.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.tags.map(tag => (
                    <Tag key={tag} variant="primary">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 用户动态列表 */}
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <p className="text-gray-800 mb-4">{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`图片 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-gray-500">
                  <button className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span>{post.likesCount}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>{post.commentsCount}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span>{post.sharesCount}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="暂无动态" description="该用户还没有发布任何动态" />
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserProfile;
