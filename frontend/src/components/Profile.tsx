import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PostCard } from './PostCard';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  username: string;
  handle: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  posts: number;
}

interface Post {
  id: string;
  content: string;
  media?: string;
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    // TODO: Fetch user data and posts
    // This is mock data for now
    setUser({
      id: userId || '1',
      username: 'John Doe',
      handle: 'johndoe',
      avatar: 'https://via.placeholder.com/150',
      bio: 'Software developer | Coffee lover | Tech enthusiast',
      followers: 1234,
      following: 567,
      posts: 42,
    });

    setPosts([
      {
        id: '1',
        content: 'Hello, world!',
        createdAt: new Date(),
        likes: 42,
        comments: 12,
        isLiked: false,
      },
      // Add more mock posts...
    ]);

    setIsLoading(false);
  }, [userId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow logic
  };

  if (isLoading || !user) {
    return <div className="container">Loading...</div>;
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="container">
      <div className="profile-header" style={{ padding: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <img
            src={user.avatar}
            alt={user.username}
            style={{ width: '120px', height: '120px', borderRadius: '50%' }}
          />
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{user.username}</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>@{user.handle}</p>
            {!isOwnProfile && (
              <button
                className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        <p style={{ marginBottom: '16px' }}>{user.bio}</p>

        <div style={{ display: 'flex', gap: '24px', color: 'var(--text-secondary)' }}>
          <div>
            <strong style={{ color: 'var(--text-color)' }}>{user.posts}</strong> Posts
          </div>
          <div>
            <strong style={{ color: 'var(--text-color)' }}>{user.followers}</strong> Followers
          </div>
          <div>
            <strong style={{ color: 'var(--text-color)' }}>{user.following}</strong> Following
          </div>
        </div>
      </div>

      <div className="posts-list">
        {posts.map(post => (
          <PostCard
            key={post.id}
            id={post.id}
            content={post.content}
            media={post.media}
            author={user}
            createdAt={post.createdAt}
            likes={post.likes}
            comments={post.comments}
            isLiked={post.isLiked}
            onLike={(id) => {
              // TODO: Implement like logic
              console.log('Liked post:', id);
            }}
            onComment={(id) => {
              // TODO: Implement comment logic
              console.log('Comment on post:', id);
            }}
          />
        ))}
      </div>
    </div>
  );
}; 