import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { UserPlus, UserMinus, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileData, postsData] = await Promise.all([
        apiService.getUserProfile(username),
        apiService.getUserPosts(username)
      ]);
      setProfile(profileData);
      setPosts(postsData);
    } catch (error) {
      showToast('获取用户信息失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      showToast('请先登录', 'error');
      return;
    }

    try {
      if (profile.isFollowing) {
        await apiService.unfollowUser(profile._id);
        showToast('已取消关注');
      } else {
        await apiService.followUser(profile._id);
        showToast('关注成功');
      }
      setProfile(prev => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
      }));
    } catch (error) {
      showToast('操作失败，请稍后重试', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8 text-gray-500">
        用户不存在
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 封面图 */}
      <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
        {profile.coverImage && (
          <img
            src={profile.coverImage}
            alt="封面"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 个人信息 */}
      <div className="px-4">
        <div className="flex justify-between items-start -mt-16 mb-4">
          <div className="flex items-end space-x-4">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900"
            />
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                @{profile.handle}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {currentUser && currentUser._id !== profile._id ? (
              <Button
                variant={profile.isFollowing ? 'outline' : 'default'}
                onClick={handleFollow}
              >
                {profile.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    取消关注
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    关注
                  </>
                )}
              </Button>
            ) : currentUser && currentUser._id === profile._id ? (
              <Link to="/settings">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  编辑资料
                </Button>
              </Link>
            ) : null}
          </div>
        </div>

        {profile.bio && (
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {profile.bio}
          </p>
        )}

        {/* 统计信息 */}
        <div className="flex space-x-4 mb-4">
          <Link
            to={`/profile/${profile.username}/following`}
            className="text-gray-700 dark:text-gray-300 hover:underline"
          >
            <span className="font-bold">{profile.followingCount}</span>{' '}
            关注
          </Link>
          <Link
            to={`/profile/${profile.username}/followers`}
            className="text-gray-700 dark:text-gray-300 hover:underline"
          >
            <span className="font-bold">{profile.followersCount}</span>{' '}
            粉丝
          </Link>
          <span className="text-gray-700 dark:text-gray-300">
            <span className="font-bold">{profile.postsCount}</span>{' '}
            帖子
          </span>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex space-x-8">
            <button
              className={cn(
                'py-4 border-b-2 font-medium text-sm',
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
              onClick={() => setActiveTab('posts')}
            >
              帖子
            </button>
            <button
              className={cn(
                'py-4 border-b-2 font-medium text-sm',
                activeTab === 'media'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
              onClick={() => setActiveTab('media')}
            >
              媒体
            </button>
            <button
              className={cn(
                'py-4 border-b-2 font-medium text-sm',
                activeTab === 'likes'
                  ? 'border-blue-500 text-blue-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
              onClick={() => setActiveTab('likes')}
            >
              喜欢
            </button>
          </div>
        </div>
      </div>

      {/* 内容列表 */}
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {posts.map(post => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
}
