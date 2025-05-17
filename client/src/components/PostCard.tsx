import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

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
  isLiked: boolean;
}

interface PostCardProps {
  post: Post;
  onLike: () => void;
}

function PostCard({ post, onLike }: PostCardProps) {
  const navigate = useNavigate();

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <article className="post-card" onClick={handlePostClick}>
      <div className="post-header">
        <img
          src={post.author.avatar || '/default-avatar.png'}
          alt={post.author.username}
          className="avatar"
          onClick={handleAuthorClick}
        />
        <div className="post-meta">
          <div className="post-author">
            <span className="username" onClick={handleAuthorClick}>
              {post.author.username}
            </span>
            <span className="handle">@{post.author.handle}</span>
          </div>
          <span className="post-time">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Media ${index + 1}`}
                className="post-image"
              />
            ))}
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-button ${post.isLiked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
        >
          <i className="icon-heart" />
          <span>{post.likes}</span>
        </button>
        <button
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/post/${post.id}`);
          }}
        >
          <i className="icon-comment" />
          <span>{post.comments}</span>
        </button>
      </div>
    </article>
  );
}

export default PostCard; 