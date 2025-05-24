import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { useUserStore } from '../../store';
import MainLayout from '@/components/layout/MainLayout';
import Button from '@/components/common/Button';
import Tag from '@/components/common/Tag';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Pagination from '@/components/common/Pagination';

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await apiService.getUserProfile(username);
        const userPosts = await apiService.getUserPosts(userData._id);
        setProfile(userData);
        setPosts(userPosts.posts || []);
        setTotalPages(userPosts.totalPages);
        setIsFollowing(userData.isFollowing);
        setFollowersCount(userData.followersCount);
        setFollowingCount(userData.followingCount);
      } catch (err) {
        setError('用户不存在或加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) return <div className="text-center py-10">加载中...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!profile) return null;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <img src={profile.avatar || '/default-avatar.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2" />
            <div className="flex-1">
              <h2 className="text-xl font-bold">{profile.name || profile.username}</h2>
              <p className="text-gray-500">@{profile.username}</p>
              {profile.bio && <p className="mt-2 text-gray-700 dark:text-gray-300">{profile.bio}</p>}
              <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                <span>关注 <Link to={`/user/${profile.username}/following`} className="hover:underline">{profile.followingCount || 0}</Link></span>
                <span>粉丝 <Link to={`/user/${profile.username}/followers`} className="hover:underline">{profile.followersCount || 0}</Link></span>
              </div>
            </div>
            {currentUser && currentUser.username === profile.username && (
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white font-semibold"
                onClick={() => navigate('/edit-profile')}
              >
                编辑资料
              </button>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">动态</h3>
          {posts.length === 0 ? (
            <div className="text-gray-500">暂无动态</div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="border-b py-4">
                <div className="font-semibold">{post.content}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={profile.avatar || '/default-avatar.png'}
                    alt={profile.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="font-medium">{profile.username}</div>
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

export default UserProfilePage;
