import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiService } from '../services/api';
import { Button } from '../components/Button';
import { Feed } from '../components/Feed';
import { PostCard } from '../components/PostCard';
import ReportModal from '../components/ReportModal';

export const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
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
        addToast('Failed to load profile', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, addToast, navigate]);

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
        await apiService.unfollowUser(username);
        setIsFollowing(false);
        addToast('Unfollowed successfully', 'success');
      } else {
        await apiService.followUser(username);
        setIsFollowing(true);
        addToast('Followed successfully', 'success');
      }
    } catch (error) {
      addToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleLike = async (postId) => {
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
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              @{profile.handle}
            </p>
          </div>
          {currentUser && currentUser.username !== username && (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? 'secondary' : 'primary'}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
        <div className="mt-4 flex space-x-4">
          <div>
            <span className="font-bold text-gray-900 dark:text-white">
              {profile.followersCount}
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-400">Followers</span>
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">
              {profile.followingCount}
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-400">Following</span>
          </div>
        </div>
        {profile.bio && (
          <p className="mt-4 text-gray-600 dark:text-gray-400">{profile.bio}</p>
        )}
      </div>
      <Feed username={username} />
      <div className="profile-posts">
        {posts.map(post => (
          <PostCard key={post._id} post={post} onLike={() => handleLike(post._id)} />
        ))}
      </div>
      {!currentUser && (
        <div className="flex gap-2 mt-2">
          <button className="btn btn-secondary" onClick={() => setShowReport(true)}>
            举报
          </button>
          <button
            className={`btn ${isBlocked ? 'btn-error' : 'btn-secondary'}`}
            onClick={handleBlock}
          >
            {isBlocked ? '取消屏蔽' : '屏蔽'}
          </button>
        </div>
      )}
      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetUser={profile._id}
      />
    </div>
  );
};

export default Profile;
