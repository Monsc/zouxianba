import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';
import { FollowService } from '../services/FollowService';
import { Button } from '../components/Button';
import { Feed } from '../components/Feed';
import { PostCard } from '../components/PostCard';
import ReportModal from '../components/ReportModal';
import MainLayout from '../components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Mail, UserPlus, UserCheck, MoreHorizontal, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';

export const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.getProfile(username);
        setProfile(data);
        setIsFollowing(data.isFollowing);
        setPosts(data.posts);
      } catch (error) {
        error('Failed to load profile');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, error, navigate]);

  useEffect(() => {
    if (currentUser && profile) {
      setIsBlocked(Array.isArray(currentUser.blocked) && currentUser.blocked.includes(profile._id));
    }
  }, [currentUser, profile]);

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      if (isFollowing) {
        await FollowService.unfollowUser(username);
        setIsFollowing(false);
        success('Unfollowed successfully');
      } else {
        await FollowService.followUser(username);
        setIsFollowing(true);
        success('Followed successfully');
      }
    } catch (error) {
      error(error.message || 'Operation failed');
    }
  };

  const handleLike = async postId => {
    setPosts(
      posts.map(p =>
        p._id === postId
          ? {
              ...p,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
              liked: !p.liked,
            }
          : p
      )
    );
  };

  const handleBlock = async () => {
    if (!profile?._id) return;
    try {
      if (isBlocked) {
        await apiService.unblockUser(profile._id);
        setIsBlocked(false);
      } else {
        await apiService.blockUser(profile._id);
        setIsBlocked(true);
      }
    } catch (err) {
      // 可选：错误提示
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">加载中...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <MainLayout>
      <>
        {/* 封面图 */}
        <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
          {profile.cover && <img src={profile.cover} alt="封面" className="w-full h-full object-cover" />}
          {/* 头像悬浮 */}
          <div className="absolute left-6 -bottom-12 z-10">
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-background object-cover shadow-lg"
            />
          </div>
          {/* 右上角按钮 */}
          <div className="absolute right-6 top-6 flex gap-2 z-10">
            {currentUser && currentUser.username === username ? (
              <Button size="sm" variant="outline" onClick={() => navigate('/settings/profile')}>
                <Edit className="w-4 h-4 mr-1" /> 编辑资料
              </Button>
            ) : currentUser && (
              <>
                <Button size="sm" variant={isFollowing ? 'secondary' : 'primary'} onClick={handleFollow}>
                  {isFollowing ? <UserCheck className="w-4 h-4 mr-1" /> : <UserPlus className="w-4 h-4 mr-1" />}
                  {isFollowing ? '已关注' : '关注'}
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="w-4 h-4 mr-1" /> 私信
                </Button>
                <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
              </>
            )}
          </div>
        </div>
        {/* 个人信息区 */}
        <div className="pt-16 px-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</span>
                {profile.isVerified && <span className="text-blue-500">✔</span>}
              </div>
              <div className="text-gray-500">@{profile.username}</div>
              <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                {profile.bio && <span>{profile.bio}</span>}
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
                {profile.website && <span className="flex items-center gap-1"><LinkIcon className="w-4 h-4" />{profile.website}</span>}
                {profile.createdAt && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />加入于 {new Date(profile.createdAt).toLocaleDateString()}</span>}
              </div>
            </div>
            <div className="flex gap-4">
              <span>关注 <span className="font-bold">{profile.followingCount}</span></span>
              <span>粉丝 <span className="font-bold">{profile.followerCount}</span></span>
            </div>
          </div>
        </div>
        {/* Tab栏和内容 */}
        <div className="border-b border-border px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="posts">推文</TabsTrigger>
              <TabsTrigger value="replies">回复</TabsTrigger>
              <TabsTrigger value="media">媒体</TabsTrigger>
              <TabsTrigger value="likes">喜欢</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {/* Tab内容 */}
        <div className="px-6 py-4">
          {activeTab === 'posts' && <Feed username={username} />}
          {activeTab === 'replies' && <div className="text-center text-muted-foreground py-12">暂未开放</div>}
          {activeTab === 'media' && <div className="text-center text-muted-foreground py-12">暂未开放</div>}
          {activeTab === 'likes' && <div className="text-center text-muted-foreground py-12">暂未开放</div>}
        </div>
      </>
    </MainLayout>
  );
};

export default Profile;
