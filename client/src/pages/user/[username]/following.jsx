import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { toast } from 'react-hot-toast';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Pagination from '@/components/common/Pagination';

const FollowingPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取关注列表
  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${username}/following?page=${currentPage}&limit=20`);
      setFollowing(response.data.following);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.message || '加载关注列表失败');
      toast.error('加载关注列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理关注/取消关注
  const handleFollow = async (userId, isFollowing) => {
    try {
      if (isFollowing) {
        await api.delete(`/users/${userId}/follow`);
      } else {
        await api.post(`/users/${userId}/follow`);
      }

      // 更新本地状态
      setFollowing(prevFollowing =>
        prevFollowing.map(user =>
          user._id === userId ? { ...user, isFollowing: !isFollowing } : user
        )
      );

      toast.success(isFollowing ? '已取消关注' : '关注成功');
    } catch (err) {
      toast.error('操作失败，请重试');
    }
  };

  // 页面加载时获取数据
  useEffect(() => {
    if (username) {
      fetchFollowing();
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
          action={<Button onClick={() => router.reload()}>重试</Button>}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* 页面标题 */}
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">{username} 的关注</h1>
          </div>

          {/* 关注列表 */}
          <div className="divide-y">
            {following.length > 0 ? (
              following.map(user => (
                <div key={user._id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* 头像 */}
                    <img
                      src={user.avatar || '/default-avatar.png'}
                      alt={user.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    {/* 用户信息 */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{user.username}</h3>
                        {user.isVerified && (
                          <span className="text-blue-500">
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
                      {user.bio && <p className="text-sm text-gray-500 mt-1">{user.bio}</p>}
                    </div>
                  </div>

                  {/* 关注按钮 */}
                  {currentUser && currentUser._id !== user._id && (
                    <Button
                      variant={user.isFollowing ? 'secondary' : 'primary'}
                      onClick={() => handleFollow(user._id, user.isFollowing)}
                    >
                      {user.isFollowing ? '取消关注' : '关注'}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6">
                <EmptyState title="暂无关注" description="该用户还没有关注任何人" />
              </div>
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default FollowingPage;
