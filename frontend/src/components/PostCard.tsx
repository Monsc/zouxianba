import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
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
  isLiked?: boolean;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
}

export const PostCard = ({
  id,
  content,
  media,
  author,
  createdAt,
  likes,
  comments,
  isLiked = false,
  onLike,
  onComment,
}: PostCardProps) => {
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(likes);

  const handleLike = () => {
    if (onLike) {
      onLike(id);
      setIsLikedState(!isLikedState);
      setLikesCount(prev => isLikedState ? prev - 1 : prev + 1);
    }
  };

  return (
    <article className="post-card fade-in">
      <div className="post-header">
        <img 
          className="avatar" 
          src={author.avatar} 
          alt={author.username} 
        />
        <div className="post-info">
          <span className="username">{author.username}</span>
          <span className="handle">@{author.handle}</span>
          <span className="post-time">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      <div className="post-content">
        {content}
      </div>

      {media && (
        <img 
          className="post-media" 
          src={media} 
          alt="Post media" 
        />
      )}

      <div className="post-actions">
        <button 
          className="action-button"
          onClick={() => onComment?.(id)}
        >
          <span>💬</span>
          <span>{comments}</span>
        </button>

        <button 
          className="action-button"
          onClick={handleLike}
        >
          <span style={{ color: isLikedState ? 'var(--like-color)' : 'inherit' }}>
            {isLikedState ? '❤️' : '🤍'}
          </span>
          <span>{likesCount}</span>
        </button>
      </div>
    </article>
  );
}; 