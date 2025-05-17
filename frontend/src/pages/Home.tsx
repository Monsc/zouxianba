import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PostCard } from '../components/PostCard';
import { CreatePost } from '../components/CreatePost';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  id: string;
  content: string;
  media?: string;
  author: {
    id: string;
    username: string;
    handle: string;
    avatar: string;
  };
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch posts from API
    // This is mock data for now
    setPosts([
      {
        id: '1',
        content: 'Just launched my new project! 🚀',
        author: {
          id: '1',
          username: 'John Doe',
          handle: 'johndoe',
          avatar: 'https://via.placeholder.com/150',
        },
        createdAt: new Date(),
        likes: 42,
        comments: 12,
        isLiked: false,
      },
      {
        id: '2',
        content: 'Beautiful day for coding! ☀️',
        media: 'https://via.placeholder.com/600x400',
        author: {
          id: '2',
          username: 'Jane Smith',
          handle: 'janesmith',
          avatar: 'https://via.placeholder.com/150',
        },
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        likes: 24,
        comments: 8,
        isLiked: true,
      },
    ]);
    setIsLoading(false);
  }, []);

  const handleCreatePost = async (content: string, media?: File) => {
    // TODO: Implement post creation
    console.log('Creating post:', { content, media });
  };

  const handleLike = async (postId: string) => {
    // TODO: Implement like functionality
    console.log('Liking post:', postId);
  };

  const handleComment = async (postId: string) => {
    // TODO: Implement comment functionality
    console.log('Commenting on post:', postId);
  };

  return (
    <div className="app-container">
      <Header />
      
      <main className="main-content">
        {isLoading ? (
          <div className="container">Loading...</div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                {...post}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </>
        )}
      </main>

      {user && <CreatePost onSubmit={handleCreatePost} />}
      <BottomNav />
    </div>
  );
};

export default Home; 