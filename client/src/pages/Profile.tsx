import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, getUserPosts, followUser, blockUser, unblockUser } from '../services/api';
import PostCard from '../components/PostCard';
import ReportModal from '../components/ReportModal';

interface User {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  followers: number;
  following: number;
  isFollowing: boolean;
}

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

function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [showReport, setShowReport] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }
    Promise.all([
      getUserProfile(userId!),
      getUserPosts(userId!)
    ]).then(([profile, posts]) => {
      setUser(profile as User);
      // 兼容后端返回的 _id 字段
      const postsWithId = (posts as any[]).map(post => ({ ...post, id: post._id }));
      setPosts(postsWithId as Post[]);
      setIsLoading(false);
    }).catch(() => {
      setError('Failed to load profile.');
      setIsLoading(false);
    });
  }, [userId, navigate]);

  useEffect(() => {
    if (currentUser && user) {
      setIsBlocked(Array.isArray((currentUser as any).blocked) && (currentUser as any).blocked.includes(user._id));
    }
  }, [currentUser, user]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      await followUser(user._id);
      setUser({
        ...user,
        followers: user.isFollowing ? user.followers - 1 : user.followers + 1,
        isFollowing: !user.isFollowing
      });
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  const handleLike = async (postId: string) => {
    setPosts(posts.map(p => 
      p._id === postId ? {
        ...p,
        likes: p.liked ? p.likes - 1 : p.likes + 1,
        liked: !p.liked
      } : p
    ));
  };

  const handleBlock = async () => {
    if (!user) return;
    try {
      if (isBlocked) {
        await unblockUser(user._id);
        setIsBlocked(false);
      } else {
        await blockUser(user._id);
        setIsBlocked(true);
      }
    } catch (err) {
      // 可选：错误提示
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-error">{error || 'User not found'}</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === user._id;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-cover" />
        <div className="profile-info">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.username}
            className="profile-avatar"
          />
          <div className="profile-details">
            <h1 className="profile-name">{user.username}</h1>
            <p className="profile-handle">@{user.handle}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            <div className="profile-meta">
              {user.location && (
                <span className="profile-location">
                  <i className="icon-location" />
                  {user.location}
                </span>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-website"
                >
                  <i className="icon-link" />
                  {user.website}
                </a>
              )}
            </div>
            <div className="profile-stats">
              <span>
                <strong>{user.following}</strong> Following
              </span>
              <span>
                <strong>{user.followers}</strong> Followers
              </span>
            </div>
            {!isOwnProfile && (
              <div className="flex gap-2 mt-2">
                <button
                  className={`btn ${user.isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={handleFollow}
                >
                  {user.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReport(true)}
                >
                  举报
                </button>
                <button
                  className={`btn ${isBlocked ? 'btn-error' : 'btn-secondary'}`}
                  onClick={handleBlock}
                >
                  {isBlocked ? '取消屏蔽' : '屏蔽'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/messages/${user._id}`)}
                >
                  发私信
                </button>
                <ReportModal open={showReport} onClose={() => setShowReport(false)} targetUser={user._id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-posts">
        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            onLike={() => handleLike(post._id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Profile; 