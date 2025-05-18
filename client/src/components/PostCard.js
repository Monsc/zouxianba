import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import UserMention from './UserMention';

const PostCard = ({ post, onLike, onComment, onRepost, onBookmark }) => {
  const formatContent = (content) => {
    if (!content) return '';
    
    // 匹配 @用户 标签
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // 这是用户名部分
        const handle = part;
        return <UserMention key={index} handle={handle} />;
      }
      return part;
    });
  };

  return (
    <div className="post-card">
      <div className="post-card-header">
        <Link to={`/profile/${post.author.handle}`} className="post-author">
          <img src={post.author.avatar} alt={post.author.username} className="post-avatar" />
          <div className="post-author-info">
            <span className="post-author-name">{post.author.username}</span>
            <span className="post-author-handle">@{post.author.handle}</span>
          </div>
        </Link>
        <span className="post-time">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: zhCN })}
        </span>
      </div>

      <div className="post-content">
        {formatContent(post.content)}
      </div>

      {post.media && post.media.length > 0 && (
        <div className="post-media">
          {post.media.map((url, index) => (
            <img key={index} src={url} alt={`Post media ${index + 1}`} className="post-media-image" />
          ))}
        </div>
      )}

      <div className="post-actions">
        <button
          className={`post-action-button ${post.isLiked ? 'liked' : ''}`}
          onClick={() => onLike(post._id)}
        >
          <i className="fas fa-heart"></i>
          <span>{post.likes.length}</span>
        </button>

        <button
          className="post-action-button"
          onClick={() => onComment(post._id)}
        >
          <i className="fas fa-comment"></i>
          <span>{post.comments.length}</span>
        </button>

        <button
          className={`post-action-button ${post.isReposted ? 'reposted' : ''}`}
          onClick={() => onRepost(post._id)}
        >
          <i className="fas fa-retweet"></i>
          <span>{post.repostCount}</span>
        </button>

        <button
          className={`post-action-button ${post.isBookmarked ? 'bookmarked' : ''}`}
          onClick={() => onBookmark(post._id)}
        >
          <i className="fas fa-bookmark"></i>
        </button>
      </div>
    </div>
  );
};

export default PostCard; 